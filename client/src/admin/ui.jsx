import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaArrowDown, FaArrowUp, FaPlus, FaTimes, FaUpload } from 'react-icons/fa';
import { adminFetch, formatBytes, uploadImage } from './api';

// ---- Toasts ----

const ToastContext = createContext(() => {});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const toast = useCallback((message, tone = 'ok') => {
    const id = ++counter.current;
    setToasts((list) => [...list, { id, message, tone }]);
    setTimeout(() => setToasts((list) => list.filter((item) => item.id !== id)), 4500);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="adm-toasts" role="status" aria-live="polite">
        {toasts.map((item) => (
          <div key={item.id} className={`adm-toast is-${item.tone}`}>
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

// ---- Form fields ----

export const Field = ({ label, hint, children, wide }) => {
  const id = useId();
  return (
    <div className={`adm-field ${wide ? 'is-wide' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children(id)}
      {hint && <p className="adm-hint">{hint}</p>}
    </div>
  );
};

export const TextField = ({ label, hint, value, onChange, type = 'text', wide, ...rest }) => (
  <Field label={label} hint={hint} wide={wide}>
    {(id) => (
      <input id={id} type={type} value={value ?? ''} onChange={(event) => onChange(event.target.value)} {...rest} />
    )}
  </Field>
);

export const TextAreaField = ({ label, hint, value, onChange, rows = 4, ...rest }) => (
  <Field label={label} hint={hint} wide>
    {(id) => (
      <textarea id={id} rows={rows} value={value ?? ''} onChange={(event) => onChange(event.target.value)} {...rest} />
    )}
  </Field>
);

export const NumberField = ({ label, hint, value, onChange }) => (
  <TextField
    label={label}
    hint={hint}
    type="number"
    value={value ?? 0}
    onChange={(next) => onChange(next === '' ? 0 : Number(next))}
  />
);

export const SelectField = ({ label, value, onChange, options }) => (
  <Field label={label}>
    {(id) => (
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )}
  </Field>
);

export const CheckField = ({ label, checked, onChange }) => (
  <label className="adm-check">
    <input type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange(event.target.checked)} />
    <span>{label}</span>
  </label>
);

const parseTags = (text) =>
  text
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

// Comma-separated list shown as a single text box
export const TagsField = ({ label, hint = 'Separate with commas', value = [], onChange }) => {
  const [text, setText] = useState(value.join(', '));

  useEffect(() => {
    if (value.join('|') !== parseTags(text).join('|')) {
      setText(value.join(', '));
    }
    // only react to changes coming from outside (e.g. a different record being opened)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <TextField
      label={label}
      hint={hint}
      wide
      value={text}
      onChange={(next) => {
        setText(next);
        onChange(parseTags(next));
      }}
    />
  );
};

// ---- Lists of repeated items (with reorder / remove) ----

export const RepeatList = ({ items, onChange, newItem, renderItem, itemLabel = 'Item', addLabel }) => {
  const replace = (index, value) => onChange(items.map((item, i) => (i === index ? value : item)));
  const remove = (index) => onChange(items.filter((_, i) => i !== index));
  const move = (index, step) => {
    const target = index + step;
    if (target < 0 || target >= items.length) {
      return;
    }
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="adm-repeat">
      {items.map((item, index) => (
        <div className="adm-repeat-item" key={index}>
          <div className="adm-repeat-head">
            <strong>
              {itemLabel} {index + 1}
            </strong>
            <span>
              <button type="button" className="adm-icon-btn" onClick={() => move(index, -1)} aria-label="Move up" disabled={index === 0}>
                <FaArrowUp aria-hidden="true" />
              </button>
              <button type="button" className="adm-icon-btn" onClick={() => move(index, 1)} aria-label="Move down" disabled={index === items.length - 1}>
                <FaArrowDown aria-hidden="true" />
              </button>
              <button type="button" className="adm-icon-btn is-danger" onClick={() => remove(index)} aria-label={`Remove ${itemLabel.toLowerCase()} ${index + 1}`}>
                <FaTimes aria-hidden="true" />
              </button>
            </span>
          </div>
          <div className="adm-grid">{renderItem(item, (patch) => replace(index, { ...item, ...patch }), index)}</div>
        </div>
      ))}
      <button type="button" className="adm-btn is-ghost" onClick={() => onChange([...items, newItem()])}>
        <FaPlus aria-hidden="true" /> {addLabel || `Add ${itemLabel.toLowerCase()}`}
      </button>
    </div>
  );
};

// A plain list of text lines
export const StringList = ({ items = [], onChange, label, addLabel }) => (
  <div className="adm-field is-wide">
    <span className="adm-label">{label}</span>
    <RepeatList
      items={items}
      onChange={onChange}
      newItem={() => ''}
      itemLabel="Line"
      addLabel={addLabel}
      renderItem={(item, patch, index) => (
        <TextField label="Text" wide value={item} onChange={(next) => onChange(items.map((line, i) => (i === index ? next : line)))} />
      )}
    />
  </div>
);

// ---- Modal ----

export const Modal = ({ title, onClose, children, wide }) => {
  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="adm-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className={`adm-modal ${wide ? 'is-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="adm-modal-head">
          <h2>{title}</h2>
          <button type="button" className="adm-icon-btn" onClick={onClose} aria-label="Close">
            <FaTimes aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ---- Image library, picker and upload fields ----

export const useUpload = () => {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const upload = async (files) => {
    setBusy(true);
    const urls = [];
    for (const file of files) {
      try {
        urls.push((await uploadImage(file)).url);
      } catch (error) {
        toast(`${file.name}: ${error.message}`, 'error');
      }
    }
    setBusy(false);
    return urls;
  };

  return { upload, busy };
};

export const MediaGrid = ({ onSelect }) => {
  const toast = useToast();
  const { upload, busy } = useUpload();
  const { data: files = [], isPending, refetch } = useQuery({
    queryKey: ['admin', 'media'],
    queryFn: () => adminFetch('/api/media'),
    staleTime: 0,
  });

  const onFiles = async (event) => {
    const chosen = [...event.target.files];
    event.target.value = '';
    if ((await upload(chosen)).length) {
      toast('Uploaded');
      refetch();
    }
  };

  const remove = async (file) => {
    if (!window.confirm(`Delete ${file.name}? Pages still using it will show a broken image.`)) {
      return;
    }
    try {
      await adminFetch(`/api/media/${file.id}`, { method: 'DELETE' });
      refetch();
    } catch (error) {
      toast(error.message, 'error');
    }
  };

  const copy = async (file) => {
    try {
      await navigator.clipboard.writeText(file.url);
      toast('Address copied');
    } catch {
      toast(file.url);
    }
  };

  return (
    <div>
      <label className="adm-btn">
        <FaUpload aria-hidden="true" /> {busy ? 'Uploading…' : 'Upload images'}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden onChange={onFiles} disabled={busy} />
      </label>
      {isPending && <p className="adm-muted">Loading…</p>}
      {!isPending && files.length === 0 && <p className="adm-muted">No uploads yet.</p>}
      <ul className="adm-media-grid">
        {files.map((file) => (
          <li key={file.id}>
            <button type="button" className="adm-media-thumb" onClick={() => (onSelect ? onSelect(file.url) : copy(file))} title={onSelect ? 'Use this image' : 'Copy address'}>
              <img src={file.url} alt="" loading="lazy" />
            </button>
            <p title={file.name}>{file.name}</p>
            <p className="adm-muted">{formatBytes(file.size)}</p>
            {!onSelect && (
              <button type="button" className="adm-link is-danger" onClick={() => remove(file)}>
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const MediaPicker = ({ onPick, onClose }) => (
  <Modal title="Choose an image" onClose={onClose} wide>
    <MediaGrid
      onSelect={(url) => {
        onPick(url);
        onClose();
      }}
    />
  </Modal>
);

// One image: preview + address + upload + choose from library
export const ImageField = ({ label, hint, value, onChange }) => {
  const { upload, busy } = useUpload();
  const [picking, setPicking] = useState(false);

  const onFile = async (event) => {
    const [file] = event.target.files;
    event.target.value = '';
    if (file) {
      const [url] = await upload([file]);
      if (url) {
        onChange(url);
      }
    }
  };

  return (
    <div className="adm-field is-wide">
      <span className="adm-label">{label}</span>
      <div className="adm-image-field">
        {value ? <img src={value} alt="" /> : <span className="adm-image-empty">No image</span>}
        <div>
          <input type="text" value={value || ''} onChange={(event) => onChange(event.target.value)} placeholder="Image address (https://… or /images/…)" aria-label={`${label} address`} />
          <div className="adm-actions">
            <label className="adm-btn is-small">
              <FaUpload aria-hidden="true" /> {busy ? 'Uploading…' : 'Upload'}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={onFile} disabled={busy} />
            </label>
            <button type="button" className="adm-btn is-small is-ghost" onClick={() => setPicking(true)}>
              Library
            </button>
            {value && (
              <button type="button" className="adm-btn is-small is-ghost" onClick={() => onChange('')}>
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
      {hint && <p className="adm-hint">{hint}</p>}
      {picking && <MediaPicker onPick={onChange} onClose={() => setPicking(false)} />}
    </div>
  );
};

// Several images (e.g. an album)
export const ImageListField = ({ label, value = [], onChange }) => {
  const { upload, busy } = useUpload();

  const onFiles = async (event) => {
    const chosen = [...event.target.files];
    event.target.value = '';
    const urls = await upload(chosen);
    if (urls.length) {
      onChange([...value, ...urls]);
    }
  };

  return (
    <div className="adm-field is-wide">
      <span className="adm-label">{label}</span>
      <ul className="adm-thumbs">
        {value.map((url, index) => (
          <li key={`${url}-${index}`}>
            <img src={url} alt="" />
            <button type="button" className="adm-icon-btn is-danger" onClick={() => onChange(value.filter((_, i) => i !== index))} aria-label={`Remove photo ${index + 1}`}>
              <FaTimes aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <label className="adm-btn is-small">
        <FaUpload aria-hidden="true" /> {busy ? 'Uploading…' : 'Add photos'}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden onChange={onFiles} disabled={busy} />
      </label>
    </div>
  );
};

export const PageHeader = ({ title, children }) => (
  <header className="adm-page-head">
    <h1>{title}</h1>
    <div className="adm-actions">{children}</div>
  </header>
);

export const Loading = () => <p className="adm-muted" role="status">Loading…</p>;
