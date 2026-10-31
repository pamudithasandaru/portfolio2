import CategoryManager from '../CategoryManager';
import { toDateInput } from '../api';
import { ImageField, NumberField, TagsField, TextField } from '../ui';

const CertificationsPage = () => (
  <CategoryManager
    title="Certifications"
    path="/api/certification-categories"
    itemsKey="certificates"
    itemLabel="Certificate"
    newItem={(count) => ({
      certificateTitle: '',
      issuingOrganization: '',
      issueDate: '',
      expireDate: '',
      credentialId: '',
      credentialUrl: '',
      skills: [],
      mediaFileUrl: '',
      displayOrder: count,
    })}
    prepare={(category) => ({
      ...category,
      certificates: (category.certificates || []).map((certificate) => ({
        ...certificate,
        expireDate: certificate.expireDate || null,
      })),
    })}
    renderItem={(certificate, patch) => (
      <>
        <TextField label="Certificate title" value={certificate.certificateTitle} onChange={(certificateTitle) => patch({ certificateTitle })} required />
        <TextField label="Issued by" value={certificate.issuingOrganization} onChange={(issuingOrganization) => patch({ issuingOrganization })} required />
        <TextField label="Issue date" type="date" value={toDateInput(certificate.issueDate)} onChange={(issueDate) => patch({ issueDate })} required />
        <TextField label="Expiry date" hint="Leave empty if it does not expire" type="date" value={toDateInput(certificate.expireDate)} onChange={(expireDate) => patch({ expireDate })} />
        <TextField label="Credential ID" value={certificate.credentialId} onChange={(credentialId) => patch({ credentialId })} />
        <TextField label="Credential link" value={certificate.credentialUrl} onChange={(credentialUrl) => patch({ credentialUrl })} />
        <TagsField label="Skills" value={certificate.skills || []} onChange={(skills) => patch({ skills })} />
        <NumberField label="Order" value={certificate.displayOrder} onChange={(displayOrder) => patch({ displayOrder })} />
        <ImageField label="Certificate image" value={certificate.mediaFileUrl} onChange={(mediaFileUrl) => patch({ mediaFileUrl })} />
      </>
    )}
  />
);

export default CertificationsPage;
