import React from 'react';
import { useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

import { HomeScreen } from './screens/HomeScreen';
import { GamesScreen } from './screens/GamesScreen';
import { AppsScreen } from './screens/AppsScreen';
import { DownloadsScreen } from './screens/DownloadsScreen';
import { SecurityAlertsScreen } from './screens/SecurityAlertsScreen';
import { DeveloperConsoleScreen } from './screens/DeveloperConsoleScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { AppDetailsScreen } from './screens/AppDetailsScreen';
import { AdminConsoleScreen } from './screens/AdminConsoleScreen';
import { AccountSettingsScreen } from './screens/AccountSettingsScreen';
import { GmailScreen } from './screens/GmailScreen';
import { DeveloperProfileScreen } from './screens/DeveloperProfileScreen';

export const AppContent: React.FC = () => {
  const { currentTab } = useStore();

  const renderScreen = () => {
    switch (currentTab) {
      case 'HOME':
        return <HomeScreen />;
      case 'GAMES':
        return <GamesScreen />;
      case 'APPS':
        return <AppsScreen />;
      case 'DOWNLOADS':
        return <DownloadsScreen />;
      case 'SECURITY_ALERTS':
        return <SecurityAlertsScreen />;
      case 'DEV_CONSOLE':
        return <DeveloperConsoleScreen />;
      case 'ADMIN_CONSOLE':
        return <AdminConsoleScreen />;
      case 'DEVELOPER_PROFILE':
        return <DeveloperProfileScreen />;
      case 'GMAIL':
        return <GmailScreen />;
      case 'SETTINGS':
        return <SettingsScreen />;
      case 'ACCOUNT_SETTINGS':
        return <AccountSettingsScreen />;
      case 'NOTIFICATIONS':
        return <NotificationsScreen />;
      case 'PROFILE':
        return <ProfileScreen />;
      case 'APP_DETAILS':
        return <AppDetailsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F8F9FA] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5] flex flex-row transition-colors">
      {/* 1. Left Sidebar: dynamic width, in-flow */}
      <Sidebar />

      {/* 2. Right Main Layout Column: Header + scrollable Main Content */}
      <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden bg-[#F8F9FA] dark:bg-[#121316]">
        <Header />

        <main className="flex-1 overflow-y-auto min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {renderScreen()}
          </div>
        </main>
      </div>
    </div>
  );
};

export function App() {
  return <AppContent />;
}

export default App;
