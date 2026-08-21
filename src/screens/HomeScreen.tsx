import React from 'react';
import { useStore } from '../context/StoreContext';
import { AppCard } from '../components/AppCard';
import { AppCategory } from '../types';
import { ShieldCheck, Sparkles, TrendingUp, Flame, Cpu, Gamepad2, Shield } from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const { apps, searchQuery, selectedCategory, setSelectedCategory } = useStore();

  const categories: { id: AppCategory | 'ALL'; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'ALL', label: 'All Apps', icon: Sparkles },
    { id: 'GAMES', label: 'Games', icon: Gamepad2 },
    { id: 'SECURITY', label: 'Security', icon: Shield },
    { id: 'AI_AGENTS', label: 'AI Models', icon: Cpu },
    { id: 'PRODUCTIVITY', label: 'Productivity', icon: TrendingUp },
  ];

  const featuredApp = apps.find((a) => a.isFeatured) || apps[0];

  const filteredApps = apps.filter((app) => {
    const matchesCategory = selectedCategory === 'ALL' || app.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.developer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const trendingApps = filteredApps.filter((a) => a.isTrending);

  return (
    <div className="space-y-8 pb-12">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
                isActive
                  ? 'bg-[#6750A4] text-white shadow-md'
                  : 'bg-white dark:bg-[#1E1F23] text-[#49454F] dark:text-[#CAC4D0] border border-black/5 dark:border-white/5 hover:border-[#6750A4]/30'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Featured Spotlight Banner */}
      {!searchQuery && selectedCategory === 'ALL' && featuredApp && (
        <section>
          <AppCard app={featuredApp} featuredLayout />
        </section>
      )}

      {/* Security Verification Banner */}
      <section className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-500">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#1D1B20] dark:text-[#E6E1E5]">
              AVANYX CyberShield Security Active
            </h3>
            <p className="text-xs text-[#49454F] dark:text-[#CAC4D0]">
              Every APK is automatically analyzed for malicious code, malware signatures, and privacy leaks.
            </p>
          </div>
        </div>
      </section>

      {/* Trending & Popular */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
            {selectedCategory === 'ALL' ? 'Trending Apps & Games' : `${selectedCategory} Spotlight`}
          </h2>
          <span className="text-xs font-bold text-[#6750A4] dark:text-[#D0BCFF]">
            {filteredApps.length} Verified Apps
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      </section>
    </div>
  );
};
