// The languages a site can be read in, and the site's fixed wording in each one.
// Text the owner writes is translated by the server; this is everything else.
// Must match the server's SITE_LANGUAGES. Each name is in its own language, so readers can find theirs.
export const LANGUAGES = [
  { code: 'te', name: 'తెలుగు', locale: 'te-IN' },
  { code: 'en', name: 'English', locale: 'en-IN' },
  { code: 'ta', name: 'தமிழ்', locale: 'ta-IN' },
  { code: 'or', name: 'ଓଡ଼ିଆ', locale: 'or-IN' },
  { code: 'hi', name: 'हिन्दी', locale: 'hi-IN' },
  { code: 'ml', name: 'മലയാളം', locale: 'ml-IN' },
]
export const DEFAULT_LANGUAGE = 'te'

const LABELS = {
  te: {
    home: 'హోమ్', blog: 'వార్తలు', blogHeading: 'వార్తలు & పోస్టులు', empty: 'ఇంకా పోస్టులు లేవు.',
    viewAllPosts: 'అన్ని పోస్టులు చూడండి', showLess: 'తక్కువ చూపించు', menu: 'మెనూ',
    viewAllMembers: 'అందరు సభ్యులను చూడండి', viewAllCentral: 'అన్ని కేంద్ర పథకాలు', viewAllState: 'అన్ని రాష్ట్ర పథకాలు',
    viewAllAnnouncements: 'అన్ని ప్రకటనలు చూడండి', all: 'అన్నీ', follow: 'మమ్మల్ని అనుసరించండి',
    address: 'చిరునామా', phone: 'ఫోన్', email: 'ఈమెయిల్',
    cat_history: 'గ్రామ చరిత్ర', cat_daily: 'రోజువారీ అప్‌డేట్లు', cat_announcement: 'ప్రకటనలు', cat_gallery: 'ఫోటో గ్యాలరీ',
    ann_birthday: 'పుట్టినరోజులు', ann_wedding: 'వివాహాలు', ann_business: 'వ్యాపారం', ann_jobs: 'ఉద్యోగాలు', ann_others: 'ఇతరాలు',
    autoTranslated: 'ఈ పేజీ స్వయంచాలకంగా అనువదించబడింది; తప్పులు ఉండవచ్చు.', chooseLanguage: 'భాషను ఎంచుకోండి',
    chooseCategory: 'వర్గం ఎంచుకోండి', postMissing: 'ఈ పోస్ట్ అందుబాటులో లేదు.',
  },
  en: {
    home: 'Home', blog: 'News', blogHeading: 'News & Posts', empty: 'No posts yet.',
    viewAllPosts: 'View all posts', showLess: 'Show less', menu: 'Menu',
    viewAllMembers: 'View all members', viewAllCentral: 'All central schemes', viewAllState: 'All state schemes',
    viewAllAnnouncements: 'View all announcements', all: 'All', follow: 'Follow us',
    address: 'Address', phone: 'Phone', email: 'Email',
    cat_history: 'Village history', cat_daily: 'Daily updates', cat_announcement: 'Announcements', cat_gallery: 'Photo gallery',
    ann_birthday: 'Birthdays', ann_wedding: 'Weddings', ann_business: 'Business', ann_jobs: 'Jobs', ann_others: 'Others',
    autoTranslated: 'This page was translated automatically and may contain mistakes.', chooseLanguage: 'Choose language',
    chooseCategory: 'Choose a category', postMissing: 'This post is not available.',
  },
  ta: {
    home: 'முகப்பு', blog: 'செய்திகள்', blogHeading: 'செய்திகள் & பதிவுகள்', empty: 'இன்னும் பதிவுகள் இல்லை.',
    viewAllPosts: 'அனைத்து பதிவுகளையும் காண்க', showLess: 'குறைவாகக் காட்டு', menu: 'பட்டி',
    viewAllMembers: 'அனைத்து உறுப்பினர்களையும் காண்க', viewAllCentral: 'அனைத்து மத்திய திட்டங்கள்', viewAllState: 'அனைத்து மாநில திட்டங்கள்',
    viewAllAnnouncements: 'அனைத்து அறிவிப்புகளையும் காண்க', all: 'அனைத்தும்', follow: 'எங்களைப் பின்தொடரவும்',
    address: 'முகவரி', phone: 'தொலைபேசி', email: 'மின்னஞ்சல்',
    cat_history: 'கிராம வரலாறு', cat_daily: 'தினசரி செய்திகள்', cat_announcement: 'அறிவிப்புகள்', cat_gallery: 'புகைப்படத் தொகுப்பு',
    ann_birthday: 'பிறந்தநாள்', ann_wedding: 'திருமணம்', ann_business: 'வணிகம்', ann_jobs: 'வேலைவாய்ப்பு', ann_others: 'மற்றவை',
    autoTranslated: 'இந்தப் பக்கம் தானாக மொழிபெயர்க்கப்பட்டது; பிழைகள் இருக்கலாம்.', chooseLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    chooseCategory: 'வகையைத் தேர்ந்தெடுக்கவும்', postMissing: 'இந்தப் பதிவு கிடைக்கவில்லை.',
  },
  or: {
    home: 'ମୁଖ୍ୟ ପୃଷ୍ଠା', blog: 'ସମ୍ବାଦ', blogHeading: 'ସମ୍ବାଦ ଓ ପୋଷ୍ଟ', empty: 'ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ପୋଷ୍ଟ ନାହିଁ।',
    viewAllPosts: 'ସମସ୍ତ ପୋଷ୍ଟ ଦେଖନ୍ତୁ', showLess: 'କମ୍ ଦେଖାନ୍ତୁ', menu: 'ମେନୁ',
    viewAllMembers: 'ସମସ୍ତ ସଦସ୍ୟଙ୍କୁ ଦେଖନ୍ତୁ', viewAllCentral: 'ସମସ୍ତ କେନ୍ଦ୍ର ଯୋଜନା', viewAllState: 'ସମସ୍ତ ରାଜ୍ୟ ଯୋଜନା',
    viewAllAnnouncements: 'ସମସ୍ତ ଘୋଷଣା ଦେଖନ୍ତୁ', all: 'ସମସ୍ତ', follow: 'ଆମକୁ ଅନୁସରଣ କରନ୍ତୁ',
    address: 'ଠିକଣା', phone: 'ଫୋନ୍', email: 'ଇମେଲ୍',
    cat_history: 'ଗ୍ରାମ ଇତିହାସ', cat_daily: 'ଦୈନିକ ଅପଡେଟ୍', cat_announcement: 'ଘୋଷଣା', cat_gallery: 'ଫଟୋ ଗ୍ୟାଲେରୀ',
    ann_birthday: 'ଜନ୍ମଦିନ', ann_wedding: 'ବିବାହ', ann_business: 'ବ୍ୟବସାୟ', ann_jobs: 'ଚାକିରି', ann_others: 'ଅନ୍ୟାନ୍ୟ',
    autoTranslated: 'ଏହି ପୃଷ୍ଠା ସ୍ୱୟଂଚାଳିତ ଭାବରେ ଅନୁବାଦିତ; ଭୁଲ ରହିପାରେ।', chooseLanguage: 'ଭାଷା ବାଛନ୍ତୁ',
    chooseCategory: 'ଶ୍ରେଣୀ ବାଛନ୍ତୁ', postMissing: 'ଏହି ପୋଷ୍ଟ ଉପଲବ୍ଧ ନାହିଁ।',
  },
  hi: {
    home: 'होम', blog: 'समाचार', blogHeading: 'समाचार और पोस्ट', empty: 'अभी कोई पोस्ट नहीं है।',
    viewAllPosts: 'सभी पोस्ट देखें', showLess: 'कम दिखाएँ', menu: 'मेन्यू',
    viewAllMembers: 'सभी सदस्य देखें', viewAllCentral: 'सभी केंद्रीय योजनाएँ', viewAllState: 'सभी राज्य योजनाएँ',
    viewAllAnnouncements: 'सभी घोषणाएँ देखें', all: 'सभी', follow: 'हमें फ़ॉलो करें',
    address: 'पता', phone: 'फ़ोन', email: 'ईमेल',
    cat_history: 'ग्राम इतिहास', cat_daily: 'दैनिक अपडेट', cat_announcement: 'घोषणाएँ', cat_gallery: 'फ़ोटो गैलरी',
    ann_birthday: 'जन्मदिन', ann_wedding: 'विवाह', ann_business: 'व्यापार', ann_jobs: 'नौकरियाँ', ann_others: 'अन्य',
    autoTranslated: 'यह पृष्ठ स्वचालित रूप से अनुवादित है; इसमें गलतियाँ हो सकती हैं।', chooseLanguage: 'भाषा चुनें',
    chooseCategory: 'श्रेणी चुनें', postMissing: 'यह पोस्ट उपलब्ध नहीं है।',
  },
  ml: {
    home: 'ഹോം', blog: 'വാർത്തകൾ', blogHeading: 'വാർത്തകളും പോസ്റ്റുകളും', empty: 'ഇതുവരെ പോസ്റ്റുകളൊന്നുമില്ല.',
    viewAllPosts: 'എല്ലാ പോസ്റ്റുകളും കാണുക', showLess: 'കുറച്ച് കാണിക്കുക', menu: 'മെനു',
    viewAllMembers: 'എല്ലാ അംഗങ്ങളെയും കാണുക', viewAllCentral: 'എല്ലാ കേന്ദ്ര പദ്ധതികളും', viewAllState: 'എല്ലാ സംസ്ഥാന പദ്ധതികളും',
    viewAllAnnouncements: 'എല്ലാ അറിയിപ്പുകളും കാണുക', all: 'എല്ലാം', follow: 'ഞങ്ങളെ പിന്തുടരുക',
    address: 'വിലാസം', phone: 'ഫോൺ', email: 'ഇമെയിൽ',
    cat_history: 'ഗ്രാമ ചരിത്രം', cat_daily: 'ദൈനംദിന വാർത്തകൾ', cat_announcement: 'അറിയിപ്പുകൾ', cat_gallery: 'ഫോട്ടോ ഗാലറി',
    ann_birthday: 'ജന്മദിനം', ann_wedding: 'വിവാഹം', ann_business: 'ബിസിനസ്', ann_jobs: 'ജോലികൾ', ann_others: 'മറ്റുള്ളവ',
    autoTranslated: 'ഈ പേജ് സ്വയമേവ വിവർത്തനം ചെയ്തതാണ്; തെറ്റുകൾ ഉണ്ടാകാം.', chooseLanguage: 'ഭാഷ തിരഞ്ഞെടുക്കുക',
    chooseCategory: 'വിഭാഗം തിരഞ്ഞെടുക്കുക', postMissing: 'ഈ പോസ്റ്റ് ലഭ്യമല്ല.',
  },
}

export const labelsFor = (language) => LABELS[language] ?? LABELS[DEFAULT_LANGUAGE]
export const localeFor = (language) =>
  LANGUAGES.find((item) => item.code === language)?.locale ?? LANGUAGES[0].locale

// Browsers have no Odia calendar names, and quietly show English instead, so they're written out here.
const ODIA_MONTHS = ['ଜାନୁଆରୀ', 'ଫେବୃଆରୀ', 'ମାର୍ଚ୍ଚ', 'ଅପ୍ରେଲ', 'ମେ', 'ଜୁନ', 'ଜୁଲାଇ', 'ଅଗଷ୍ଟ', 'ସେପ୍ଟେମ୍ବର', 'ଅକ୍ଟୋବର', 'ନଭେମ୍ବର', 'ଡିସେମ୍ବର']
const ODIA_DAYS = ['ରବିବାର', 'ସୋମବାର', 'ମଙ୍ଗଳବାର', 'ବୁଧବାର', 'ଗୁରୁବାର', 'ଶୁକ୍ରବାର', 'ଶନିବାର']

// A date in the chosen language; withDay adds the day of the week.
export function formatDate(date, language, { withDay = false } = {}) {
  if (language === 'or') {
    const text = `${date.getDate()} ${ODIA_MONTHS[date.getMonth()]} ${date.getFullYear()}`
    return withDay ? `${text}, ${ODIA_DAYS[date.getDay()]}` : text
  }
  return new Intl.DateTimeFormat(localeFor(language), {
    ...(withDay && { weekday: 'long' }),
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}
