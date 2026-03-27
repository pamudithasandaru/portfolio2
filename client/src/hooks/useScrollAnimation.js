import { useEffect, useRef } from 'react';

const useScrollAnimation = (options = {}) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Element is entering the viewport
          entry.target.classList.remove('animate-on-scroll-out');
          entry.target.classList.add('animate-on-scroll');
        } else {
          // Element is leaving the viewport
          entry.target.classList.remove('animate-on-scroll');
          entry.target.classList.add('animate-on-scroll-out');
        }
      });
    }, {
      threshold: 0.1,
      ...options,
    });

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [options]);

  return elementRef;
};

export default useScrollAnimation;
