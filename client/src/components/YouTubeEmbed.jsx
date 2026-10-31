// Video id from the usual YouTube link shapes (watch, youtu.be, embed, shorts), or null
export const youtubeId = (href = '') => {
  try {
    const url = new URL(href);
    const host = url.hostname.replace(/^(www|m)\./, '');
    let id = null;

    if (host === 'youtu.be') {
      id = url.pathname.slice(1).split('/')[0];
    } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      id = url.pathname === '/watch' ? url.searchParams.get('v') : url.pathname.match(/^\/(?:embed|shorts)\/([\w-]+)/)?.[1];
    }

    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
};

// Privacy-friendly embed (youtube-nocookie) that loads only when scrolled near
const YouTubeEmbed = ({ id, title = 'YouTube video' }) => (
  <figure className="blog-video">
    <div className="blog-video-frame">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title={title}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  </figure>
);

export default YouTubeEmbed;
