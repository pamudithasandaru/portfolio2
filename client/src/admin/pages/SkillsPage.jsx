import { useEffect, useState } from 'react';
import { adminFetch } from '../api';
import { useAdminAction, useAdminQuery } from '../hooks';
import { Loading, NumberField, PageHeader, RepeatList, TagsField, TextField } from '../ui';

const PATH = '/api/language-tool-sections';

const SkillsPage = () => {
  const { data, isPending, error } = useAdminQuery(['skills'], PATH);
  const [draft, setDraft] = useState(null);

  // A 404 just means nothing has been saved yet
  useEffect(() => {
    if (data) {
      setDraft({ heading: data.heading || 'Languages and Tools', sections: structuredClone(data.sections || []) });
    } else if (error?.status === 404) {
      setDraft({ heading: 'Languages and Tools', sections: [] });
    }
  }, [data, error]);

  const save = useAdminAction(() => adminFetch(`${PATH}/upsert`, { method: 'POST', body: draft }), {
    success: 'Saved',
  });

  if (isPending) {
    return <Loading />;
  }

  if (!draft) {
    return <p className="adm-error">{error?.message}</p>;
  }

  return (
    <>
      <PageHeader title="Languages and tools" />
      <form
        className="adm-card"
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
      >
        <div className="adm-grid">
          <TextField label="Heading" value={draft.heading} onChange={(heading) => setDraft({ ...draft, heading })} />
        </div>

        <h2 className="adm-section-title">Sections</h2>
        <RepeatList
          items={draft.sections}
          onChange={(sections) => setDraft({ ...draft, sections })}
          itemLabel="Section"
          newItem={() => ({ title: '', displayOrder: draft.sections.length, categories: [] })}
          renderItem={(section, patch) => (
            <>
              <TextField label="Section title" value={section.title} onChange={(title) => patch({ title })} required />
              <NumberField label="Order" value={section.displayOrder} onChange={(displayOrder) => patch({ displayOrder })} />
              <div className="adm-field is-wide">
                <span className="adm-label">Groups</span>
                <RepeatList
                  items={section.categories || []}
                  onChange={(categories) => patch({ categories })}
                  itemLabel="Group"
                  newItem={() => ({ name: '', items: [] })}
                  renderItem={(group, patchGroup) => (
                    <>
                      <TextField label="Group name" value={group.name} onChange={(name) => patchGroup({ name })} required />
                      <TagsField label="Items" value={group.items || []} onChange={(items) => patchGroup({ items })} />
                    </>
                  )}
                />
              </div>
            </>
          )}
        />

        <div className="adm-actions adm-sticky-actions">
          <button type="submit" className="adm-btn is-primary" disabled={save.isPending || draft.sections.length === 0}>
            {save.isPending ? 'Saving…' : 'Save'}
          </button>
          {draft.sections.length === 0 && <span className="adm-muted">Add at least one section to save.</span>}
        </div>
      </form>
    </>
  );
};

export default SkillsPage;
