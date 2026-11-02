import { branding, contact, image, list, menu, section, text, textarea } from './fields.js';

export default {
  name: 'Local Shop',
  slug: 'local-shop',
  description: 'A bright site for a neighbourhood shop, with offers and products.',
  defaultContent: {
    sections: [
      branding('#c2410c'),
      section('hero', 'Banner', {
        title: text('Shop name', 'Your Shop Name'),
        subtitle: text('Tagline', 'Fresh stock and friendly service, close to home'),
        image: image('Banner image'),
      }),
      menu([
        { label: 'Home', href: '#top' },
        { label: 'Offers', href: '#offers' },
        { label: 'Products', href: '#products' },
        { label: 'About', href: '#about' },
        { label: 'Contact', href: '#contact' },
      ]),
      section('offers', 'Offers', {
        title: text('Section title', "This Week's Offers"),
        items: list('Offers', { title: 'text', description: 'textarea', image: 'image' }, [
          { title: 'Offer One', description: 'Describe this offer.', image: '' },
          { title: 'Offer Two', description: 'Describe this offer.', image: '' },
          { title: 'Offer Three', description: 'Describe this offer.', image: '' },
          { title: 'Offer Four', description: 'Describe this offer.', image: '' },
        ]),
      }),
      section('products', 'Products', {
        title: text('Section title', 'Our Products'),
        items: list('Products', { title: 'text', description: 'textarea', image: 'image' }, [
          { title: 'Product One', description: 'Price or short details.', image: '' },
          { title: 'Product Two', description: 'Price or short details.', image: '' },
          { title: 'Product Three', description: 'Price or short details.', image: '' },
          { title: 'Product Four', description: 'Price or short details.', image: '' },
        ]),
      }),
      section('about', 'About', {
        title: text('Section title', 'About Our Shop'),
        text: textarea('About text', 'Tell customers about your shop and your opening hours.'),
        image: image('Shop photo'),
      }),
      contact(),
      section('footer', 'Footer', {
        text: text('Footer text', 'Your Shop Name'),
      }),
    ],
  },
};
