import { useState } from 'react';
import { FaEnvelopeOpen, FaReply, FaTrash } from 'react-icons/fa';
import { adminFetch } from '../api';
import { useAdminAction, useAdminQuery } from '../hooks';
import { Loading, PageHeader } from '../ui';

const when = (value) => new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

const Messages = () => {
  const { data: messages, isPending, isError, error } = useAdminQuery(['messages'], '/api/admin/messages');
  const toggle = useAdminAction((message) =>
    adminFetch(`/api/admin/messages/${message._id}`, { method: 'PATCH', body: { read: !message.read } })
  );
  const remove = useAdminAction((id) => adminFetch(`/api/admin/messages/${id}`, { method: 'DELETE' }), {
    success: 'Message deleted',
  });

  if (isPending) {
    return <Loading />;
  }
  if (isError) {
    return <p className="adm-error">{error.message}</p>;
  }
  if (messages.length === 0) {
    return <p className="adm-muted">No messages yet. Messages sent from the contact form on your site appear here.</p>;
  }

  return (
    <ul className="adm-stack">
      {messages.map((message) => (
        <li key={message._id} className={`adm-card adm-message ${message.read ? '' : 'is-unread'}`}>
          <div className="adm-message-head">
            <strong>{message.fromEmail}</strong>
            <span className="adm-muted">{when(message.createdAt)}</span>
          </div>
          <p className="adm-message-body">{message.message}</p>
          <div className="adm-actions">
            <a className="adm-btn is-small" href={`mailto:${message.fromEmail}`}>
              <FaReply aria-hidden="true" /> Reply
            </a>
            <button type="button" className="adm-btn is-small is-ghost" onClick={() => toggle.mutate(message)}>
              <FaEnvelopeOpen aria-hidden="true" /> Mark as {message.read ? 'unread' : 'read'}
            </button>
            <button
              type="button"
              className="adm-btn is-small is-danger"
              onClick={() => window.confirm('Delete this message?') && remove.mutate(message._id)}
            >
              <FaTrash aria-hidden="true" /> Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

const Comments = () => {
  const { data: comments, isPending, isError, error } = useAdminQuery(['comments'], '/api/admin/comments');
  const remove = useAdminAction((id) => adminFetch(`/api/admin/comments/${id}`, { method: 'DELETE' }), {
    success: 'Comment deleted',
  });

  if (isPending) {
    return <Loading />;
  }
  if (isError) {
    return <p className="adm-error">{error.message}</p>;
  }
  if (comments.length === 0) {
    return <p className="adm-muted">No blog comments yet.</p>;
  }

  return (
    <ul className="adm-stack">
      {comments.map((comment) => (
        <li key={comment._id} className="adm-card adm-message">
          <div className="adm-message-head">
            <strong>{comment.name}</strong>
            <span className="adm-muted">
              on <a href={`/blogs/${comment.slug}`} target="_blank" rel="noopener noreferrer">/blogs/{comment.slug}</a> · {when(comment.createdAt)}
            </span>
          </div>
          <p className="adm-message-body">{comment.message}</p>
          <div className="adm-actions">
            <button
              type="button"
              className="adm-btn is-small is-danger"
              onClick={() => window.confirm('Delete this comment?') && remove.mutate(comment._id)}
            >
              <FaTrash aria-hidden="true" /> Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

const InboxPage = () => {
  const [tab, setTab] = useState('messages');

  return (
    <>
      <PageHeader title="Messages and comments" />
      <div className="adm-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'messages'} className={tab === 'messages' ? 'is-active' : ''} onClick={() => setTab('messages')}>
          Contact messages
        </button>
        <button type="button" role="tab" aria-selected={tab === 'comments'} className={tab === 'comments' ? 'is-active' : ''} onClick={() => setTab('comments')}>
          Blog comments
        </button>
      </div>
      {tab === 'messages' ? <Messages /> : <Comments />}
    </>
  );
};

export default InboxPage;
