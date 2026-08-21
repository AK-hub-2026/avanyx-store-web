import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { AppCard } from '../components/AppCard';
import { LayoutGrid, Cpu, Shield, TrendingUp, Sparkles, Filter } from 'lucide-react';
import { AppCategory } from '../types';

export const AppsScreen: React.FC = () => {
  const { apps } = useStore();
  const [filterCategory, setFilterCategory] = useState<AppCategory | 'ALL'>('ALL');

  const nonGameApps = apps.filter((a) => a.category !== 'GAMES');
  const filtered = nonGameApps.filter(
    (a) => filterCategory === 'ALL' || a.category === filterCategory
  );

  const categories: { id: AppCategory | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'SECURITY', label: 'Security & Antivirus' },
    { id: 'AI_AGENTS', label: 'AI Models & Agents' },
    { id: 'PRODUCTIVITY', label: 'Productivity' },
    { id: 'MEDIA', label: 'Audio & Video' },
    { id: 'SOCIAL', label: 'Social & Chat' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2">
            <LayoutGrid className="w-7 h-7 text-[#6750A4] dark:text-[#D0BCFF]" />
            Application Directory
          </h1>
          <p className="text-xs text-[#49454F] dark:text-[#CAC4D0]">
            Browse utility tools, AI assistants, productivity suites, and encrypted communications
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
              filterCategory === cat.id
                ? 'bg-[#6750A4] text-white shadow-md'
                : 'bg-white dark:bg-[#1E1F23] text-[#49454F] dark:text-[#CAC4D0] border border-black/5 dark:border-white/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
};
