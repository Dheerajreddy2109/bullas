const URL = 'https://translation.googleapis.com/language/translate/v2';

export const hasTranslateKey = () => Boolean(process.env.GOOGLE_TRANSLATE_KEY);

// format is 'text' for plain text, or 'html' for blog bodies, so tags and links survive.
// No source language is sent: Google detects it for each piece, because one site can mix languages.
// The key goes in a header, not the address, so it can't end up in a log.
export async function googleTranslate(strings, target, format) {
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-goog-api-key': process.env.GOOGLE_TRANSLATE_KEY },
    body: JSON.stringify({ q: strings, target, format }),
    signal: AbortSignal.timeout(30000),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`Google Translate answered ${res.status}: ${data?.error?.status ?? 'unknown error'}`);
  return data.data.translations.map((item) => item.translatedText);
}
