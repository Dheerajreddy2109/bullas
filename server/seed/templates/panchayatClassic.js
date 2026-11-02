import { branding, contact, image, list, menu, section, text, textarea } from './fields.js';

const person = (role, name) => ({ role, name, phone: '', photo: '' });
const scheme = (title) => ({ title, image: '' });
const notice = (title, date, place) => ({ title, date, place, image: '' });
const post = (title, date) => ({ title, date, image: '' });

// Sample names are obvious placeholders, and leader photos and emblems stay empty,
// so nothing here can be mistaken for a real panchayat's official information.
export default {
  name: 'Panchayat Classic',
  slug: 'panchayat-classic',
  description: 'A colourful Telugu village portal with members, schemes, notices and gallery.',
  defaultContent: {
    sections: [
      branding('#0b6b3a'),
      section('village', 'Village details', {
        name: text('Village name (Telugu)', 'మీ గ్రామం పేరు'),
        englishName: text('Village name (English)', 'Your Village Name'),
        location: text('Mandal, district, state', 'మండలం, జిల్లా, రాష్ట్రం'),
        tagline: text('Tagline', 'మన గ్రామం | మన ప్రజలు | మన అభివృద్ధి | మన గర్వం'),
      }),
      menu([
        { label: 'హోమ్', href: '#top' },
        { label: 'సభ్యులు', href: '#members' },
        { label: 'పథకాలు', href: '#schemes' },
        { label: 'గ్రామం గురించి', href: '#about' },
        { label: 'సంప్రదించండి', href: '#contact' },
      ]),
      section('members', 'Village elders and committee', {
        title: text('Section title', 'గ్రామ పెద్దలు & కమిటీ సభ్యులు'),
        people: list(
          'Members',
          { role: 'text', name: 'text', phone: 'text', photo: 'image' },
          [
            person('సర్పంచ్', 'సర్పంచ్ పేరు'),
            person('ఉప సర్పంచ్', 'ఉప సర్పంచ్ పేరు'),
            person('వార్డు సభ్యులు - 1', 'సభ్యుని పేరు'),
            person('వార్డు సభ్యులు - 2', 'సభ్యుని పేరు'),
            person('వార్డు సభ్యులు - 3', 'సభ్యుని పేరు'),
            person('గ్రామ కార్యదర్శి', 'కార్యదర్శి పేరు'),
          ]
        ),
      }),
      section('sarpanchMessage', 'Sarpanch message', {
        title: text('Section title', 'సర్పంచ్ సందేశం'),
        message: textarea('Message', 'మా గ్రామ వెబ్‌సైట్‌కు స్వాగతం. ఇక్కడ సర్పంచ్ సందేశం కనిపిస్తుంది.'),
        photo: image('Sarpanch photo'),
      }),
      section('schemes', 'Government schemes', {
        title: text('Section title', 'ప్రభుత్వ పథకాలు & అభివృద్ధి కార్యక్రమాలు'),
        centralTitle: text('Central schemes title', 'కేంద్ర ప్రభుత్వ పథకాలు'),
        central: list('Central schemes', { title: 'text', image: 'image' }, [
          scheme('PM Surya Ghar'),
          scheme('PM Awas Yojana'),
          scheme('PM-KISAN'),
          scheme('Ayushman Bharat'),
          scheme('MGNREGS'),
        ]),
        stateTitle: text('State schemes title', 'రాష్ట్ర ప్రభుత్వ పథకాలు'),
        state: list('State schemes', { title: 'text', image: 'image' }, [
          scheme('రాష్ట్ర పథకం 1'),
          scheme('రాష్ట్ర పథకం 2'),
          scheme('రాష్ట్ర పథకం 3'),
          scheme('రాష్ట్ర పథకం 4'),
        ]),
      }),
      section('about', 'Village information', {
        title: text('Section title', 'గ్రామ సమాచారం'),
        historyTitle: text('History title', 'గ్రామ చరిత్ర'),
        history: textarea('Village history', 'మీ గ్రామ చరిత్ర, సంస్కృతి మరియు ప్రత్యేకతలను ఇక్కడ వ్రాయండి.'),
        historyImage: image('History image'),
        infoTitle: text('Information title', 'గ్రామ వివరాలు'),
        info: textarea('Village information', 'జనాభా, ప్రధాన వృత్తులు, పాఠశాలలు మరియు ఇతర వివరాలు ఇక్కడ వ్రాయండి.'),
        infoImage: image('Information image'),
        latestTitle: text('Latest posts title', 'తాజా పోస్టులు'),
        latest: list('Latest posts', { title: 'text', date: 'text', image: 'image' }, [
          post('నమూనా పోస్ట్ 1', 'తేదీ'),
          post('నమూనా పోస్ట్ 2', 'తేదీ'),
          post('నమూనా పోస్ట్ 3', 'తేదీ'),
        ]),
      }),
      section('notices', 'Gram Sabha notices', {
        title: text('Section title', 'గ్రామ సభ నోటీసులు & వారపు అప్‌డేట్లు'),
        items: list('Notices', { title: 'text', date: 'text', place: 'text', image: 'image' }, [
          notice('గ్రామ సభ', 'తేదీ & సమయం', 'గ్రామ పంచాయతీ కార్యాలయం'),
          notice('పరిశుభ్రత కార్యక్రమం', 'తేదీ & సమయం', 'గ్రామ పరిధి'),
          notice('ఉచిత వైద్య శిబిరం', 'తేదీ & సమయం', 'ప్రాథమిక ఆరోగ్య కేంద్రం'),
          notice('మొక్కల నాటే కార్యక్రమం', 'తేదీ & సమయం', 'గ్రామ పరిధి'),
          notice('నీటి ట్యాంక్ శుభ్రత', 'తేదీ & సమయం', 'గ్రామ పరిధి'),
        ]),
      }),
      section('announcements', 'Announcements', {
        title: text('Section title', 'ప్రకటనలు'),
        items: list('Announcements', { title: 'text', date: 'text', place: 'text', image: 'image' }, [
          notice('నమూనా శుభాకాంక్షలు', 'తేదీ', 'పుట్టినరోజు / వివాహం'),
          notice('నమూనా వ్యాపార ప్రకటన', 'ఫోన్ నంబర్', 'వ్యాపారం'),
          notice('నమూనా అమ్మకం ప్రకటన', 'ఫోన్ నంబర్', 'ఇతరులు'),
        ]),
      }),
      section('gallery', 'Gallery', {
        title: text('Section title', 'ఫోటో గ్యాలరీ'),
        images: list('Photos', { caption: 'text', image: 'image' }, [
          { caption: 'గ్రామ దృశ్యం', image: '' },
          { caption: 'పండుగ వేడుకలు', image: '' },
          { caption: 'గ్రామ సభ', image: '' },
          { caption: 'అభివృద్ధి పనులు', image: '' },
        ]),
      }),
      contact('సంప్రదించండి', 'గ్రామ పంచాయతీ కార్యాలయం చిరునామా ఇక్కడ వ్రాయండి'),
      section('footer', 'Footer', {
        text: text('Footer text', 'మన గ్రామం... మన అభివృద్ధి...'),
      }),
    ],
  },
};
