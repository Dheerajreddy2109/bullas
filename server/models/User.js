import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    // Lowercase so Dheeraj@x.com and dheeraj@x.com can't become two accounts.
    email: { type: String, required: true, lowercase: true, trim: true },
    // select: false keeps the hash out of query results, so an API can't leak it by accident.
    passwordHash: { type: String, required: true, select: false },
    // builder: staff who create and edit only the sites assigned to them.
    role: { type: String, enum: ['superadmin', 'builder', 'siteowner'], required: true },
    siteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Site',
      // An owner without a site, or a super admin tied to one, would break tenant checks.
      required() {
        return this.role === 'siteowner';
      },
      validate: {
        validator(value) {
          return this.role === 'siteowner' || !value;
        },
        message: 'Only site owners can have a siteId',
      },
    },
    twoFactorEnabled: { type: Boolean, default: false },
    // Encrypted with TWO_FACTOR_KEY, and kept out of query results like the password hash.
    twoFactorSecret: { type: String, select: false },
    // Held here until the first code proves the phone was set up correctly.
    twoFactorPendingSecret: { type: String, select: false },
    // Hashes only, so a stolen database doesn't reveal usable backup codes.
    twoFactorBackupCodes: { type: [String], select: false, default: undefined },
    // The last code's time slot, so the same code can't be used twice.
    twoFactorLastStep: { type: Number, select: false },
    // Set when someone else chose the password, so it stops being known to two people.
    mustChangePassword: { type: Boolean, default: false },
    // Lets the super admin lock an owner out without deleting their account or site.
    disabled: { type: Boolean, default: false },
    // Copied into every login token; raising it ends all existing logins at once.
    sessionVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Per site, not global: each site has its own login, so one person can own two sites.
userSchema.index({ siteId: 1, email: 1 }, { unique: true });

export default mongoose.model('User', userSchema);
