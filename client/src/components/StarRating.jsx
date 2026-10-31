import { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const STARS = [1, 2, 3, 4, 5];

// Read-only stars; `value` can be fractional (e.g. 4.3 fills 4 stars and 30% of the fifth)
export const StarsDisplay = ({ value = 0, label }) => (
  <span
    className="stars-display"
    role="img"
    aria-label={label || `${value} out of 5 stars`}
  >
    <span className="stars-row stars-row-empty" aria-hidden="true">
      {STARS.map((n) => (
        <FaStar key={n} />
      ))}
    </span>
    <span
      className="stars-row stars-row-filled"
      style={{ width: `${Math.max(0, Math.min(5, value)) * 20}%` }}
      aria-hidden="true"
    >
      {STARS.map((n) => (
        <FaStar key={n} />
      ))}
    </span>
  </span>
);

// Clickable 1-5 star input, keyboard and screen-reader friendly
export const StarsInput = ({ value = 0, onChange, disabled = false }) => {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div
      className="stars-input"
      role="radiogroup"
      aria-label="Rate this post"
      onMouseLeave={() => setHover(0)}
    >
      {STARS.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className={`stars-input-btn ${n <= shown ? 'is-on' : ''}`}
          disabled={disabled}
          onMouseEnter={() => setHover(n)}
          onFocus={() => setHover(n)}
          onBlur={() => setHover(0)}
          onClick={() => onChange(n)}
        >
          <FaStar aria-hidden="true" />
        </button>
      ))}
    </div>
  );
};
