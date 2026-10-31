import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaComment, FaSearch } from 'react-icons/fa';
import { hashString } from '../utils/headings';
import { formatDate } from '../utils/visitor';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { useBlogs, useBlogSummary } from '../api/queries';
import { GridSkeleton } from './Skeleton';
import OptimizedImage from './OptimizedImage';
import { StarsDisplay } from './StarRating';
import '../styles/Blog.css';
import '../styles/BlogDesign.css';

// Generated cover for posts without a cover image: dot pattern, soft glow and the title's initial
const CoverArt = ({ post }) => {
  const hash = hashString(post.slug);

  return (
    <span
      className="blog-cover-art"
      style={{ '--bx': `${20 + (hash % 60)}%`, '--by': `${20 + ((hash >> 4) % 60)}%` }}
      aria-hidden="true"
    >
      <span className="blog-cover-art-tag">{post.tags[0] || 'Blog'}</span>
      <span className="blog-cover-art-letter">{post.title.charAt(0)}</span>
    </span>
  );
};

const PostCard = ({ post, stats, featured, index }) => (
  <Link
    to={`/blogs/${post.slug}`}
    className={`blog-card ${featured ? 'is-featured' : ''}`}
    style={{ animationDelay: `${0.06 * index}s` }}
  >
    <div className="blog-card-cover">
      {post.cover ? (
        <OptimizedImage
          src={post.cover}
          alt=""
          sizes={featured ? '(max-width: 800px) 100vw, 640px' : '(max-width: 700px) 100vw, 380px'}
        />
      ) : (
        <CoverArt post={post} />
      )}
      {featured && <span className="blog-card-badge">Latest</span>}
    </div>

    <div className="blog-card-body">
      {post.tags.length > 0 && (
        <ul className="blog-tags">
          {post.tags.slice(0, 3).map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}
      <h2>{post.title}</h2>
      {post.summary && <p className="blog-card-summary">{post.summary}</p>}

      <p className="blog-card-meta">
        {post.date && <time dateTime={post.date}>{formatDate(post.date)}</time>}
        <span aria-hidden="true">·</span>
        <span>{post.minutes} min read</span>
      </p>

      <div className="blog-card-foot">
        {(stats?.ratingCount > 0 || stats?.commentCount > 0) && (
          <p className="blog-card-stats">
            {stats.ratingCount > 0 && (
              <span className="blog-card-rating">
                <StarsDisplay value={stats.average} />
                {stats.average.toFixed(1)}
              </span>
            )}
            {stats.commentCount > 0 && (
              <span>
                <FaComment aria-hidden="true" /> {stats.commentCount}
              </span>
            )}
          </p>
        )}
        <span className="blog-card-cta">
          Read article <FaArrowRight aria-hidden="true" />
        </span>
      </div>
    </div>
  </Link>
);

const Blogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const { data: summary } = useBlogSummary();
  const { data: posts = [], isPending, isError } = useBlogs();

  useDocumentMeta('Blogs | Sandaru Gunasena', 'Articles on AI, machine learning and software engineering.');

  const tags = useMemo(() => [...new Set(posts.flatMap((post) => post.tags))].sort(), [posts]);

  const visiblePosts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return posts.filter((post) => {
      if (activeTag && !post.tags.includes(activeTag)) {
        return false;
      }
      if (!query) {
        return true;
      }
      return [post.title, post.summary, ...post.tags].some((field) => field.toLowerCase().includes(query));
    });
  }, [posts, searchTerm, activeTag]);

  // The newest post gets the big card, unless the visitor is searching or filtering
  const showFeatured = !searchTerm.trim() && !activeTag && visiblePosts.length > 1;

  return (
    <main className="blog-page">
      <div className="blog-container">
        <header className="blog-header">
          <p className="blog-eyebrow">Articles &amp; notes</p>
          <h1 className="blog-title">Blogs</h1>
          <div className="blog-title-underline" />
          <p className="blog-subtitle">Notes on AI, machine learning and building software.</p>
        </header>

        {posts.length > 0 && (
          <div className="blog-filters">
            <div className="blog-search-box">
              <FaSearch aria-hidden="true" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search posts by title, topic or tag"
                aria-label="Search posts"
              />
            </div>

            {tags.length > 0 && (
              <ul className="blog-tag-filters" aria-label="Filter by tag">
                <li>
                  <button
                    type="button"
                    className={!activeTag ? 'is-active' : ''}
                    onClick={() => setActiveTag('')}
                  >
                    All
                  </button>
                </li>
                {tags.map((tag) => (
                  <li key={tag}>
                    <button
                      type="button"
                      className={activeTag === tag ? 'is-active' : ''}
                      onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
                    >
                      {tag}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {isPending && <GridSkeleton count={3} label="Loading posts" />}
        {isError && <p className="blog-empty">Unable to load posts right now.</p>}
        {!isPending && !isError && posts.length === 0 && <p className="blog-empty">No posts yet. Check back soon!</p>}
        {posts.length > 0 && visiblePosts.length === 0 && (
          <p className="blog-empty">No posts match your search.</p>
        )}

        <div className="blog-grid">
          {visiblePosts.map((post, index) => (
            <PostCard
              key={post.slug}
              post={post}
              stats={summary?.[post.slug]}
              featured={showFeatured && index === 0}
              index={index}
            />
          ))}
        </div>
      </div>
    </main>
  );
};

export default Blogs;
