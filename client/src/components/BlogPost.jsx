import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaCheck, FaLink, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import profileImage from '../assets/images/ee.webp';
import { extractHeadings } from '../utils/headings';
import { formatDate } from '../utils/visitor';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { useBlogPost, useBlogs, useBlogSummary } from '../api/queries';
import BlogMarkdown from './BlogMarkdown';
import BlogFeedback from './BlogFeedback';
import { cssImage } from '../utils/images';
import YouTubeEmbed, { youtubeId } from './YouTubeEmbed';
import { StarsDisplay } from './StarRating';
import { Skeleton } from './Skeleton';
import '../styles/Blog.css';
import '../styles/BlogDesign.css';

const NAVBAR_OFFSET = 120;

const BlogPost = () => {
  const { slug } = useParams();
  const { data: post, isPending, isError } = useBlogPost(slug);
  const { data: posts = [] } = useBlogs();
  const meta = post;
  const body = post?.body;
  const index = posts.findIndex((item) => item.slug === slug);
  const newer = index > 0 ? posts[index - 1] : null;
  const older = index >= 0 && index < posts.length - 1 ? posts[index + 1] : null;

  const { data: summary } = useBlogSummary();
  const stats = summary?.[slug];

  // A `video:` link in the post header is shown at the top of the post, under the byline
  const videoId = youtubeId(meta?.video);
  const headings = useMemo(() => extractHeadings(body), [body]);
  const showToc = headings.filter((heading) => heading.level === 2).length >= 3;

  const articleRef = useRef(null);
  const barRef = useRef(null);
  const [activeId, setActiveId] = useState('');
  const [copied, setCopied] = useState(false);

  useDocumentMeta(meta ? `${meta.title} | Sandaru Gunasena` : null, meta?.summary);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    setActiveId('');
  }, [slug]);

  // Reading progress bar and the current section in the table of contents
  useEffect(() => {
    const article = articleRef.current;
    const bar = barRef.current;
    if (!article || !bar) {
      return undefined;
    }

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = article.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight + NAVBAR_OFFSET);
      const progress = Math.min(1, Math.max(0, (NAVBAR_OFFSET - rect.top) / scrollable));
      bar.style.transform = `scaleX(${progress})`;

      let current = '';
      article.querySelectorAll('h2[id], h3[id]').forEach((node) => {
        if (node.getBoundingClientRect().top <= NAVBAR_OFFSET + 10) {
          current = node.id;
        }
      });
      setActiveId((previous) => (previous === current ? previous : current));
    };

    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [body, slug]);

  const pageUrl = typeof window === 'undefined' ? '' : window.location.href;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked: the other share links still work
    }
  };

  if (!meta && isPending) {
    return (
      <main className="blog-page">
        <div className="blog-post-container" role="status" aria-busy="true">
          <span className="sr-only">Loading post</span>
          <Skeleton width="40%" height="2rem" />
          <Skeleton width="100%" height="1rem" className="blog-skeleton-line" />
          <Skeleton width="92%" height="1rem" className="blog-skeleton-line" />
          <Skeleton width="96%" height="1rem" className="blog-skeleton-line" />
        </div>
      </main>
    );
  }

  if (!meta) {
    return (
      <main className="blog-page">
        <div className="blog-post-container">
          <Link to="/blogs" className="blog-back">
            <FaArrowLeft aria-hidden="true" />
            <span>All blogs</span>
          </Link>
          <h1 className="blog-post-title">Post not found</h1>
          <p className="blog-empty">
            {isError ? "That blog post doesn't exist, or it has been moved." : 'Unable to load this post.'}
          </p>
        </div>
      </main>
    );
  }

  const toc = (
    <ol className="blog-toc-list">
      {headings.map((heading) => (
        <li key={heading.id} className={heading.level === 3 ? 'is-sub' : ''}>
          <a href={`#${heading.id}`} className={activeId === heading.id ? 'is-active' : ''}>
            {heading.text}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <main className="blog-page">
      {meta.cover && (
        <div
          className="blog-hero-bg"
          style={{ backgroundImage: cssImage(meta.cover, 1600) }}
          aria-hidden="true"
        />
      )}

      <div className="blog-progress" aria-hidden="true">
        <span ref={barRef} />
      </div>

      <div className="blog-shell">
        <article className="blog-article" ref={articleRef}>
          <Link to="/blogs" className="blog-back">
            <FaArrowLeft aria-hidden="true" />
            <span>All blogs</span>
          </Link>

          <header className="blog-post-header">
            {meta.tags.length > 0 && (
              <ul className="blog-tags">
                {meta.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            )}
            <h1 className="blog-post-title">{meta.title}</h1>

            <div className="blog-byline">
              <img src={profileImage} alt="" width="44" height="44" />
              <div>
                <p className="blog-byline-name">Sandaru Gunasena</p>
                <p className="blog-post-meta">
                  {meta.date && <time dateTime={meta.date}>{formatDate(meta.date)}</time>}
                  <span aria-hidden="true">·</span>
                  <span>{meta.minutes} min read</span>
                  {stats?.ratingCount > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="blog-post-rating">
                        <StarsDisplay value={stats.average} />
                        {stats.average.toFixed(1)} ({stats.ratingCount})
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

          </header>

          {videoId && <YouTubeEmbed id={videoId} title={`Video: ${meta.title}`} />}

          {showToc && (
            <details className="blog-toc-inline">
              <summary>On this page</summary>
              {toc}
            </details>
          )}

          <div className="blog-prose">
            <BlogMarkdown>{body}</BlogMarkdown>
          </div>

          <div className="blog-share">
            <span>Share this post</span>
            <button type="button" onClick={copyLink}>
              {copied ? <FaCheck aria-hidden="true" /> : <FaLink aria-hidden="true" />}
              {copied ? 'Link copied' : 'Copy link'}
            </button>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on LinkedIn"
            >
              <FaLinkedin aria-hidden="true" />
              LinkedIn
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(meta.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on X"
            >
              <FaXTwitter aria-hidden="true" />X
            </a>
          </div>
        </article>

        {showToc && (
          <aside className="blog-toc" aria-label="Table of contents">
            <p>On this page</p>
            {toc}
          </aside>
        )}
      </div>

      <div className="blog-post-container">
        {(newer || older) && (
          <nav className="blog-pager" aria-label="More posts">
            {older ? (
              <Link to={`/blogs/${older.slug}`} className="blog-pager-link">
                <span className="blog-pager-label">
                  <FaArrowLeft aria-hidden="true" /> Older
                </span>
                <strong>{older.title}</strong>
              </Link>
            ) : (
              <span />
            )}
            {newer ? (
              <Link to={`/blogs/${newer.slug}`} className="blog-pager-link is-next">
                <span className="blog-pager-label">
                  Newer <FaArrowRight aria-hidden="true" />
                </span>
                <strong>{newer.title}</strong>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}

        <BlogFeedback slug={slug} />
      </div>
    </main>
  );
};

export default BlogPost;
