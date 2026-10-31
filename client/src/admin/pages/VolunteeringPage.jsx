import { useEffect, useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { adminFetch, toDateInput } from '../api';
import { useAdminAction, useAdminQuery } from '../hooks';
import {
  CheckField,
  ImageField,
  ImageListField,
  Loading,
  NumberField,
  PageHeader,
  StringList,
  TagsField,
  TextAreaField,
  TextField,
} from '../ui';

const PATH = '/api/volunteering-experiences';

const blank = (order) => ({
  organization: '',
  position: '',
  duration: '',
  isCurrent: false,
  startDate: '',
  endDate: '',
  description: '',
  achievements: [],
  keyTags: [],
  status: '',
  logo: '',
  photos: [],
  displayOrder: order,
});

// Only these fields are sent back: photos stored the old way (inside the record) stay untouched
const toPayload = (item) => ({
  organization: item.organization,
  position: item.position,
  duration: item.duration,
  isCurrent: Boolean(item.isCurrent),
  startDate: item.startDate || null,
  endDate: item.endDate || null,
  description: item.description,
  achievements: (item.achievements || []).filter((line) => line.trim()),
  keyTags: item.keyTags || [],
  status: item.status || '',
  logo: item.logo || '',
  photos: item.photos || [],
  displayOrder: item.displayOrder || 0,
});

const VolunteeringPage = () => {
  const { data: items, isPending, isError, error } = useAdminQuery(['volunteering'], PATH);
  const [selected, setSelected] = useState(null); // id, or 'new'
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    if (!items || selected === 'new') {
      return;
    }
    const current = items.find((item) => item._id === selected);
    if (current) {
      setDraft(structuredClone(current));
    }
  }, [items, selected]);

  const save = useAdminAction(
    (item) =>
      selected === 'new'
        ? adminFetch(PATH, { method: 'POST', body: toPayload(item) })
        : adminFetch(`${PATH}/${item._id}`, { method: 'PUT', body: toPayload(item) }),
    { success: 'Saved', onDone: (result) => setSelected(result._id || result.experience?._id) }
  );

  const remove = useAdminAction((id) => adminFetch(`${PATH}/${id}`, { method: 'DELETE' }), {
    success: 'Deleted',
    onDone: () => {
      setSelected(null);
      setDraft(null);
    },
  });

  const patch = (changes) => setDraft((current) => ({ ...current, ...changes }));

  return (
    <>
      <PageHeader title="Volunteering">
        <button
          type="button"
          className="adm-btn"
          onClick={() => {
            setSelected('new');
            setDraft(blank(items?.length || 0));
          }}
        >
          <FaPlus aria-hidden="true" /> New experience
        </button>
      </PageHeader>

      {isPending && <Loading />}
      {isError && <p className="adm-error">{error.message}</p>}

      {items && (
        <div className="adm-split">
          <ul className="adm-list" aria-label="Volunteering experiences">
            {items.length === 0 && <li className="adm-muted">Nothing here yet.</li>}
            {items.map((item) => (
              <li key={item._id}>
                <button type="button" className={selected === item._id ? 'is-active' : ''} onClick={() => setSelected(item._id)}>
                  <strong>{item.organization}</strong>
                  <span>{item.position}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="adm-card">
            {!draft && <p className="adm-muted">Choose an experience on the left, or create a new one.</p>}
            {draft && (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  save.mutate(draft);
                }}
              >
                <div className="adm-grid">
                  <TextField label="Organization" value={draft.organization} onChange={(organization) => patch({ organization })} required />
                  <TextField label="Position" value={draft.position} onChange={(position) => patch({ position })} required />
                  <TextField label="Duration (as shown)" hint="e.g. 2023 Jan - Present" value={draft.duration} onChange={(duration) => patch({ duration })} />
                  <TextField label="Status label" value={draft.status} onChange={(status) => patch({ status })} />
                  <TextField label="Start date" type="date" value={toDateInput(draft.startDate)} onChange={(startDate) => patch({ startDate })} />
                  <TextField label="End date" type="date" value={toDateInput(draft.endDate)} onChange={(endDate) => patch({ endDate })} />
                  <CheckField label="I am still doing this" checked={draft.isCurrent} onChange={(isCurrent) => patch({ isCurrent })} />
                  <NumberField label="Order" value={draft.displayOrder} onChange={(displayOrder) => patch({ displayOrder })} />
                  <TextAreaField label="Description" rows={4} value={draft.description} onChange={(description) => patch({ description })} required />
                  <TagsField label="Key tags" value={draft.keyTags || []} onChange={(keyTags) => patch({ keyTags })} />
                  <StringList label="Achievements" addLabel="Add achievement" items={draft.achievements || []} onChange={(achievements) => patch({ achievements })} />
                  <ImageField label="Logo" value={draft.logo} onChange={(logo) => patch({ logo })} />
                  <ImageListField label="Album photos" value={draft.photos || []} onChange={(photos) => patch({ photos })} />
                </div>

                <div className="adm-actions adm-sticky-actions">
                  <button type="submit" className="adm-btn is-primary" disabled={save.isPending}>
                    {save.isPending ? 'Saving…' : 'Save'}
                  </button>
                  {selected !== 'new' && (
                    <button
                      type="button"
                      className="adm-btn is-danger"
                      disabled={remove.isPending}
                      onClick={() => window.confirm(`Delete "${draft.organization}"?`) && remove.mutate(draft._id)}
                    >
                      <FaTrash aria-hidden="true" /> Delete
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default VolunteeringPage;
