import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  Download,
  Check,
  Share2,
  Lock,
  Cpu,
  Trash2,
  Github,
  ExternalLink,
  Copy
} from 'lucide-react';

export const AppDetailsScreen: React.FC = () => {
  const {
    selectedApp,
    closeAppDetails,
    openDeveloperProfile,
    downloadApp,
    uninstallApp,
    downloads
  } = useStore();

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  if (!selectedApp) return null;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyHash = () => {
    if (selectedApp?.sha256Checksum) {
      navigator.clipboard.writeText(selectedApp.sha256Checksum);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2500);
    }
  };

  const activeDownload = downloads.find((d) => d.appId === selectedApp.id);
  const isDownloading = activeDownload && activeDownload.status === 'DOWNLOADING';

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Top Back Nav */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={closeAppDetails}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-2">
          {copiedLink && (
            <span className="text-[11px] text-emerald-500 font-bold flex items-center gap-1 animate-fadeIn">
              <Check className="w-3.5 h-3.5" /> Link copied
            </span>
          )}
          <button
            onClick={handleCopyLink}
            className="p-2 rounded-xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 text-[#49454F] dark:text-[#CAC4D0] hover:text-[#1D1B20] transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Banner */}
      <div className="relative h-48 sm:h-64 rounded-3xl overflow-hidden shadow-lg">
        <img
          src={selectedApp.bannerUrl}
          alt={selectedApp.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* App Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 px-4 relative z-10">
        <div className="flex items-end gap-4">
          <img
            src={selectedApp.iconUrl}
            alt={selectedApp.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-white dark:ring-[#121316] shadow-2xl bg-white"
          />
          <div className="pb-1">
            <h1 className="text-xl sm:text-2xl font-black text-[#1D1B20] dark:text-[#E6E1E5]">
              {selectedApp.name}
            </h1>
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-xs text-[#49454F] dark:text-[#CAC4D0] font-medium">
                Developer:
              </span>
              <button
                onClick={() => openDeveloperProfile(selectedApp.developerUid || selectedApp.developer)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#6750A4] dark:text-[#D0BCFF] hover:underline bg-[#6750A4]/10 dark:bg-[#D0BCFF]/10 px-2 py-0.5 rounded-lg transition"
                title="View Public Developer Profile"
              >
                <span>{selectedApp.developer}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-[#6750A4] dark:text-[#D0BCFF]" />
                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
              </button>
            </div>
            <p className="text-[11px] font-mono text-[#49454F] dark:text-[#CAC4D0] mt-0.5">
              {selectedApp.packageName}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {selectedApp.downloadUrl && (
            <a
              href={selectedApp.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-4 py-3.5 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#1D1B20] dark:text-[#E6E1E5] font-bold text-xs flex items-center justify-center gap-2 transition-all border border-black/5 dark:border-white/5"
              title={`Direct GitHub Release APK: ${selectedApp.downloadUrl}`}
            >
              <Github className="w-4 h-4" /> Direct APK ({selectedApp.apkSize})
            </a>
          )}

          {selectedApp.isInstalled ? (
            <>
              <button
                className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-[#6750A4] text-white font-bold text-xs shadow-md"
              >
                Open Application
              </button>
              <button
                onClick={() => uninstallApp(selectedApp.id)}
                className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                title="Uninstall"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => downloadApp(selectedApp)}
              className={`flex-1 sm:flex-none px-8 py-3.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                isDownloading
                  ? 'bg-amber-500 text-white animate-pulse'
                  : 'bg-[#6750A4] hover:bg-[#4F378B] text-white'
              }`}
            >
              {isDownloading ? (
                `Downloading ${activeDownload?.progress}%`
              ) : (
                <>
                  <Download className="w-4 h-4" /> Install APK
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 text-center">
        <div>
          <span className="text-[10px] text-[#49454F] dark:text-[#CAC4D0] font-bold block">Rating</span>
          <span className="text-sm font-extrabold text-[#1D1B20] dark:text-[#E6E1E5] flex items-center justify-center gap-1 mt-0.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {selectedApp.rating}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[#49454F] dark:text-[#CAC4D0] font-bold block">Downloads</span>
          <span className="text-sm font-extrabold text-[#1D1B20] dark:text-[#E6E1E5] mt-0.5 block">
            {selectedApp.downloads}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[#49454F] dark:text-[#CAC4D0] font-bold block">APK Size</span>
          <span className="text-sm font-extrabold text-[#1D1B20] dark:text-[#E6E1E5] mt-0.5 block">
            {selectedApp.apkSize}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[#49454F] dark:text-[#CAC4D0] font-bold block">Security Scan</span>
          <span className="text-sm font-extrabold text-emerald-500 flex items-center justify-center gap-1 mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5" /> {selectedApp.securityScore}% Clean
          </span>
        </div>
      </div>

      {/* Security Verification & Hash Certificate */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
        <div className="flex items-center justify-between gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" /> AVANYX Cryptographic Signature Certificate
          </div>
          {copiedHash && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-300 flex items-center gap-1 font-semibold">
              <Check className="w-3.5 h-3.5" /> Checksum Copied!
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 bg-black/5 dark:bg-black/30 p-2.5 rounded-xl">
          <p className="text-[11px] text-[#49454F] dark:text-[#CAC4D0] font-mono break-all flex-1">
            SHA-256: {selectedApp.sha256Checksum}
          </p>
          <button
            onClick={handleCopyHash}
            className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-emerald-600 dark:text-emerald-400 shrink-0 transition-colors"
            title="Copy SHA-256 Checksum"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 space-y-3">
        <h3 className="font-extrabold text-sm text-[#1D1B20] dark:text-[#E6E1E5]">About this App</h3>
        <p className="text-xs text-[#49454F] dark:text-[#CAC4D0] leading-relaxed whitespace-pre-line">
          {selectedApp.fullDescription || selectedApp.description}
        </p>

        {selectedApp.features && selectedApp.features.length > 0 && (
          <div className="pt-3 border-t border-black/5 dark:border-white/5 space-y-2">
            <h4 className="font-bold text-xs text-[#1D1B20] dark:text-[#E6E1E5]">Key Features:</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#49454F] dark:text-[#CAC4D0]">
              {selectedApp.features.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-3 flex flex-wrap gap-2 border-t border-black/5 dark:border-white/5">
          {selectedApp.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full bg-[#F3EDF7] dark:bg-[#121316] text-[#6750A4] dark:text-[#D0BCFF] text-[10px] font-bold"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
