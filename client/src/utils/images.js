const LOCAL_RASTER = /^\/images\/.+\.(png|jpe?g)$/i;

// CSS background value that prefers the WebP variant of a local image.
export const cssImage = (src) => {
  if (!src) {
    return 'none';
  }

  if (!LOCAL_RASTER.test(src)) {
    return `url(${src})`;
  }

  const webp = src.replace(/\.(png|jpe?g)$/i, '-960.webp');
  return `image-set(url(${webp}) type("image/webp"), url(${src}))`;
};
