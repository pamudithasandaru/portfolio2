import CategoryManager from '../CategoryManager';
import { ImageField, NumberField, TagsField, TextAreaField, TextField } from '../ui';

const ProjectsPage = () => (
  <CategoryManager
    title="Projects"
    path="/api/project-categories"
    itemsKey="projects"
    itemLabel="Project"
    newItem={(count) => ({
      title: '',
      shortDescription: '',
      technologies: [],
      githubUrl: '',
      liveUrl: '',
      coverImageUrl: '',
      videoThumbnailUrl: '',
      demoVideoUrl: '',
      displayOrder: count,
    })}
    extraFields={(draft, patch) => (
      <TagsField label="Keywords" value={draft.keywords || []} onChange={(keywords) => patch({ keywords })} />
    )}
    renderItem={(project, patch) => (
      <>
        <TextField label="Title" value={project.title} onChange={(title) => patch({ title })} required />
        <NumberField label="Order" value={project.displayOrder} onChange={(displayOrder) => patch({ displayOrder })} />
        <TextAreaField label="Short description" rows={3} value={project.shortDescription} onChange={(shortDescription) => patch({ shortDescription })} />
        <TagsField label="Technologies" value={project.technologies || []} onChange={(technologies) => patch({ technologies })} />
        <TextField label="GitHub link" value={project.githubUrl} onChange={(githubUrl) => patch({ githubUrl })} />
        <TextField label="Live demo link" value={project.liveUrl} onChange={(liveUrl) => patch({ liveUrl })} />
        <TextField label="Demo video link" wide value={project.demoVideoUrl} onChange={(demoVideoUrl) => patch({ demoVideoUrl })} />
        <ImageField label="Cover image" value={project.coverImageUrl} onChange={(coverImageUrl) => patch({ coverImageUrl })} />
        <ImageField label="Video thumbnail" value={project.videoThumbnailUrl} onChange={(videoThumbnailUrl) => patch({ videoThumbnailUrl })} />
      </>
    )}
  />
);

export default ProjectsPage;
