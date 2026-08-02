import React from 'react';
import { StatsBar } from './StatsBar';
import { tractionStatsData } from './data';

export const TractionStats: React.FC = () => {
  return (
    <div className="bg-slate-50 py-12 border-b border-hair">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-slate">
            TRACTION & EMPREINTE RÉGIONALE
          </span>
        </div>
        <StatsBar stats={tractionStatsData} columns={2} className="border-0 bg-transparent" />
      </div>
    </div>
  );
};
