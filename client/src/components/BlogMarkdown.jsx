import { Children, isValidElement, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { FaCheck, FaRegCopy } from 'react-icons/fa';
import OptimizedImage from './OptimizedImage';
import YouTubeEmbed, { youtubeId } from './YouTubeEmbed';
import { slugify, textOf } from '../utils/headings';

const isExternal = (href = '') => /^https?:\/\//i.test(href);

// A paragraph that holds nothing but a YouTube link becomes a video player.
// Anything else stays a normal paragraph.
const Paragraph = ({ children }) => {
  const nodes = Children.toArray(children);

  if (nodes.length === 1 && isValidElement(nodes[0]) && nodes[0].props.href) {
    const id = youtubeId(nodes[0].props.href);

    if (id) {
      const label = textOf(nodes[0].props.children);
      const title = label && !isExternal(label) ? label : 'YouTube video';
      return <YouTubeEmbed id={id} title={title} />;
    }
  }

  return <p>{children}</p>;
};

// Code block with a language label and a copy button
const CodeBlock = ({ children }) => {
  const [copied, setCopied] = useState(false);
  const code = children?.props;
  const language = (code?.className || '').match(/language-([\w-]+)/)?.[1] || 'code';
  const source = textOf(code?.children).replace(/\n$/, '');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked (insecure context or permissions): nothing to do
    }
  };

  return (
    <div className="blog-code">
      <div className="blog-code-bar">
        <span>{language}</span>
        <button type="button" onClick={copy} aria-label="Copy code to clipboard">
          {copied ? <FaCheck aria-hidden="true" /> : <FaRegCopy aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre>{children}</pre>
    </div>
  );
};

const heading = (Tag) =>
  function Heading({ children }) {
    return <Tag id={slugify(textOf(children)) || undefined}>{children}</Tag>;
  };

// Images from the shared /blog-images folder get WebP variants and lazy loading.
// The alt text doubles as the caption.
const components = {
  h2: heading('h2'),
  h3: heading('h3'),
  p: Paragraph,
  pre: CodeBlock,
  img: ({ src, alt }) => (
    <span className="blog-figure">
      <OptimizedImage src={src} alt={alt || ''} sizes="(max-width: 800px) 100vw, 760px" />
      {alt && <span className="blog-figure-caption">{alt}</span>}
    </span>
  ),
  a: ({ href, children }) =>
    isExternal(href) ? (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ) : (
      <a href={href}>{children}</a>
    ),
};

// Raw HTML inside markdown is not rendered (react-markdown's default), so posts stay safe.
// Code blocks are highlighted only when the fence names a language (```python).
const BlogMarkdown = ({ children }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[[rehypeHighlight, { detect: false }]]}
    components={components}
  >
    {children}
  </ReactMarkdown>
);

export default BlogMarkdown;
