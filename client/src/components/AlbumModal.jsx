import React, { useEffect, useRef, useState } from 'react';
import OptimizedImage from './OptimizedImage';
import '../styles/AlbumModal.css';

const AlbumModal = ({ isOpen, onClose, images, organizationName }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoadError, setImageLoadError] = useState({});
  const closeButtonRef = useRef(null);
  const imageCount = images?.length || 0;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Keyboard support: Escape closes, arrows move through the album
  useEffect(() => {
    if (!isOpen || imageCount === 0) {
      return undefined;
    }

    const previouslyFocused = document.activeElement;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
      } else if (event.key === 'ArrowRight') {
        setCurrentImageIndex((index) => (index + 1) % imageCount);
        setImageLoadError({});
      } else if (event.key === 'ArrowLeft') {
        setCurrentImageIndex((index) => (index === 0 ? imageCount - 1 : index - 1));
        setImageLoadError({});
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isOpen, imageCount]);

  if (!isOpen || !images || images.length === 0) {
    return null;
  }

  // Convert image data to proper format if needed
  const formattedImages = images.map((img) => {
    // If it's already a full data URL or a path
    if (img && typeof img === 'string') {
      // If it's a data URL, return as is
      if (img.startsWith('data:')) {
        return img;
      }
      // If it's a relative path (starts with /), return as is
      if (img.startsWith('/')) {
        return img;
      }
      // If it's just base64, add the prefix
      return `data:image/jpeg;base64,${img}`;
    }
    // If it's an object with data field (old format)
    if (img && typeof img === 'object' && img.data) {
      return img.data.startsWith('data:')
        ? img.data
        : `data:${img.contentType || 'image/jpeg'};base64,${img.data}`;
    }
    return img;
  });

  const handleNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % formattedImages.length);
    setImageLoadError({});
  };

  const handlePrev = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? formattedImages.length - 1 : prevIndex - 1
    );
    setImageLoadError({});
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
    setImageLoadError({});
  };

  const handleImageError = (index) => {
    setImageLoadError((prev) => ({
      ...prev,
      [index]: true,
    }));
  };

  const currentImage = formattedImages[currentImageIndex];
  const hasError = imageLoadError[currentImageIndex];

  return (
    <div className="album-modal-overlay" onClick={onClose}>
      <div
        className="album-modal-content"
        role="dialog"
        aria-modal="true"
        aria-label={`${organizationName} photo album`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="album-modal-header">
          <h3>{organizationName} - Album</h3>
          <button className="album-modal-close" onClick={onClose} ref={closeButtonRef} aria-label="Close album">
            ✕
          </button>
        </div>

        <div className="album-modal-main">
          <div className="album-main-image">
            {currentImage && !hasError ? (
              <OptimizedImage
                src={currentImage}
                alt={`${organizationName} - Photo ${currentImageIndex + 1}`}
                sizes="(max-width: 768px) 100vw, 900px"
                loading="eager"
                onError={() => handleImageError(currentImageIndex)}
              />
            ) : (
              <div className="album-image-placeholder">
                <p>Unable to load image</p>
                <small>{currentImage}</small>
              </div>
            )}
          </div>

          <div className="album-navigation">
            <button className="album-nav-btn prev-btn" onClick={handlePrev} aria-label="Previous photo">
              ❮
            </button>
            <span className="album-counter">
              {currentImageIndex + 1} / {formattedImages.length}
            </span>
            <button className="album-nav-btn next-btn" onClick={handleNext} aria-label="Next photo">
              ❯
            </button>
          </div>
        </div>

        {formattedImages.length > 1 && (
          <div className="album-thumbnails">
            {formattedImages.map((image, index) => (
              <div
                key={index}
                className={`album-thumbnail ${
                  index === currentImageIndex ? 'active' : ''
                }`}
                role="button"
                tabIndex={0}
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === currentImageIndex}
                onClick={() => handleThumbnailClick(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleThumbnailClick(index);
                  }
                }}
              >
                <OptimizedImage
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  sizes="120px"
                  onError={() => handleImageError(index)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumModal;
