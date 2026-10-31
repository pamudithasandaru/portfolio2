// Helpers shared by the markdown renderer (heading ids) and the table of contents.

export const slugify = (text = '') =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

// Plain text of a React node tree (what a heading shows on screen)
export const textOf = (node) => {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  return textOf(node.props?.children);
};

// Finds the ## and ### headings in a markdown body (ignoring fenced code blocks)
export const extractHeadings = (markdown = '') => {
  const headings = [];
  let inFence = false;

  for (const line of markdown.split('\n')) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
    } else if (!inFence) {
      const match = line.match(/^(#{2,3})\s+(.+?)\s*#*\s*$/);
      if (match) {
        const text = match[2]
          .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
          .replace(/[*_`]/g, '')
          .trim();
        headings.push({ level: match[1].length, text, id: slugify(text) });
      }
    }
  }

  return headings.filter((heading) => heading.id);
};

// Small stable number from a string, used to vary generated cover art per post
export const hashString = (value = '') => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};
