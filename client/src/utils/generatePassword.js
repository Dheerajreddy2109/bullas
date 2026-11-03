// Uses the browser's secure random source, because Math.random can be predicted.
// Similar-looking characters like l, 1, O and 0 are left out, so passwords are easy to read out.
export function generatePassword(length = 16) {
  const letters = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789'
  const values = crypto.getRandomValues(new Uint32Array(length))
  return Array.from(values, (value) => letters[value % letters.length]).join('')
}
