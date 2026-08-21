import React from 'react';
import { StoreApp } from '../types';
import { Star, ShieldCheck, Download, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface AppCardProps {
  app: StoreApp;
  featuredLayout?: boolean;
}

export const AppCard: React.FC<AppCardProps> = ({ app, featuredLayout }) => {
  const { openAppDetails, downloadApp, downloads } = useStore();

  const activeDownload = downloads.find((d) => d.appId === app.id);
  const isDownloading = activeDownload && activeDownload.status === 'DOWNLOADING';

  if (featuredLayout) {
    return (
      <div
        onClick={() => openAppDetails(app.id)}
        className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6750A4] to-[#4F378B] text-white p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between min-h-[260px]"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:scale-105 transition-transform duration-500"
          style={{ backgroundImage: `url(${app.bannerUrl})` }}
        />
        
        <div className="relative z-10 flex items-start justify-between">
          <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase">
            Featured Spotlight
          </span>
          <div className="flex items-center gap-1 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{app.securityScore}% Clean</span>
          </div>
        </div>

        <div className="relative z-10 mt-6 flex items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={app.iconUrl}
              alt={app.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/30 shadow-md"
            />
            <div>
              <h2 className="text-xl font-extrabold tracking-tight leading-snug">{app.name}</h2>
              <p className="text-xs text-white/80 font-medium">{app.developer}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-white/90">
                <span className="flex items-center gap-1 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {app.rating}
                </span>
                <span>•</span>
                <span>{app.downloads} downloads</span>
                <span>•</span>
                <span>{app.apkSize}</span>
              </div>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!app.isInstalled) downloadApp(app);
            }}
            className={`shrink-0 px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
              app.isInstalled
                ? 'bg-emerald-500 text-white'
                : isDownloading
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-white text-[#6750A4] hover:bg-white/90'
            }`}
          >
            {app.isInstalled ? (
              <>
                <Check className="w-4 h-4" /> Installed
              </>
            ) : isDownloading ? (
              `${activeDownload?.progress}%`
            ) : (
              <>
                <Download className="w-4 h-4" /> Get App
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => openAppDetails(app.id)}
      className="p-4 rounded-2xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 hover:border-[#6750A4]/30 dark:hover:border-[#D0BCFF]/30 hover:shadow-lg transition-all cursor-pointer flex items-center justify-between gap-4 group"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <img
          src={app.iconUrl}
          alt={app.name}
          className="w-13 h-13 rounded-2xl object-cover shrink-0 ring-1 ring-black/5 group-hover:scale-105 transition-transform"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-sm text-[#1D1B20] dark:text-[#E6E1E5] truncate">
              {app.name}
            </h3>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          </div>
          <p className="text-xs text-[#49454F] dark:text-[#CAC4D0] truncate mt-0.5">
            {app.developer}
          </p>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-[#49454F] dark:text-[#CAC4D0]">
            <span className="flex items-center gap-0.5 font-bold text-[#1D1B20] dark:text-[#E6E1E5]">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {app.rating}
            </span>
            <span>•</span>
            <span>{app.apkSize}</span>
          </div>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!app.isInstalled) downloadApp(app);
          else openAppDetails(app.id);
        }}
        className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
          app.isInstalled
            ? 'bg-[#E8DEF8] dark:bg-[#4A4458] text-[#6750A4] dark:text-[#D0BCFF]'
            : isDownloading
            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
            : 'bg-[#6750A4] hover:bg-[#4F378B] text-white shadow-sm'
        }`}
      >
        {app.isInstalled ? 'Open' : isDownloading ? `${activeDownload?.progress}%` : 'Get'}
      </button>
    </div>
  );
};
