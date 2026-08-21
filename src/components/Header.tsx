import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  Menu,
  Search,
  Sun,
  Moon,
  X,
  Bell,
  Download,
  ShieldCheck
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    darkMode,
    setDarkMode,
    setCurrentTab,
    currentTab,
    toggleSidebar,
    downloads,
    notifications,
    user
  } = useStore();

  const activeDownloads = downloads.filter((d) => d.status === 'DOWNLOADING').length;
  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  const getTabTitle = () => {
    switch (currentTab) {
      case 'HOME':
        return 'Store Home';
      case 'GAMES':
        return 'Games Hub';
      case 'APPS':
        return 'App Directory';
      case 'DOWNLOADS':
        return 'Download Manager';
      case 'SECURITY_ALERTS':
        return 'CyberShield Security';
      case 'DEV_CONSOLE':
        return 'Developer Console';
      case 'ADMIN_CONSOLE':
        return 'Admin Security Console';
      case 'SETTINGS':
        return 'Store Settings';
      case 'NOTIFICATIONS':
        return 'System Alerts';
      case 'PROFILE':
        return 'Developer Profile';
      case 'APP_DETAILS':
        return 'Package Details';
      default:
        return 'AVANYX Store';
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 dark:bg-[#18191D]/95 backdrop-blur-md border-b border-black/5 dark:border-white/5 px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors shrink-0">
      {/* Left: Hamburger button + Current Section Breadcrumb */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={toggleSidebar}
          className="p-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-[#1D1B20] dark:text-[#E6E1E5] hover:bg-[#E8DEF8] dark:hover:bg-[#32343B] transition-colors focus:outline-none"
          title="Toggle Navigation Sidebar (☰)"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="w-4.5 h-4.5" />
        </button>

        <div className="hidden sm:flex flex-col">
          <span className="text-xs font-black uppercase tracking-wider text-[#6750A4] dark:text-[#D0BCFF]">
            {getTabTitle()}
          </span>
          <span className="text-[10px] text-[#49454F] dark:text-[#CAC4D0] font-medium flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" /> 100% Verified Packages
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-xl relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#49454F] dark:text-[#CAC4D0]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search verified APKs, games, AI agents, developer tools..."
          className="w-full pl-10 pr-9 py-2 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] border border-transparent focus:border-[#6750A4] dark:focus:border-[#D0BCFF] text-xs text-[#1D1B20] dark:text-[#E6E1E5] placeholder-[#49454F] dark:placeholder-[#CAC4D0] focus:outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#49454F] dark:text-[#CAC4D0] hover:text-[#1D1B20] dark:hover:text-white"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right: Quick Action Controls (Theme, Downloads, Notifications, Avatar) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Dark / Light Theme Toggle */}
        <button
          onClick={() => setDarkMode((prev) => !prev)}
          className="p-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-[#1D1B20] dark:text-[#E6E1E5] hover:bg-[#E8DEF8] dark:hover:bg-[#32343B] transition-colors focus:outline-none flex items-center justify-center"
          title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle Dark/Light Theme"
        >
          {darkMode ? (
            <Sun className="w-4.5 h-4.5 text-amber-400" />
          ) : (
            <Moon className="w-4.5 h-4.5 text-[#6750A4]" />
          )}
        </button>

        {/* Quick Downloads indicator */}
        {activeDownloads > 0 && (
          <button
            onClick={() => setCurrentTab('DOWNLOADS')}
            className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors relative"
            title="Active Downloads"
          >
            <Download className="w-4.5 h-4.5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center animate-bounce">
              {activeDownloads}
            </span>
          </button>
        )}

        {/* Quick Notifications */}
        <button
          onClick={() => setCurrentTab('NOTIFICATIONS')}
          className="p-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-[#1D1B20] dark:text-[#E6E1E5] hover:bg-[#E8DEF8] dark:hover:bg-[#32343B] transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadNotifs > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#6750A4] text-white text-[9px] font-black flex items-center justify-center">
              {unreadNotifs}
            </span>
          )}
        </button>

        {/* Profile Avatar button */}
        <button
          onClick={() => setCurrentTab('PROFILE')}
          className="p-1 rounded-2xl hover:ring-2 hover:ring-[#6750A4] transition-all ml-1"
          title="My Profile"
        >
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-8 h-8 rounded-xl object-cover ring-1 ring-black/10 dark:ring-white/10"
            referrerPolicy="no-referrer"
          />
        </button>
      </div>
    </header>
  );
};
