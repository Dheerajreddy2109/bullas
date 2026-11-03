import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Site from '../../models/Site.js';
import User from '../../models/User.js';
import { passwordProblem } from '../utils/passwordRules.js';

function summarizeUser(user, siteCount = 0) {
  const { _id, name, email, role, disabled, mustChangePassword, twoFactorEnabled, createdAt } = user;
  return { _id, name, email, role, disabled, mustChangePassword, twoFactorEnabled, createdAt, siteCount };
}

// Builders only: the super admin's own account and site owners are managed elsewhere.
async function findBuilder(req, res) {
  if (!mongoose.isValidObjectId(req.params.userId)) {
    res.status(400).json({ error: 'Invalid user ID' });
    return null;
  }
  const user = await User.findOne({ _id: req.params.userId, role: 'builder' });
  if (!user) res.status(404).json({ error: 'User not found' });
  return user;
}

export async function listBuilders(req, res) {
  const builders = await User.find({ role: 'builder' }).sort({ createdAt: -1 });
  // One query for all counts, rather than one per builder.
  const counts = await Site.aggregate([
    { $match: { builderId: { $in: builders.map((builder) => builder._id) } } },
    { $group: { _id: '$builderId', total: { $sum: 1 } } },
  ]);
  const countFor = new Map(counts.map((item) => [item._id.toString(), item.total]));
  res.json(builders.map((builder) => summarizeUser(builder, countFor.get(builder._id.toString()))));
}

export async function getBuilder(req, res) {
  const user = await findBuilder(req, res);
  if (!user) return;
  res.json(summarizeUser(user, await Site.countDocuments({ builderId: user._id })));
}

export async function createBuilder(req, res) {
  const { name, email, temporaryPassword } = req.body ?? {};

  // Strings only: an object like { $ne: null } would act as a database operator.
  if ([name, email, temporaryPassword].some((field) => typeof field !== 'string')) {
    return res.status(400).json({ error: 'Please fill in every field' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: 'That email does not look valid' });
  }
  const problem = passwordProblem(temporaryPassword);
  if (problem) return res.status(400).json({ error: problem });

  try {
    const user = await User.create({
      name,
      email,
      passwordHash: await bcrypt.hash(temporaryPassword, 12),
      role: 'builder',
      // They choose their own, so the super admin stops knowing it.
      mustChangePassword: true,
    });
    res.status(201).json(summarizeUser(user));
  } catch (err) {
    // Admin-area accounts share one email space, so this also blocks reusing the super admin's email.
    if (err.code === 11000) {
      return res.status(409).json({ error: 'An admin account with that email already exists' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors).map((e) => e.message).join(', ') });
    }
    throw err;
  }
}

export async function resetBuilderPassword(req, res) {
  const problem = passwordProblem(req.body?.temporaryPassword);
  if (problem) return res.status(400).json({ error: problem });

  const user = await findBuilder(req, res);
  if (!user) return;

  user.passwordHash = await bcrypt.hash(req.body.temporaryPassword, 12);
  user.mustChangePassword = true;
  // Ends every existing login, in case the old password was why it needed resetting.
  user.sessionVersion = (user.sessionVersion ?? 0) + 1;
  await user.save();
  res.json(summarizeUser(user));
}

export async function setBuilderDisabled(req, res) {
  const { disabled } = req.body ?? {};
  if (typeof disabled !== 'boolean') {
    return res.status(400).json({ error: 'disabled must be true or false' });
  }

  const user = await findBuilder(req, res);
  if (!user) return;

  user.disabled = disabled;
  // Logs a disabled builder out at once instead of leaving a working session.
  if (disabled) user.sessionVersion = (user.sessionVersion ?? 0) + 1;
  await user.save();
  res.json(summarizeUser(user));
}
