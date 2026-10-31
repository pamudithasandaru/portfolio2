const stripQuotes = (value) => value.replace(/^(['"])(.*)\1$/, '$2');

const parseValue = (raw) => {
  const value = raw.trim();

  if (value.startsWith('[') && value.endsWith(']')) {
    return value
      .slice(1, -1)
      .split(',')
      .map((item) => stripQuotes(item.trim()))
      .filter(Boolean);
  }

  if (value === 'true' || value === 'false') {
    return value === 'true';
  }

  return stripQuotes(value);
};

// Reads the `---` header at the top of a markdown file.
// Supported: `key: value`, `key: [a, b, c]`, `key: true|false`.
export const parseFrontmatter = (raw) => {
  const text = raw.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const match = text.match(/^---\n([\s\S]*?)\n---\n?/);

  if (!match) {
    return { data: {}, body: text };
  }

  const data = {};
  for (const line of match[1].split('\n')) {
    const pair = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (pair) {
      data[pair[1]] = parseValue(pair[2]);
    }
  }

  return { data, body: text.slice(match[0].length) };
};

export const readingMinutes = (body) =>
  Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 200));
