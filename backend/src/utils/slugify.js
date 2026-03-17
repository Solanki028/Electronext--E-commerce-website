/**
 * Creates a URL-friendly slug from a string
 * @param {string} text
 * @returns {string}
 */
const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // spaces → dashes
    .replace(/[^\w\-]+/g, '')   // remove non-word chars
    .replace(/\-\-+/g, '-')     // collapse multiple dashes
    .replace(/^-+/, '')         // trim leading dash
    .replace(/-+$/, '');        // trim trailing dash
};

export default slugify;
