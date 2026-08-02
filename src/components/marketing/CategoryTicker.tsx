import React from 'react';
import { categoryList } from './data';

export const CategoryTicker: React.FC = () => {
  // Duplicate array twice to ensure smooth infinite loop
  const duplicatedCategories = [...categoryList, ...categoryList, ...categoryList];

  return (
    <div className="bg-slate-50/80 border-y border-hair py-5 overflow-hidden select-none ticker-container">
      <div className="flex w-max gap-3 animate-scroll-40s hover:[animation-play-state:paused]">
        {duplicatedCategories.map((cat, idx) => (
          <div
            key={`${cat}-${idx}`}
            className="flex-shrink-0 inline-flex items-center gap-2 rounded-full border border-hair px-4 py-2 text-sm font-mono text-ink bg-white shadow-xs hover:border-blue transition-colors cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue" />
            <span>{cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
