import mongoose from 'mongoose';

// One saved translation of one piece of text. Text is translated once, then read from here,
// so visitors never cause a paid request and pages stay fast.
const translationSchema = new mongoose.Schema(
  {
    // A site's ID, so one site can never read another's text. The exception is the templates'
    // own sample text, which is the same everywhere and saved once under a shared scope.
    scope: { type: String, required: true },
    language: { type: String, required: true },
    // A fingerprint of the original text: when the text changes, the old translation stops matching.
    hash: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

translationSchema.index({ scope: 1, language: 1, hash: 1 }, { unique: true });

export default mongoose.model('Translation', translationSchema);
