import React from 'react';

const SkeletonCard = () => (
  <div className="product-card animate-pulse">
    <div className="aspect-[3/4] skeleton" />
    <div className="p-4 space-y-2">
      <div className="h-4 skeleton rounded w-3/4" />
      <div className="h-3 skeleton rounded w-1/2" />
      <div className="h-5 skeleton rounded w-1/3" />
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 8 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
    {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
);

export default SkeletonCard;
