import { useEffect, useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { adminFetch, toSlug } from './api';
import { useAdminAction, useAdminQuery } from './hooks';
import { Loading, NumberField, PageHeader, RepeatList, TextAreaField, TextField } from './ui';

// Shared editor for "category with a list of items" content: Projects and Certifications.
//   itemsKey     name of the array inside each category (projects / certificates)
//   renderItem   form fields for one item
//   prepare      optional clean-up of the category right before it is saved
const CategoryManager = ({ title, path, itemsKey, itemLabel, newItem, renderItem, extraFields, prepare }) => {
  const { data: categories, isPending, isError, error } = useAdminQuery([path], path);
  const [selected, setSelected] = useState(null); // slug, or 'new'
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    if (!categories) {
      return;
    }
    if (selected === 'new') {
      return;
    }
    const current = categories.find((category) => category.slug === selected);
    if (current) {
      setDraft(structuredClone(current));
    }
  }, [categories, selected]);

  const startNew = () => {
    setSelected('new');
    setDraft({ name: '', slug: '', description: '', displayOrder: categories?.length || 0, [itemsKey]: [] });
  };

  const save = useAdminAction(
    (category) => {
      const clean = prepare ? prepare(category) : category;
      return adminFetch(`${path}/upsert`, {
        method: 'POST',
        body: { ...clean, slug: clean.slug || toSlug(clean.name) },
      });
    },
    { success: 'Saved', onDone: (result) => setSelected(result.data.slug) }
  );

  const remove = useAdminAction((slug) => adminFetch(`${path}/${slug}`, { method: 'DELETE' }), {
    success: 'Deleted',
    onDone: () => {
      setSelected(null);
      setDraft(null);
    },
  });

  const patch = (changes) => setDraft((current) => ({ ...current, ...changes }));

  return (
    <>
      <PageHeader title={title}>
        <button type="button" className="adm-btn" onClick={startNew}>
          <FaPlus aria-hidden="true" /> New category
        </button>
      </PageHeader>

      {isPending && <Loading />}
      {isError && <p className="adm-error">{error.message}</p>}

      {categories && (
        <div className="adm-split">
          <ul className="adm-list" aria-label={`${title} categories`}>
            {categories.length === 0 && <li className="adm-muted">Nothing here yet.</li>}
            {categories.map((category) => (
              <li key={category.slug}>
                <button type="button" className={selected === category.slug ? 'is-active' : ''} onClick={() => setSelected(category.slug)}>
                  <strong>{category.name}</strong>
                  <span>{category[itemsKey]?.length || 0} {itemLabel.toLowerCase()}s</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="adm-card">
            {!draft && <p className="adm-muted">Choose a category on the left, or create a new one.</p>}
            {draft && (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  save.mutate(draft);
                }}
              >
                <div className="adm-grid">
                  <TextField label="Category name" value={draft.name} onChange={(name) => patch({ name })} required />
                  <TextField
                    label="Address (slug)"
                    hint={selected === 'new' ? 'Leave empty to create it from the name' : 'Fixed after creation'}
                    value={draft.slug}
                    onChange={(slug) => patch({ slug })}
                    disabled={selected !== 'new'}
                  />
                  <TextAreaField label="Description" rows={2} value={draft.description} onChange={(description) => patch({ description })} />
                  {extraFields?.(draft, patch)}
                  <NumberField label="Order" hint="Lower numbers appear first" value={draft.displayOrder} onChange={(displayOrder) => patch({ displayOrder })} />
                </div>

                <h2 className="adm-section-title">{itemLabel}s</h2>
                <RepeatList
                  items={draft[itemsKey] || []}
                  onChange={(items) => patch({ [itemsKey]: items })}
                  newItem={() => newItem(draft[itemsKey]?.length || 0)}
                  itemLabel={itemLabel}
                  renderItem={renderItem}
                />

                <div className="adm-actions adm-sticky-actions">
                  <button type="submit" className="adm-btn is-primary" disabled={save.isPending}>
                    {save.isPending ? 'Saving…' : 'Save category'}
                  </button>
                  {selected !== 'new' && (
                    <button
                      type="button"
                      className="adm-btn is-danger"
                      disabled={remove.isPending}
                      onClick={() => window.confirm(`Delete "${draft.name}" and all its ${itemLabel.toLowerCase()}s?`) && remove.mutate(draft.slug)}
                    >
                      <FaTrash aria-hidden="true" /> Delete category
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

export default CategoryManager;
