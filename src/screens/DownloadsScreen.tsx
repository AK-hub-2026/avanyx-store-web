import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  Download,
  Pause,
  Play,
  X,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  HardDrive
} from 'lucide-react';

export const DownloadsScreen: React.FC = () => {
  const {
    downloads,
    apps,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    uninstallApp,
    openAppDetails
  } = useStore();

  const activeDownloads = downloads.filter((d) => d.status === 'DOWNLOADING' || d.status === 'PAUSED');
  const installedApps = apps.filter((a) => a.isInstalled);

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2">
            <Download className="w-7 h-7 text-[#6750A4] dark:text-[#D0BCFF]" />
            Download & App Manager
          </h1>
          <p className="text-xs text-[#49454F] dark:text-[#CAC4D0]">
            Monitor active APK transfers, verify SHA-256 signatures, and manage installed software
          </p>
        </div>
      </div>

      {/* Active Downloads Section */}
      <section className="space-y-4">
        <h2 className="text-base font-extrabold text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-[#6750A4]" /> Active Downloads ({activeDownloads.length})
        </h2>

        {activeDownloads.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5">
            <p className="text-xs font-semibold text-[#49454F] dark:text-[#CAC4D0]">
              No active downloads running in background.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeDownloads.map((task) => (
              <div
                key={task.appId}
                className="p-4 rounded-2xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={task.iconUrl}
                      alt={task.appName}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-black/5"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-[#1D1B20] dark:text-[#E6E1E5]">
                        {task.appName}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-[#49454F] dark:text-[#CAC4D0] mt-0.5">
                        <span className="font-semibold text-amber-500">{task.speed}</span>
                        <span>•</span>
                        <span>{task.totalSize}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {task.status === 'DOWNLOADING' ? (
                      <button
                        onClick={() => pauseDownload(task.appId)}
                        className="p-2 rounded-xl bg-black/5 dark:bg-white/10 text-[#1D1B20] dark:text-[#E6E1E5] hover:bg-black/10"
                        title="Pause"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => resumeDownload(task.appId)}
                        className="p-2 rounded-xl bg-[#6750A4] text-white hover:bg-[#4F378B]"
                        title="Resume"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => cancelDownload(task.appId)}
                      className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0]">
                    <span>{task.status === 'PAUSED' ? 'Paused' : 'Downloading APK...'}</span>
                    <span>{task.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#6750A4] to-[#D0BCFF] transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Installed Applications */}
      <section className="space-y-4">
        <h2 className="text-base font-extrabold text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Installed Apps ({installedApps.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {installedApps.map((app) => (
            <div
              key={app.id}
              className="p-4 rounded-2xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 flex items-center justify-between gap-3"
            >
              <div
                onClick={() => openAppDetails(app.id)}
                className="flex items-center gap-3 cursor-pointer min-w-0"
              >
                <img
                  src={app.iconUrl}
                  alt={app.name}
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-[#1D1B20] dark:text-[#E6E1E5] truncate">
                    {app.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#49454F] dark:text-[#CAC4D0] mt-0.5">
                    <span className="text-emerald-500 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                    <span>•</span>
                    <span>v{app.version}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAppDetails(app.id)}
                  className="px-3 py-1.5 rounded-xl bg-[#6750A4] text-white text-xs font-bold hover:bg-[#4F378B]"
                >
                  Open
                </button>
                <button
                  onClick={() => uninstallApp(app.id)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10"
                  title="Uninstall"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
