import { useEffect } from 'react';

// Sets the tab title and meta description while a page is mounted, then restores them
const useDocumentMeta = (title, description) => {
  useEffect(() => {
    if (!title) {
      return undefined;
    }

    const previousTitle = document.title;
    const descriptionTag = document.querySelector('meta[name="description"]');
    const previousDescription = descriptionTag?.getAttribute('content');

    document.title = title;
    if (descriptionTag && description) {
      descriptionTag.setAttribute('content', description);
    }

    return () => {
      document.title = previousTitle;
      if (descriptionTag && previousDescription !== null && previousDescription !== undefined) {
        descriptionTag.setAttribute('content', previousDescription);
      }
    };
  }, [title, description]);
};

export default useDocumentMeta;
