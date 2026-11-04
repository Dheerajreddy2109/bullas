import mongoose from 'mongoose';

// How many characters were sent for translation each month, across all sites,
// because Google's free allowance is for the whole account.
const translationUsageSchema = new mongoose.Schema({
  month: { type: String, required: true, unique: true },
  characters: { type: Number, default: 0 },
});

export default mongoose.model('TranslationUsage', translationUsageSchema);
