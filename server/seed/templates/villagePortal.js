import { branding, choice, contact, image, list, menu, section, text } from './fields.js';

// The sections every template shares. Templates differ only in their look (colours, fonts, design),
// which lives in the browser, so switching templates never loses or hides any content.
// Leader photos and names stay empty placeholders, so nothing can be mistaken for official information.

const person = (role, name) => ({ role, name, phone: '', photo: '' });
const scheme = (title) => ({ title, image: '' });
const event = (title, place) => ({ title, date: 'తేదీ', time: 'సమయం', place, image: '' });
const announcement = (category, title, details) => ({ category, title, details, date: '', phone: '', image: '' });

export const SOCIAL_PLATFORMS = ['facebook', 'youtube', 'instagram', 'whatsapp', 'x'];
export const ANNOUNCEMENT_CATEGORIES = ['birthday', 'wedding', 'business', 'jobs', 'others'];

export function villagePortalContent(brandColor) {
  return {
    sections: [
      branding(brandColor),
      section('topBar', 'Top bar', {
        state: text('State', 'ఆంధ్రప్రదేశ్'),
        district: text('District', 'జిల్లా'),
        mandal: text('Mandal', 'మండలం'),
        village: text('Village', 'గ్రామం'),
        social: list('Social media links', { platform: choice(SOCIAL_PLATFORMS), href: 'text' }, []),
      }),
      section('village', 'Banner', {
        name: text('Village name (Telugu)', 'మీ గ్రామం పేరు'),
        englishName: text('Village name (English)', 'Your Village Name'),
        subtitle: text('Subtitle', 'ఆంధ్రప్రదేశ్ ప్రభుత్వం'),
        location: text('Mandal, district, state', 'మండలం, జిల్లా, ఆంధ్రప్రదేశ్'),
        tagline: text('Tagline', 'మన గ్రామం | మన ప్రజలు | మన అభివృద్ధి | మన భవిష్యత్తు'),
        bannerImage: image('Banner background image'),
        emblem: image('Emblem (right side)'),
        leftLeaderPhoto: image('Left leader photo'),
        leftLeaderName: text('Left leader name', 'ముఖ్యమంత్రి పేరు'),
        leftLeaderTitle: text('Left leader title', 'ముఖ్యమంత్రి, ఆంధ్రప్రదేశ్'),
        rightLeaderPhoto: image('Right leader photo'),
        rightLeaderName: text('Right leader name', 'ప్రధానమంత్రి పేరు'),
        rightLeaderTitle: text('Right leader title', 'భారత ప్రధానమంత్రి'),
      }),
      menu([
        { label: 'హోమ్', href: '#top' },
        { label: 'పోస్టులు', href: '#posts' },
        { label: 'గ్రామం గురించి', href: '#posts' },
        { label: 'సంప్రదించండి', href: '#contact' },
      ]),
      section('members', 'Village elders and committee', {
        title: text('Section title', 'గ్రామ పెద్దలు & కమిటీ సభ్యులు'),
        people: list('Members', { role: 'text', name: 'text', phone: 'text', photo: 'image' }, [
          person('సర్పంచ్', 'సర్పంచ్ పేరు'),
          person('ఉప సర్పంచ్', 'ఉప సర్పంచ్ పేరు'),
          person('వార్డు సభ్యులు - 1', 'సభ్యుని పేరు'),
          person('వార్డు సభ్యులు - 2', 'సభ్యుని పేరు'),
          person('వార్డు సభ్యులు - 3', 'సభ్యుని పేరు'),
          person('గ్రామ కార్యదర్శి', 'కార్యదర్శి పేరు'),
        ]),
      }),
      section('schemes', 'Government schemes', {
        title: text('Section title', 'ప్రభుత్వ పథకాలు & అభివృద్ధి కార్యక్రమాలు'),
        centralTitle: text('Central schemes title', 'కేంద్ర ప్రభుత్వ పథకాలు'),
        centralLeaderPhoto: image('Central leader photo'),
        centralLeaderName: text('Central leader name', 'ప్రధానమంత్రి పేరు'),
        centralLeaderTitle: text('Central leader title', 'భారత ప్రధానమంత్రి'),
        central: list('Central schemes', { title: 'text', image: 'image' }, [
          scheme('PM Surya Ghar'),
          scheme('PM Awas Yojana'),
          scheme('PM-KISAN'),
          scheme('Ayushman Bharat'),
          scheme('MGNREGS'),
        ]),
        stateTitle: text('State schemes title', 'రాష్ట్ర ప్రభుత్వ పథకాలు'),
        stateLeaderPhoto: image('State leader photo'),
        stateLeaderName: text('State leader name', 'ముఖ్యమంత్రి పేరు'),
        stateLeaderTitle: text('State leader title', 'ముఖ్యమంత్రి, ఆంధ్రప్రదేశ్'),
        state: list('State schemes', { title: 'text', image: 'image' }, [
          scheme('రాష్ట్ర పథకం 1'),
          scheme('రాష్ట్ర పథకం 2'),
          scheme('రాష్ట్ర పథకం 3'),
          scheme('రాష్ట్ర పథకం 4'),
          scheme('రాష్ట్ర పథకం 5'),
        ]),
      }),
      // The tabs below this heading show only blog posts, so the section has just its two headings.
      // The key stays "about" so sites' saved headings carry straight over.
      section('about', 'Posts', {
        title: text('Section title', 'పోస్టులు (గ్రామ చరిత్ర, రోజువారీ అప్‌డేట్లు)'),
        recentTitle: text('Recent posts title', 'తాజా పోస్టులు'),
      }),
      section('events', 'Village events and programs', {
        title: text('Section title', 'గ్రామ కార్యక్రమాలు & ఈవెంట్లు'),
        items: list('Events', { title: 'text', date: 'text', time: 'text', place: 'text', image: 'image' }, [
          event('గ్రామ సభ', 'గ్రామ పంచాయతీ కార్యాలయం'),
          event('పరిశుభ్రత కార్యక్రమం', 'గ్రామ వీధులు'),
          event('ఉచిత వైద్య శిబిరం', 'ప్రాథమిక ఆరోగ్య కేంద్రం'),
          event('మొక్కల నాటే కార్యక్రమం', 'గ్రామ పరిధి'),
          event('తాగునీటి సౌకర్యం కార్యక్రమం', 'గ్రామ పరిధి'),
        ]),
      }),
      section('announcements', 'Announcements', {
        title: text('Section title', 'ప్రకటనలు'),
        subtitle: text('Subtitle', 'పుట్టినరోజులు, వివాహాలు, వ్యాపార ప్రకటనలు మరియు ఇతరాలు'),
        items: list(
          'Announcements',
          {
            category: choice(ANNOUNCEMENT_CATEGORIES),
            title: 'text',
            details: 'textarea',
            date: 'text',
            phone: 'text',
            image: 'image',
          },
          [
            announcement('birthday', 'పుట్టినరోజు శుభాకాంక్షలు', 'గ్రామ పెద్దలు మరియు గ్రామస్తుల తరఫున శుభాకాంక్షలు.'),
            announcement('wedding', 'వివాహ శుభాకాంక్షలు', 'నూతన దంపతులకు శుభాకాంక్షలు.'),
            announcement('business', 'నమూనా వ్యాపార ప్రకటన', 'మీ దుకాణం లేదా సేవల వివరాలు.'),
            announcement('jobs', 'ఉద్యోగ అవకాశం', 'ఉద్యోగ వివరాలు మరియు సంప్రదింపు సమాచారం.'),
            announcement('others', 'ఇతర ప్రకటన', 'ఇతర సమాచారం ఇక్కడ.'),
          ]
        ),
      }),
      contact('సంప్రదించండి', 'గ్రామ పంచాయతీ కార్యాలయం చిరునామా ఇక్కడ వ్రాయండి'),
      section('footer', 'Footer', {
        text: text('Footer title', 'మీ గ్రామం పేరు'),
        tagline: text('Footer tagline', 'మన గ్రామం... మన అభివృద్ధి...'),
      }),
    ],
  };
}
