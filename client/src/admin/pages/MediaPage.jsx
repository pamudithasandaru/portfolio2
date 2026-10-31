import { MediaGrid, PageHeader } from '../ui';

const MediaPage = () => (
  <>
    <PageHeader title="Image library" />
    <div className="adm-card">
      <p className="adm-muted">
        Everything you upload in the editors lands here. Click an image to copy its address. Images up to 4 MB;
        large JPEG and PNG photos are shrunk automatically.
      </p>
      <MediaGrid />
    </div>
  </>
);

export default MediaPage;
