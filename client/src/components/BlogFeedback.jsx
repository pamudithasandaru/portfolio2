import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postJson } from '../api/client';
import { blogKeys, useBlogFeedback } from '../api/queries';
import { getSavedName, getVisitorId, saveName, timeAgo } from '../utils/visitor';
import { StarsDisplay, StarsInput } from './StarRating';
import { CardListSkeleton } from './Skeleton';

const MAX_MESSAGE = 1500;

const BlogFeedback = ({ slug }) => {
  const queryClient = useQueryClient();
  const visitorId = useMemo(getVisitorId, []);
  const feedbackKey = blogKeys.feedback(slug, visitorId);
  const { data, isPending, isError } = useBlogFeedback(slug, visitorId);

  const [name, setName] = useState(getSavedName);
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot: real visitors never see or fill it
  const [notice, setNotice] = useState({ type: '', text: '' });

  const rating = data?.rating;
  const comments = data?.comments ?? [];

  const rate = useMutation({
    mutationFn: (value) => postJson(`/api/blog-feedback/${slug}/rating`, { visitorId, value }),
    onSuccess: (result) => {
      queryClient.setQueryData(feedbackKey, (old) => ({ ...old, rating: result.rating }));
      queryClient.invalidateQueries({ queryKey: blogKeys.summary });
    },
  });

  const comment = useMutation({
    mutationFn: (payload) => postJson(`/api/blog-feedback/${slug}/comments`, payload),
    onSuccess: (result) => {
      if (result.comment) {
        queryClient.setQueryData(feedbackKey, (old) => ({
          ...old,
          comments: [result.comment, ...(old?.comments ?? [])],
        }));
      }
      queryClient.invalidateQueries({ queryKey: blogKeys.summary });
      setMessage('');
      setNotice({ type: 'success', text: 'Thanks for your feedback!' });
    },
    onError: (error) => setNotice({ type: 'error', text: error.message }),
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    setNotice({ type: '', text: '' });

    if (!name.trim() || !message.trim()) {
      setNotice({ type: 'error', text: 'Please enter your name and a comment.' });
      return;
    }

    saveName(name.trim());
    comment.mutate({ name: name.trim(), message: message.trim(), website });
  };

  return (
    <section className="blog-feedback" aria-labelledby="blog-feedback-title">
      <h2 id="blog-feedback-title">Community feedback</h2>

      <div className="blog-rating-card">
        <div className="blog-rating-summary">
          <span className="blog-rating-number">
            {rating?.count ? rating.average.toFixed(1) : '–'}
          </span>
          <div>
            <StarsDisplay value={rating?.average || 0} />
            <p>
              {rating?.count
                ? `${rating.count} rating${rating.count > 1 ? 's' : ''}`
                : 'No ratings yet. Be the first!'}
            </p>
          </div>
        </div>

        <div className="blog-rating-input">
          <p id="rate-label">{rating?.mine ? 'Your rating (click to change)' : 'Rate this post'}</p>
          <StarsInput
            value={rating?.mine || 0}
            onChange={(value) => rate.mutate(value)}
            disabled={rate.isPending || isPending || isError}
          />
          {rate.isError && (
            <p className="blog-feedback-error" role="alert">
              {rate.error.message}
            </p>
          )}
        </div>
      </div>

      <form className="blog-comment-form" onSubmit={handleSubmit} noValidate>
        <h3>Leave a comment</h3>

        <label htmlFor="comment-name">Name</label>
        <input
          id="comment-name"
          type="text"
          value={name}
          maxLength={60}
          autoComplete="name"
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
        />

        <label htmlFor="comment-message">Comment</label>
        <textarea
          id="comment-message"
          value={message}
          maxLength={MAX_MESSAGE}
          rows={4}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="What did you think? Questions and suggestions are welcome."
        />
        <span className="blog-comment-count">
          {message.length}/{MAX_MESSAGE}
        </span>

        <div className="blog-honeypot" aria-hidden="true">
          <label htmlFor="comment-website">Website</label>
          <input
            id="comment-website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </div>

        <div className="blog-comment-actions">
          <button type="submit" className="blog-btn" disabled={comment.isPending}>
            {comment.isPending ? 'Posting…' : 'Post comment'}
          </button>
          {notice.text && (
            <p
              className={notice.type === 'error' ? 'blog-feedback-error' : 'blog-feedback-success'}
              role={notice.type === 'error' ? 'alert' : 'status'}
            >
              {notice.text}
            </p>
          )}
        </div>
      </form>

      <div className="blog-comments">
        <h3>
          {comments.length} comment{comments.length === 1 ? '' : 's'}
        </h3>

        {isPending && <CardListSkeleton count={2} label="Loading comments" />}

        {isError && (
          <p className="blog-feedback-error">
            Feedback is unavailable right now. Please try again later.
          </p>
        )}

        {!isPending && !isError && comments.length === 0 && (
          <p className="blog-empty">No comments yet. Start the conversation.</p>
        )}

        <ul>
          {comments.map((item) => (
            <li key={item._id} className="blog-comment">
              <span className="blog-comment-avatar" aria-hidden="true">
                {item.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="blog-comment-head">
                  <strong>{item.name}</strong>
                  <time dateTime={item.createdAt}>{timeAgo(item.createdAt)}</time>
                </p>
                <p className="blog-comment-body">{item.message}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default BlogFeedback;
