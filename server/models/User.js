import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    // Lowercase so Dheeraj@x.com and dheeraj@x.com can't become two accounts.
    email: { type: String, required: true, lowercase: true, trim: true },
    // select: false keeps the hash out of query results, so an API can't leak it by accident.
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['superadmin', 'siteowner'], required: true },
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
