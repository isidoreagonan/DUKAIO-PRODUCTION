import React from 'react';
import { StatItem } from './types';

interface StatsBarProps {
  stats: StatItem[];
  columns?: 4 | 2;
  className?: string;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats, columns = 4, className = '' }) => {
  const gridColsClass =
    columns === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <section className={`bg-white border-y border-hair ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className={`grid ${gridColsClass} divide-y sm:divide-y-0 sm:divide-x divide-hair`}>
          {stats.map((stat, idx) => (
            <div key={idx} className="p-8 text-center flex flex-col justify-center items-center">
              <span className="font-serif text-4xl lg:text-5xl font-normal text-blue tracking-tight block">
                {stat.value}
              </span>
              <span className="font-mono text-xs uppercase tracking-widest text-ink font-medium mt-2 block">
                {stat.label}
              </span>
              {stat.description && (
                <p className="text-sm text-slate mt-2 max-w-xs font-sans">
                  {stat.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
