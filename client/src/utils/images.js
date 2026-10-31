const LOCAL_RASTER = /^\/(?:blog-)?images\/.+\.(png|jpe?g)$/i;

// CSS background value that prefers the WebP variant of a local image.
// `width` picks the generated size: 480, 960, or 1600 (the full-size .webp).
export const cssImage = (src, width = 960) => {
  if (!src) {
    return 'none';
  }

  if (!LOCAL_RASTER.test(src)) {
    return `url(${src})`;
  }

  const webp = src.replace(/\.(png|jpe?g)$/i, width === 1600 ? '.webp' : `-${width}.webp`);
  return `image-set(url(${webp}) type("image/webp"), url(${src}))`;
};
