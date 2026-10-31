import { useEffect, useState } from 'react';
import { SOCIAL_PLATFORMS } from '../../components/SocialIcon';
import { mergeSiteContent, siteDefaults } from '../../content/siteDefaults';
import { adminFetch } from '../api';
import { useAdminAction, useAdminQuery } from '../hooks';
import { CheckField, ImageField, Loading, PageHeader, RepeatList, SelectField, TextAreaField, TextField } from '../ui';

const TABS = [
  { key: 'hero', label: 'Home banner' },
  { key: 'about', label: 'About' },
  { key: 'socials', label: 'Social links' },
  { key: 'footer', label: 'Footer' },
  { key: 'navbar', label: 'Top bar' },
];

const SiteContentPage = () => {
  const { data, isPending, isError, error } = useAdminQuery(['site-content'], '/api/site-content');
  const [draft, setDraft] = useState(null);
  const [tab, setTab] = useState('hero');

  useEffect(() => {
    if (data) {
      setDraft(structuredClone(mergeSiteContent(data)));
    }
  }, [data]);

  const save = useAdminAction(() => adminFetch('/api/site-content', { method: 'PUT', body: draft }), {
    success: 'Saved. The public site shows the change within a few minutes.',
  });

  if (isPending) {
    return <Loading />;
  }
  if (isError || !draft) {
    return <p className="adm-error">{error?.message}</p>;
  }

  const section = draft[tab];
  const setSection = (value) => setDraft({ ...draft, [tab]: value });
  const patch = (changes) => setSection({ ...section, ...changes });

  const resetSection = () => {
    if (window.confirm('Put this section back to the original text? (Not saved until you press Save.)')) {
      setSection(structuredClone(siteDefaults[tab]));
    }
  };

  return (
    <>
      <PageHeader title="Site content">
        <button type="button" className="adm-btn is-ghost" onClick={resetSection}>
          Reset this section
        </button>
        <button type="button" className="adm-btn is-primary" onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? 'Saving…' : 'Save all changes'}
        </button>
      </PageHeader>

      <div className="adm-tabs" role="tablist">
        {TABS.map((item) => (
          <button key={item.key} type="button" role="tab" aria-selected={tab === item.key} className={tab === item.key ? 'is-active' : ''} onClick={() => setTab(item.key)}>
            {item.label}
          </button>
        ))}
      </div>

      <div className="adm-card">
        {tab === 'navbar' && (
          <div className="adm-grid">
            <TextField label="Name in the top bar" value={section.logoText} onChange={(logoText) => patch({ logoText })} />
            <TextField label="Email in the top bar" value={section.email} onChange={(email) => patch({ email })} />
          </div>
        )}

        {tab === 'hero' && (
          <div className="adm-grid">
            <TextField label="Greeting" value={section.greeting} onChange={(greeting) => patch({ greeting })} />
            <TextField label="Name / headline" value={section.name} onChange={(name) => patch({ name })} />
            <TextField label="Subtitle" value={section.subtitle} onChange={(subtitle) => patch({ subtitle })} />
            <TextField label="Current role" value={section.roleText} onChange={(roleText) => patch({ roleText })} />
            <TextField label="Button label" value={section.hireLabel} onChange={(hireLabel) => patch({ hireLabel })} />
            <TextField label="Profile photo description" hint="Read aloud by screen readers" value={section.profileAlt} onChange={(profileAlt) => patch({ profileAlt })} />
            <ImageField label="Profile photo" hint="Leave empty to use the photo that ships with the site" value={section.profileImage} onChange={(profileImage) => patch({ profileImage })} />
            <ImageField label="Company logo" hint="Leave empty to use the default logo" value={section.companyLogo} onChange={(companyLogo) => patch({ companyLogo })} />
          </div>
        )}

        {tab === 'about' && (
          <>
            <div className="adm-grid">
              <TextField label="Section title" value={section.title} onChange={(title) => patch({ title })} />
              <TextField label="Intro: greeting" value={section.greeting} onChange={(greeting) => patch({ greeting })} />
              <TextField label="Intro: highlighted name" value={section.name} onChange={(name) => patch({ name })} />
              <TextAreaField label="Intro: rest of the sentence" hint="Starts right after the name, e.g. “, a passionate developer…”" rows={3} value={section.intro} onChange={(intro) => patch({ intro })} />
            </div>

            <h2 className="adm-section-title">Paragraphs</h2>
            <RepeatList
              items={section.paragraphs}
              onChange={(paragraphs) => patch({ paragraphs })}
              itemLabel="Paragraph"
              newItem={() => ''}
              renderItem={(text, _patch, index) => (
                <TextAreaField label="Text" rows={4} value={text} onChange={(next) => patch({ paragraphs: section.paragraphs.map((p, i) => (i === index ? next : p)) })} />
              )}
            />

            <h2 className="adm-section-title">Numbers</h2>
            <RepeatList
              items={section.stats}
              onChange={(stats) => patch({ stats })}
              itemLabel="Number"
              newItem={() => ({ number: '', label: '' })}
              renderItem={(stat, patchStat) => (
                <>
                  <TextField label="Number" value={stat.number} onChange={(number) => patchStat({ number })} />
                  <TextField label="Label" value={stat.label} onChange={(label) => patchStat({ label })} />
                </>
              )}
            />

            <h2 className="adm-section-title">Education</h2>
            <div className="adm-grid">
              <TextField label="Education heading" value={section.educationTitle} onChange={(educationTitle) => patch({ educationTitle })} />
            </div>
            <RepeatList
              items={section.education}
              onChange={(education) => patch({ education })}
              itemLabel="Entry"
              newItem={() => ({ year: '', role: '', meta: '' })}
              renderItem={(entry, patchEntry) => (
                <>
                  <TextField label="Years" value={entry.year} onChange={(year) => patchEntry({ year })} />
                  <TextField label="Title" value={entry.role} onChange={(role) => patchEntry({ role })} />
                  <TextField label="School / place" wide value={entry.meta} onChange={(meta) => patchEntry({ meta })} />
                </>
              )}
            />

            <h2 className="adm-section-title">Contact form</h2>
            <div className="adm-grid">
              <TextField label="Heading" value={section.contactHeading} onChange={(contactHeading) => patch({ contactHeading })} />
              <TextAreaField label="Intro text" rows={2} value={section.contactIntro} onChange={(contactIntro) => patch({ contactIntro })} />
            </div>
          </>
        )}

        {tab === 'socials' && (
          <RepeatList
            items={draft.socials}
            onChange={(socials) => setDraft({ ...draft, socials })}
            itemLabel="Link"
            newItem={() => ({ platform: 'website', url: '', inHero: true, inFooter: true })}
            renderItem={(social, patchSocial) => (
              <>
                <SelectField label="Network" value={social.platform} onChange={(platform) => patchSocial({ platform })} options={SOCIAL_PLATFORMS} />
                <TextField label="Link" value={social.url} onChange={(url) => patchSocial({ url })} placeholder="https://…" />
                <CheckField label="Show on home banner" checked={social.inHero} onChange={(inHero) => patchSocial({ inHero })} />
                <CheckField label="Show in footer" checked={social.inFooter} onChange={(inFooter) => patchSocial({ inFooter })} />
              </>
            )}
          />
        )}

        {tab === 'footer' && (
          <div className="adm-grid">
            <TextField label="Brand name" value={section.brand} onChange={(brand) => patch({ brand })} />
            <TextField label="Subtitle" value={section.subtitle} onChange={(subtitle) => patch({ subtitle })} />
            <TextAreaField label="Description" rows={3} value={section.description} onChange={(description) => patch({ description })} />
            <TextField label="Email" hint="Leave empty to hide" value={section.email} onChange={(email) => patch({ email })} />
            <TextField label="Phone" hint="Leave empty to hide" value={section.phone} onChange={(phone) => patch({ phone })} />
            <TextField label="Name in the copyright line" value={section.copyrightName} onChange={(copyrightName) => patch({ copyrightName })} />
          </div>
        )}
      </div>
    </>
  );
};

export default SiteContentPage;
