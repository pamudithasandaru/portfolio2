import { useEffect, useRef } from 'react';

// threshold 0 (not a fraction of the element): tall elements such as the About body
// must reveal as soon as they enter the viewport, not once 10% of their height is visible.
const useScrollAnimation = ({ threshold = 0, rootMargin = '0px 0px -8% 0px' } = {}) => {
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
    }, { threshold, rootMargin });

    const element = elementRef.current;
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return elementRef;
};

export default useScrollAnimation;
