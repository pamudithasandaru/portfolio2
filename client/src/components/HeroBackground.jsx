import { useEffect, useRef } from 'react';
import '../styles/HeroBackground.css';

const SPACING = 34;
const POINTER_RADIUS = 280;

const cssVar = (name, fallback) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

// A quiet grid of dots (think of a data matrix). At rest it is barely visible
// with a very slow ripple moving across it. Near the pointer the dots grow,
// shift slightly and pick up the --signal color. Colors come from the theme
// tokens. With reduced motion on, it draws one still frame.
const HeroBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) {
      return undefined;
    }

    const ctx = canvas.getContext('2d');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let ink = cssVar('--ink', '#474343');
    let signal = cssVar('--signal', '#3b5bdb');
    let frame = 0;
    let running = false;
    let visible = true;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false, strength: 0 };

    function draw(time = 0) {
      ctx.clearRect(0, 0, width, height);

      const offsetX = (width - (cols - 1) * SPACING) / 2;
      const offsetY = (height - (rows - 1) * SPACING) / 2;
      const t = time * 0.0004;

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          let x = offsetX + col * SPACING;
          let y = offsetY + row * SPACING;

          // very slow diagonal ripple so the grid is never completely static
          const ripple = (Math.sin(x * 0.012 + y * 0.012 - t) + 1) / 2;
          let radius = 1 + ripple * 0.35;
          let alpha = 0.1 + ripple * 0.07;
          let near = 0;

          if (pointer.strength > 0.01) {
            const dx = x - pointer.x;
            const dy = y - pointer.y;
            const dist = Math.hypot(dx, dy);
            if (dist < POINTER_RADIUS) {
              near = (1 - dist / POINTER_RADIUS) ** 2 * pointer.strength;
              // lens effect: dots bulge slightly away from the pointer
              if (dist > 0.1) {
                x += (dx / dist) * near * 12;
                y += (dy / dist) * near * 12;
              }
              radius += near * 2.6;
              alpha += near * 0.55;
            }
          }

          ctx.globalAlpha = Math.min(alpha, 0.9);
          ctx.fillStyle = near > 0.04 ? signal : ink;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
    }

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      cols = Math.floor(width / SPACING) + 1;
      rows = Math.floor(height / SPACING) + 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
    };

    const loop = (time) => {
      pointer.x += (pointer.tx - pointer.x) * 0.16;
      pointer.y += (pointer.ty - pointer.y) * 0.16;
      pointer.strength += ((pointer.active ? 1 : 0) - pointer.strength) * 0.08;
      draw(time);
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || reducedMotion.matches || !visible || document.hidden) {
        return;
      }
      running = true;
      frame = requestAnimationFrame(loop);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const onPointerMove = (event) => {
      const rect = host.getBoundingClientRect();
      pointer.tx = event.clientX - rect.left;
      pointer.ty = event.clientY - rect.top;
      if (!pointer.active) {
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
      }
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const onVisibility = () => (document.hidden ? stop() : start());

    const onMotionChange = () => {
      stop();
      if (reducedMotion.matches) {
        pointer.active = false;
        pointer.strength = 0;
        draw(0);
      } else {
        start();
      }
    };

    // repaint with the new colors when the theme toggles
    const themeObserver = new MutationObserver(() => {
      ink = cssVar('--ink', '#474343');
      signal = cssVar('--signal', '#3b5bdb');
      if (!running) {
        draw(0);
      }
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        start();
      } else {
        stop();
      }
    });
    visibilityObserver.observe(host);

    host.addEventListener('pointermove', onPointerMove);
    host.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);
    reducedMotion.addEventListener('change', onMotionChange);

    resize();
    start();

    return () => {
      stop();
      themeObserver.disconnect();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      reducedMotion.removeEventListener('change', onMotionChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-background" aria-hidden="true" />;
};

export default HeroBackground;
