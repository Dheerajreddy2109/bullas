import { branding, contact, image, list, menu, section, text, textarea } from './fields.js';

export default {
  name: 'Business Starter',
  slug: 'business-starter',
  description: 'A clean, professional site for a company, with services and contact details.',
  defaultContent: {
    sections: [
      branding('#1d4ed8'),
      section('hero', 'Banner', {
        title: text('Business name', 'Your Business Name'),
        subtitle: text('Tagline', 'A short line about what your business does'),
        image: image('Banner image'),
      }),
      menu([
        { label: 'Home', href: '#top' },
        { label: 'Services', href: '#services' },
        { label: 'About', href: '#about' },
        { label: 'Contact', href: '#contact' },
      ]),
      section('services', 'Services', {
        title: text('Section title', 'Our Services'),
        items: list('Services', { title: 'text', description: 'textarea', image: 'image' }, [
          { title: 'Service One', description: 'Describe this service.', image: '' },
          { title: 'Service Two', description: 'Describe this service.', image: '' },
          { title: 'Service Three', description: 'Describe this service.', image: '' },
        ]),
      }),
      section('about', 'About', {
        title: text('Section title', 'About Us'),
        text: textarea('About text', 'Tell visitors about your business and what makes it different.'),
        image: image('About image'),
      }),
      contact(),
      section('footer', 'Footer', {
        text: text('Footer text', 'Your Business Name'),
      }),
    ],
  },
};
