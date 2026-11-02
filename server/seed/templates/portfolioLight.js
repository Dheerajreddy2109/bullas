import { branding, contact, image, list, menu, section, text, textarea } from './fields.js';

export default {
  name: 'Portfolio Light',
  slug: 'portfolio-light',
  description: 'A calm, minimal site for one person to show their work.',
  defaultContent: {
    sections: [
      branding('#7c3aed'),
      section('hero', 'Banner', {
        title: text('Your name', 'Your Name'),
        subtitle: text('What you do', 'Designer, writer or photographer'),
        image: image('Portrait'),
      }),
      menu([
        { label: 'Work', href: '#work' },
        { label: 'About', href: '#about' },
        { label: 'Contact', href: '#contact' },
      ]),
      section('work', 'Work', {
        title: text('Section title', 'Selected Work'),
        items: list('Projects', { title: 'text', description: 'textarea', image: 'image' }, [
          { title: 'Project One', description: 'What you did and why it mattered.', image: '' },
          { title: 'Project Two', description: 'What you did and why it mattered.', image: '' },
          { title: 'Project Three', description: 'What you did and why it mattered.', image: '' },
          { title: 'Project Four', description: 'What you did and why it mattered.', image: '' },
        ]),
      }),
      section('about', 'About', {
        title: text('Section title', 'About Me'),
        text: textarea('About text', 'A few sentences about you and how you work.'),
        image: image('About image'),
      }),
      contact(),
      section('footer', 'Footer', {
        text: text('Footer text', 'Your Name'),
      }),
    ],
  },
};
