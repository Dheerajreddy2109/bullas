// Returns the problem as a message, or null, so every route applies the same rules.
export function passwordProblem(password) {
  if (typeof password !== 'string' || password.length < 12) {
    return 'Password must be at least 12 characters';
  }
  // bcrypt ignores anything past 72 bytes, so a longer password would be weaker than it looks.
  if (Buffer.byteLength(password) > 72) {
    return 'Password must be at most 72 bytes';
  }
  return null;
}
