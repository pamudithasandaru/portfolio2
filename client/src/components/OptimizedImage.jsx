import React from 'react';

const LOCAL_RASTER = /^\/images\/.+\.(png|jpe?g)$/i;
const SIZES = [480, 960];

// Local /images/* files have WebP variants (see scripts/optimize-images.mjs).
// Anything else (remote URLs, data URIs) is rendered as a plain <img>.
const OptimizedImage = ({ src, alt, sizes = '(max-width: 768px) 100vw, 480px', loading = 'lazy', ...rest }) => {
  if (!src || !LOCAL_RASTER.test(src)) {
    return <img src={src} alt={alt} loading={loading} decoding="async" {...rest} />;
  }

  const base = src.replace(/\.(png|jpe?g)$/i, '');
  const srcSet = [...SIZES.map((w) => `${base}-${w}.webp ${w}w`), `${base}.webp 1600w`].join(', ');

  return (
    <picture>
      <source type="image/webp" srcSet={srcSet} sizes={sizes} />
      <img src={src} alt={alt} loading={loading} decoding="async" {...rest} />
    </picture>
  );
};

export default OptimizedImage;
