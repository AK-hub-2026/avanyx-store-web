import React from 'react';
import {
  LayoutDashboard,
  Layers,
  PlusCircle,
  Rocket,
  Users,
  UploadCloud,
  BarChart3,
  MessageSquare,
  Activity,
  Download,
  ShieldCheck,
  Building2,
  FileCheck2,
  Bell,
  ShieldAlert,
  HardDrive,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Package,
  HeartPulse,
  ShoppingBag,
  DollarSign,
  Share2,
  KeyRound,
  Link2,
  Star,
  Eye,
  Sparkles
} from 'lucide-react';
import { DeveloperConsoleTab } from './developerTypes';

interface DeveloperSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeTab: DeveloperConsoleTab;
  setActiveTab: (tab: DeveloperConsoleTab) => void;
  appsCount: number;
  unreadNotificationsCount?: number;
  pendingReviewsCount?: number;
  crashesCount?: number;
}

export const DeveloperSidebar: React.FC<DeveloperSidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  setActiveTab,
  appsCount,
  unreadNotificationsCount = 0,
  pendingReviewsCount = 0,
  crashesCount = 0
}) => {
  const navItem = (
    tab: DeveloperConsoleTab,
    label: string,
    Icon: React.ElementType,
    badge?: string | number,
    badgeColor: string = 'bg-[#9333EA]/30 text-[#C084FC]'
  ) => {
    const isActive = activeTab === tab;
    return (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`w-full flex items-center ${
          sidebarOpen ? 'justify-between px-3.5 py-2.5' : 'justify-center py-3 px-0'
        } rounded-xl text-xs font-bold transition-all relative group ${
          isActive
            ? 'bg-[#9333EA] text-white shadow-md shadow-[#9333EA]/30'
            : 'text-zinc-400 hover:text-white hover:bg-white/5'
        }`}
        title={!sidebarOpen ? label : undefined}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`} />
          {sidebarOpen && <span className="truncate">{label}</span>}
        </div>

        {sidebarOpen && badge !== undefined && badge !== null && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${badgeColor}`}>
            {badge}
          </span>
        )}

        {/* Tooltip for collapsed sidebar */}
        {!sidebarOpen && (
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1E1F2C] border border-white/10 text-white text-xs font-bold rounded-lg shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            {label}
            {badge !== undefined && <span className="ml-2 px-1.5 py-0.5 rounded bg-[#9333EA] text-[9px]">{badge}</span>}
          </div>
        )}
      </button>
    );
  };

  return (
    <aside
      className={`${
        sidebarOpen ? 'w-64' : 'w-[72px]'
      } bg-[#14151C] border-r border-white/10 flex flex-col shrink-0 overflow-y-auto overflow-x-hidden py-4 transition-all duration-300 ease-in-out select-none`}
    >
      {/* Submit New App Action Button */}
      <div className="px-3 mb-4">
        {sidebarOpen ? (
          <button
            onClick={() => setActiveTab('SUBMIT_APP')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#7E22CE] hover:from-[#A855F7] hover:to-[#9333EA] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#9333EA]/25 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit New App</span>
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('SUBMIT_APP')}
            className="w-11 h-11 mx-auto rounded-xl bg-gradient-to-r from-[#9333EA] to-[#7E22CE] text-white flex items-center justify-center shadow-lg shadow-[#9333EA]/25 transition active:scale-95 group relative"
            title="Submit New App"
          >
            <PlusCircle className="w-5 h-5" />
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1E1F2C] border border-white/10 text-white text-xs font-bold rounded-lg shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
              Submit New App
            </div>
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="space-y-5 px-3 flex-1">
        {/* Section 1: Core Dashboard */}
        <div>
          {sidebarOpen && (
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500 px-3 mb-1.5">
              Core Console
            </p>
          )}
          <div className="space-y-0.5">
            {navItem('DASHBOARD', 'Dashboard', LayoutDashboard)}
            {navItem('ALL_APPS', 'All Applications', Layers, appsCount, 'bg-white/10 text-zinc-300')}
          </div>
        </div>

        {/* Section 2: Realtime Store Analytics */}
        <div>
          {sidebarOpen && (
            <p className="text-[10px] font-black uppercase tracking-wider text-[#C084FC] px-3 mb-1.5 flex items-center gap-1.5">
              <span>Realtime Analytics</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </p>
          )}
          <div className="space-y-0.5">
            {navItem('DOWNLOAD_ANALYTICS', 'Downloads Analytics', Download, 'LIVE', 'bg-emerald-500/20 text-emerald-300')}
            {navItem('REVIEWS_ANALYTICS', 'Reviews Analytics', MessageSquare, pendingReviewsCount > 0 ? `${pendingReviewsCount} new` : undefined, 'bg-blue-500/20 text-blue-300')}
            {navItem('RATINGS_ANALYTICS', 'Ratings Analytics', Star, '5★-1★', 'bg-amber-500/20 text-amber-300')}
            {navItem('VIEWS_ANALYTICS', 'Views Analytics', Eye, 'CTR', 'bg-cyan-500/20 text-cyan-300')}
          </div>
        </div>

        {/* Section 3: AVANYX Special Tools & Moderation */}
        <div>
          {sidebarOpen && (
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500 px-3 mb-1.5">
              Store Moderation & Tools
            </p>
          )}
          <div className="space-y-0.5">
            {navItem('REVIEWS_MODERATION', 'Review Moderation', MessageSquare, pendingReviewsCount > 0 ? pendingReviewsCount : undefined, 'bg-amber-500/20 text-amber-300')}
            {navItem('CRASH_REPORTS', 'Crash Reports', Activity, crashesCount > 0 ? `${crashesCount} logs` : '0%', 'bg-blue-500/20 text-blue-300')}
            {navItem('VERIFICATION_REQUESTS', 'Developer Verification', ShieldCheck, 'Blue Tick', 'bg-[#9333EA]/30 text-[#C084FC]')}
            {navItem('APP_MODERATION_QUEUE', 'App Moderation Queue', FileCheck2)}
            {navItem('NOTIFICATION_CENTER', 'Notification Center', Bell, unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined, 'bg-red-500/20 text-red-300')}
            {navItem('SECURITY_SCAN', 'Security Scan Report', ShieldAlert, 'SHA-256', 'bg-emerald-500/20 text-emerald-300')}
            {navItem('STORAGE_USAGE', 'Storage Usage', HardDrive)}
          </div>
        </div>

        {/* Section 3: Publishing & Media */}
        <div>
          {sidebarOpen && (
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500 px-3 mb-1.5">
              Publishing & Assets
            </p>
          )}
          <div className="space-y-0.5">
            {navItem('RELEASES', 'Releases & Versions', Rocket)}
            {navItem('PROMOTION_MANAGER', 'Promotion Manager', Sparkles, 'FEATURE', 'bg-amber-500/20 text-amber-300')}
            {navItem('TESTING', 'Testing Tracks', Users, 'BETA', 'bg-emerald-500/20 text-emerald-300')}
            {navItem('MEDIA_STUDIO', 'Media Studio', UploadCloud, 'STORAGE', 'bg-[#9333EA]/30 text-[#C084FC]')}
            {navItem('DEVELOPER_PROFILE', 'Developer Profile', Building2)}
            {navItem('POLICY_CENTER', 'Policy Center', ShieldCheck)}
          </div>
        </div>

        {/* Section 4: Google Play Placeholders (Marked as Coming Soon) */}
        <div>
          {sidebarOpen && (
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-600 px-3 mb-1.5">
              Extended Modules (Coming Soon)
            </p>
          )}
          <div className="space-y-0.5 opacity-80">
            {navItem('REACH_DEVICES', 'Reach & Devices', Smartphone, 'SOON', 'bg-zinc-800 text-zinc-400')}
            {navItem('APP_BUNDLE_EXPLORER', 'App Bundle Explorer', Package, 'SOON', 'bg-zinc-800 text-zinc-400')}
            {navItem('ANDROID_VITALS', 'Android Vitals', HeartPulse, 'SOON', 'bg-zinc-800 text-zinc-400')}
            {navItem('PRODUCTS_SKUS', 'Products & SKUs', ShoppingBag, 'SOON', 'bg-zinc-800 text-zinc-400')}
            {navItem('FINANCIAL_REPORTS', 'Financial Reports', DollarSign, 'SOON', 'bg-zinc-800 text-zinc-400')}
            {navItem('INTERNAL_SHARING', 'Internal App Sharing', Share2, 'SOON', 'bg-zinc-800 text-zinc-400')}
          </div>
        </div>

        {/* Section 5: Settings */}
        <div>
          {sidebarOpen && (
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500 px-3 mb-1.5">
              Preferences
            </p>
          )}
          <div className="space-y-0.5">
            {navItem('CONSOLE_SETTINGS', 'Console Settings', SettingsIcon)}
          </div>
        </div>
      </div>

      {/* Bottom Sidebar Collapse Toggle Bar */}
      <div className="px-3 pt-4 border-t border-white/10 mt-auto flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className={`w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white flex items-center ${
            sidebarOpen ? 'justify-between px-3' : 'justify-center'
          } text-xs font-bold transition`}
        >
          {sidebarOpen ? (
            <>
              <span>Collapse Sidebar</span>
              <ChevronLeft className="w-4 h-4" />
            </>
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
};
