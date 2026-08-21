import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Bell, CheckCheck, Trash2, ShieldCheck, Sparkles, Tag } from 'lucide-react';

export const NotificationsScreen: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    openAppDetails
  } = useStore();

  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const filtered = notifications.filter((n) => filter === 'ALL' || !n.isRead);

  return (
    <div className="space-y-5 pb-8 px-4">
      {/* Title */}
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#6750A4] dark:text-[#D0BCFF]" />
            Notification Center
          </h1>
          <p className="text-xs text-[#49454F] dark:text-[#CAC4D0]">
            System security alerts, app spotlights, and store updates
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={markAllNotificationsRead}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#E8DEF8] dark:bg-[#4A4458] text-[#6750A4] dark:text-[#D0BCFF] text-xs font-bold hover:bg-[#6750A4] hover:text-white transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#CAC4D0]/30 text-xs font-bold pb-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1 rounded-full transition-colors ${
            filter === 'ALL'
              ? 'bg-[#6750A4] text-white'
              : 'text-[#49454F] dark:text-[#CAC4D0] hover:bg-black/5'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1 rounded-full transition-colors ${
            filter === 'UNREAD'
              ? 'bg-[#6750A4] text-white'
              : 'text-[#49454F] dark:text-[#CAC4D0] hover:bg-black/5'
          }`}
        >
          Unread ({notifications.filter((n) => !n.isRead).length})
        </button>
      </div>

      {/* Notifications Feed */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <p className="text-sm font-semibold text-[#49454F] dark:text-[#CAC4D0]">
            No notifications found.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationRead(notif.id);
                if (notif.deepLinkAppId) openAppDetails(notif.deepLinkAppId);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                !notif.isRead
                  ? 'bg-[#E8DEF8]/40 dark:bg-[#4A4458]/40 border-[#6750A4]/40'
                  : 'bg-[#F3EDF7]/50 dark:bg-[#2A282F]/50 border-[#CAC4D0]/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      notif.type === 'SECURITY'
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : notif.type === 'PROMOTION'
                        ? 'bg-amber-500/20 text-amber-500'
                        : 'bg-[#6750A4]/20 text-[#6750A4]'
                    }`}
                  >
                    {notif.type === 'SECURITY' ? (
                      <ShieldCheck className="w-4 h-4" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-[#1D1B20] dark:text-[#E6E1E5]">
                      {notif.title}
                    </h3>
                    <p className="text-xs text-[#1D1B20]/80 dark:text-[#E6E1E5]/80 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-[#49454F] dark:text-[#CAC4D0] mt-2 block font-medium">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif.id);
                  }}
                  className="p-1.5 rounded-full hover:bg-black/10 text-[#49454F]"
                  aria-label="Delete Notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
