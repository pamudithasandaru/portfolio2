import React from 'react';
import '../styles/Skeleton.css';

export const Skeleton = ({ width, height, radius, className = '' }) => (
  <span
    className={`skeleton ${className}`}
    style={{ width, height, borderRadius: radius }}
    aria-hidden="true"
  />
);

const Group = ({ label, className, children }) => (
  <div className={className} role="status" aria-live="polite" aria-busy="true">
    <span className="sr-only">{label}</span>
    {children}
  </div>
);

export const CardListSkeleton = ({ count = 3, label = 'Loading' }) => (
  <Group label={label} className="skeleton-list">
    {Array.from({ length: count }, (_, i) => (
      <div className="skeleton-card" key={i}>
        <Skeleton width="45%" height="1.1rem" />
        <Skeleton width="30%" height="0.8rem" />
        <Skeleton width="100%" height="0.8rem" />
        <Skeleton width="85%" height="0.8rem" />
      </div>
    ))}
  </Group>
);

export const GridSkeleton = ({ count = 6, label = 'Loading' }) => (
  <Group label={label} className="skeleton-grid">
    {Array.from({ length: count }, (_, i) => (
      <div className="skeleton-card" key={i}>
        <Skeleton width="100%" height="160px" radius="10px" />
        <Skeleton width="70%" height="1rem" />
        <Skeleton width="50%" height="0.8rem" />
      </div>
    ))}
  </Group>
);

export const TagsSkeleton = ({ label = 'Loading' }) => (
  <Group label={label} className="skeleton-tags">
    {Array.from({ length: 10 }, (_, i) => (
      <Skeleton key={i} width={`${70 + ((i * 17) % 50)}px`} height="2rem" radius="999px" />
    ))}
  </Group>
);
