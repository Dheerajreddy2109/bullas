// Each field records its type and label, so Module 5 can generate the edit form from this data.
export const text = (label, value = '') => ({ type: 'text', label, value });
export const textarea = (label, value = '') => ({ type: 'textarea', label, value });
export const image = (label) => ({ type: 'image', label, value: '' });
export const color = (label, value) => ({ type: 'color', label, value });
export const list = (label, itemFields, value) => ({ type: 'list', label, itemFields, value });

export const section = (key, label, fields) => ({ key, label, fields });

export const branding = (brandColor) =>
  section('branding', 'Logo and brand colour', {
    logo: image('Logo'),
    brandColor: color('Brand colour', brandColor),
  });

export const menu = (items) =>
  section('menu', 'Menu', {
    items: list('Menu items', { label: 'text', href: 'text' }, items),
  });

export const contact = (title = 'Contact', address = 'Your address goes here') =>
  section('contact', 'Contact details', {
    title: text('Section title', title),
    address: textarea('Address', address),
    phone: text('Phone'),
    email: text('Email'),
  });
