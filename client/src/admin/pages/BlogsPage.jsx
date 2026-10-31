import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { FaEye, FaImage, FaPlus, FaTrash } from 'react-icons/fa';
import { adminFetch, toSlug } from '../api';
import { useAdminAction, useAdminQuery } from '../hooks';
import { CheckField, ImageField, Loading, MediaPicker, PageHeader, TagsField, TextAreaField, TextField } from '../ui';
import '../../styles/Blog.css';
import '../../styles/BlogDesign.css';

const BlogMarkdown = lazy(() => import('../../components/BlogMarkdown'));

const today = () => new Date().toISOString().slice(0, 10);

const blank = () => ({ slug: '', title: '', date: today(), summary: '', tags: [], cover: '', video: '', draft: true, body: '' });

const BlogEditor = ({ slug, onClose }) => {
  const isNew = slug === 'new';
  const { data, isPending, isError, error } = useAdminQuery(['blog', slug], `/api/blogs/${slug}`, { enabled: !isNew });
  const [draft, setDraft] = useState(isNew ? blank() : null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [preview, setPreview] = useState(false);
  const [picking, setPicking] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (data) {
      setDraft(structuredClone(data));
    }
  }, [data]);

  const save = useAdminAction(
    (post) =>
      isNew
        ? adminFetch('/api/blogs', { method: 'POST', body: post })
        : adminFetch(`/api/blogs/${slug}`, { method: 'PUT', body: post }),
    { success: 'Saved', onDone: (saved) => isNew && onClose(saved.slug) }
  );

  const patch = (changes) => setDraft((current) => ({ ...current, ...changes }));

  const insertImage = (url) => {
    const field = bodyRef.current;
    const markdown = `\n\n![Describe the image](${url})\n\n`;
    const position = field ? field.selectionStart : draft.body.length;
    patch({ body: draft.body.slice(0, position) + markdown + draft.body.slice(position) });
  };

  if (!isNew && isPending) {
    return <Loading />;
  }
  if (!draft) {
    return <p className="adm-error">{error?.message || 'Post not found.'}</p>;
  }

  return (
    <form
      className="adm-card"
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate(draft);
      }}
    >
      {isError && <p className="adm-error">{error.message}</p>}
      <div className="adm-grid">
        <TextField
          label="Title"
          value={draft.title}
          onChange={(title) => patch(isNew && !slugTouched ? { title, slug: toSlug(title) } : { title })}
          required
        />
        <TextField
          label="Address"
          hint={isNew ? `Shown as /blogs/${draft.slug || 'your-address'}` : 'Cannot change after publishing'}
          value={draft.slug}
          disabled={!isNew}
          onChange={(value) => {
            setSlugTouched(true);
            patch({ slug: toSlug(value) });
          }}
          required
        />
        <TextField label="Date" type="date" value={draft.date} onChange={(date) => patch({ date })} required />
        <TagsField label="Tags" value={draft.tags || []} onChange={(tags) => patch({ tags })} />
        <TextAreaField label="Summary" hint="Shown on the blog list and in search results" rows={2} maxLength={500} value={draft.summary} onChange={(summary) => patch({ summary })} />
        <ImageField label="Cover image" value={draft.cover} onChange={(cover) => patch({ cover })} />
        <TextField label="YouTube video link (optional)" wide value={draft.video} onChange={(video) => patch({ video })} />
        <CheckField label="Private (hidden from visitors)" checked={draft.draft} onChange={(isDraft) => patch({ draft: isDraft })} />
      </div>

      <div className="adm-editor-bar">
        <h2 className="adm-section-title">Article</h2>
        <span className="adm-actions">
          <button type="button" className="adm-btn is-small is-ghost" onClick={() => setPicking(true)}>
            <FaImage aria-hidden="true" /> Insert image
          </button>
          <button type="button" className="adm-btn is-small is-ghost" onClick={() => setPreview(!preview)} aria-pressed={preview}>
            <FaEye aria-hidden="true" /> {preview ? 'Back to editing' : 'Preview'}
          </button>
        </span>
      </div>

      {preview ? (
        <div className="blog-prose adm-preview">
          <Suspense fallback={<Loading />}>
            <BlogMarkdown>{draft.body || '*Nothing written yet.*'}</BlogMarkdown>
          </Suspense>
        </div>
      ) : (
        <textarea
          ref={bodyRef}
          className="adm-body"
          rows={22}
          value={draft.body}
          onChange={(event) => patch({ body: event.target.value })}
          aria-label="Article body in Markdown"
          placeholder="Write in Markdown: ## Heading, **bold**, - lists, [links](https://…), ```code```"
          spellCheck
        />
      )}

      <div className="adm-actions adm-sticky-actions">
        <button type="submit" className="adm-btn is-primary" disabled={save.isPending}>
          {save.isPending ? 'Saving…' : draft.draft ? 'Save as private' : 'Save and publish'}
        </button>
        <button type="button" className="adm-btn is-ghost" onClick={() => onClose()}>
          Back to all posts
        </button>
        {!isNew && !draft.draft && (
          <a className="adm-link" href={`/blogs/${draft.slug}`} target="_blank" rel="noopener noreferrer">
            View on site
          </a>
        )}
      </div>

      {picking && <MediaPicker onPick={insertImage} onClose={() => setPicking(false)} />}
    </form>
  );
};

const BlogsPage = () => {
  const [editing, setEditing] = useState(null); // slug, 'new', or null for the list
  const { data: posts, isPending, isError, error } = useAdminQuery(['blogs'], '/api/blogs?all=1');

  const remove = useAdminAction((slug) => adminFetch(`/api/blogs/${slug}`, { method: 'DELETE' }), {
    success: 'Post deleted',
  });
  const setStatus = useAdminAction(
    ({ slug, draft }) => adminFetch(`/api/blogs/${slug}/status`, { method: 'PATCH', body: { draft } }),
    { success: 'Status updated' }
  );

  if (editing) {
    return (
      <>
        <PageHeader title={editing === 'new' ? 'New post' : 'Edit post'} />
        <BlogEditor key={editing} slug={editing} onClose={(next) => setEditing(next || null)} />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Blog posts">
        <button type="button" className="adm-btn is-primary" onClick={() => setEditing('new')}>
          <FaPlus aria-hidden="true" /> New post
        </button>
      </PageHeader>

      {isPending && <Loading />}
      {isError && <p className="adm-error">{error.message}</p>}
      {posts?.length === 0 && <p className="adm-muted">No posts yet. Write your first one!</p>}

      {posts?.length > 0 && (
        <div className="adm-card adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Status</th>
                <th>Tags</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.slug}>
                  <td>
                    <button type="button" className="adm-link" onClick={() => setEditing(post.slug)}>
                      {post.title}
                    </button>
                    <div className="adm-muted">/blogs/{post.slug}</div>
                  </td>
                  <td>{post.date}</td>
                  <td>
                    <select
                      className={`adm-status ${post.draft ? 'is-draft' : 'is-live'}`}
                      value={post.draft ? 'private' : 'published'}
                      onChange={(event) => setStatus.mutate({ slug: post.slug, draft: event.target.value === 'private' })}
                      disabled={setStatus.isPending}
                      aria-label={`Status of ${post.title}`}
                    >
                      <option value="published">Published</option>
                      <option value="private">Private</option>
                    </select>
                  </td>
                  <td>{(post.tags || []).join(', ')}</td>
                  <td className="adm-cell-actions">
                    <button type="button" className="adm-btn is-small is-ghost" onClick={() => setEditing(post.slug)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="adm-icon-btn is-danger"
                      aria-label={`Delete ${post.title}`}
                      onClick={() => window.confirm(`Delete "${post.title}" together with its comments and ratings?`) && remove.mutate(post.slug)}
                    >
                      <FaTrash aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default BlogsPage;
