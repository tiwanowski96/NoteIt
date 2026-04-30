import React from 'react';

function SkeletonLoader() {
  return (
    <div className="skeleton-container">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-line skeleton-title" />
          <div className="skeleton-line skeleton-text" />
          <div className="skeleton-line skeleton-text short" />
          <div className="skeleton-line skeleton-meta" />
        </div>
      ))}
    </div>
  );
}

export default SkeletonLoader;
