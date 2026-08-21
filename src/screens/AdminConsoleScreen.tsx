import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Terminal,
  GraduationCap,
  BadgeCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  History,
  AlertTriangle,
  FileText,
  HelpCircle,
  Bell,
  Eye,
  Globe,
  Github,
  Mail,
  UserCheck,
  Building,
  School,
  Calendar,
  Layers,
  Package,
  Check,
  X,
  Lock,
  Unlock,
  AlertCircle
} from 'lucide-react';
import {
  fetchVerificationRequests,
  subscribeToVerificationRequests,
  reviewVerificationRequest,
  fetchAllUsers,
  adminUpdateUserRoleAndBadge,
  fetchAuditLogs,
  subscribeToAdminNotifications,
  isPrimaryAdminEmail,
  fetchAllApps,
  adminReviewApp,
  fetchAllDevelopers,
  adminModerateDeveloper
} from '../services/firestoreService';
import {
  VerificationRequest,
  User,
  AuditLog,
  UserRole,
  VerificationBadge,
  VerificationStatus,
  StoreApp,
  DeveloperProfile
} from '../types';

export const AdminConsoleScreen: React.FC = () => {
  const { user, isAuthenticated, firebaseUser, setCurrentTab } = useStore();

  const [activeTab, setActiveTab] = useState<'VERIFICATIONS' | 'APPS' | 'DEVELOPERS' | 'USERS' | 'AUDIT' | 'NOTIFICATIONS'>('VERIFICATIONS');
  const [verificationSubQueue, setVerificationSubQueue] = useState<'ALL' | 'DEVELOPER' | 'STUDENT'>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [appsList, setAppsList] = useState<StoreApp[]>([]);
  const [developersList, setDevelopersList] = useState<DeveloperProfile[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Review modal state
  const [selectedReq, setSelectedReq] = useState<VerificationRequest | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'REQUEST_INFO' | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // App Moderation Modal
  const [selectedApp, setSelectedApp] = useState<StoreApp | null>(null);
  const [appActionType, setAppActionType] = useState<'APPROVED' | 'PUBLISHED' | 'REJECTED' | 'SUSPENDED' | 'DRAFT' | null>(null);
  const [appModerationNotes, setAppModerationNotes] = useState('');

  // Developer Moderation Modal
  const [selectedDev, setSelectedDev] = useState<DeveloperProfile | null>(null);
  const [devActionType, setDevActionType] = useState<'VERIFY' | 'SUSPEND' | 'RESTORE' | null>(null);
  const [devModerationNotes, setDevModerationNotes] = useState('');

  // Edit User Modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [targetRole, setTargetRole] = useState<UserRole>('USER');
  const [targetBadge, setTargetBadge] = useState<VerificationBadge>('NONE');

  const isAuthoritativeAdmin = isAuthenticated && (user.realRole === 'ADMIN' || user.role === 'ADMIN' || isPrimaryAdminEmail(user.email));

  // Live real-time subscriptions
  useEffect(() => {
    if (!isAuthoritativeAdmin) return;

    const unsubVerifs = subscribeToVerificationRequests(
      (updatedRequests) => {
        setRequests(updatedRequests);
      },
      (err) => {
        console.warn('Realtime verification queue notice:', err);
      }
    );

    const unsubNotifs = subscribeToAdminNotifications((notifs) => {
      setAdminNotifications(notifs);
    });

    return () => {
      unsubVerifs();
      unsubNotifs();
    };
  }, [isAuthoritativeAdmin]);

  const loadData = async () => {
    if (!isAuthoritativeAdmin) return;
    setLoading(true);
    setActionError(null);
    try {
      if (activeTab === 'VERIFICATIONS') {
        const reqs = await fetchVerificationRequests();
        setRequests(reqs);
      } else if (activeTab === 'APPS') {
        const apps = await fetchAllApps();
        setAppsList(apps);
      } else if (activeTab === 'DEVELOPERS') {
        const devs = await fetchAllDevelopers();
        setDevelopersList(devs);
      } else if (activeTab === 'USERS') {
        const users = await fetchAllUsers();
        setUsersList(users);
      } else if (activeTab === 'AUDIT') {
        const logs = await fetchAuditLogs();
        setAuditLogs(logs);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, isAuthoritativeAdmin]);

  // Compute live pending counts
  const pendingDevCount = requests.filter(
    (r) => r.type === 'DEVELOPER' && (r.status === 'PENDING_REVIEW' || r.status === 'PENDING')
  ).length;
  const pendingStuCount = requests.filter(
    (r) => r.type === 'STUDENT' && (r.status === 'PENDING_REVIEW' || r.status === 'PENDING')
  ).length;
  const pendingAppCount = appsList.filter((a) => a.status === 'PENDING_REVIEW').length;
  const totalPendingCount = pendingDevCount + pendingStuCount;

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    if (verificationSubQueue === 'DEVELOPER' && req.type !== 'DEVELOPER') return false;
    if (verificationSubQueue === 'STUDENT' && req.type !== 'STUDENT') return false;

    if (filterStatus !== 'ALL') {
      if (filterStatus === 'PENDING_REVIEW') {
        if (req.status !== 'PENDING_REVIEW' && req.status !== 'PENDING') return false;
      } else if (req.status !== filterStatus) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (req.displayName || req.userName || '').toLowerCase().includes(q);
      const matchEmail = (req.applicantEmail || req.userEmail || '').toLowerCase().includes(q);
      const matchUid = (req.applicantUid || req.userId || '').toLowerCase().includes(q);
      const matchOrg = (req.developerDetails?.organizationName || req.studentDetails?.institutionName || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchUid && !matchOrg) return false;
    }

    return true;
  });

  const handleExecuteReviewAction = async () => {
    if (!selectedReq || !firebaseUser || !actionType) return;
    setIsProcessing(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      let statusToSet: 'APPROVED' | 'REJECTED' | 'REQUEST_INFO' = 'APPROVED';
      if (actionType === 'REJECT') statusToSet = 'REJECTED';
      if (actionType === 'REQUEST_INFO') statusToSet = 'REQUEST_INFO';

      await reviewVerificationRequest(
        selectedReq.id,
        statusToSet,
        firebaseUser.uid,
        reviewerNotes || (statusToSet === 'APPROVED' ? 'Application meets all store developer standards.' : '')
      );

      setActionSuccess(
        `Successfully updated ${selectedReq.displayName || selectedReq.applicantEmail} to ${statusToSet}`
      );
      setSelectedReq(null);
      setActionType(null);
      setReviewerNotes('');
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to review verification application');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteAppModeration = async () => {
    if (!selectedApp || !firebaseUser || !appActionType) return;
    setIsProcessing(true);
    setActionSuccess(null);
    setActionError(null);
    try {
      await adminReviewApp(
        firebaseUser.uid,
        firebaseUser.email || user.email || 'admin@avanyx.store',
        selectedApp.id,
        appActionType,
        appModerationNotes,
        selectedApp.status,
        selectedApp.developerUid
      );
      setActionSuccess(`Application "${selectedApp.name}" moderation updated to ${appActionType}`);
      setSelectedApp(null);
      setAppActionType(null);
      setAppModerationNotes('');
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to moderate application');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteDeveloperModeration = async () => {
    if (!selectedDev || !firebaseUser || !devActionType) return;
    setIsProcessing(true);
    setActionSuccess(null);
    setActionError(null);
    try {
      await adminModerateDeveloper(
        firebaseUser.uid,
        firebaseUser.email || user.email || 'admin@avanyx.store',
        selectedDev.id,
        devActionType,
        devModerationNotes
      );
      setActionSuccess(`Developer "${selectedDev.displayName}" set to ${devActionType}`);
      setSelectedDev(null);
      setDevActionType(null);
      setDevModerationNotes('');
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to moderate developer profile');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveUserPermissions = async () => {
    if (!editingUser || !firebaseUser) return;
    // Guard against demoting primary administrator
    if (isPrimaryAdminEmail(editingUser.email) && targetRole !== 'ADMIN') {
      setActionError('Security Policy: Primary Administrator accounts cannot be demoted or changed from ADMIN role.');
      return;
    }

    setIsProcessing(true);
    setActionSuccess(null);
    setActionError(null);
    try {
      await adminUpdateUserRoleAndBadge(
        editingUser.id,
        {
          role: targetRole,
          verificationBadge: targetBadge,
          developerStatus: targetRole === 'DEVELOPER' || targetRole === 'VERIFIED_DEVELOPER' || targetRole === 'ADMIN' ? 'VERIFIED' : 'NONE',
          studentStatus: targetRole === 'STUDENT' || targetRole === 'VERIFIED_STUDENT' ? 'VERIFIED' : 'NONE'
        },
        firebaseUser.uid
      );
      setActionSuccess(`Updated permissions for ${editingUser.name || editingUser.email}`);
      setEditingUser(null);
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update user permissions');
    } finally {
      setIsProcessing(false);
    }
  };

  // Guard: Unauthorized Access
  if (!isAuthoritativeAdmin) {
    return (
      <div id="admin-access-restricted" className="py-16 text-center space-y-6 max-w-lg mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center border border-rose-500/20 shadow-xl">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-[#1D1B20] dark:text-[#E6E1E5]">
            Admin Access Restricted
          </h1>
          <p className="text-xs text-[#49454F] dark:text-[#CAC4D0] leading-relaxed">
            The Admin Console is protected by strict server-side and Firestore security rules. Only authenticated accounts with verified <code className="font-mono text-[#6750A4] dark:text-[#D0BCFF]">ADMIN</code> privileges may review applications or modify roles.
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-[#49454F] dark:text-[#CAC4D0]">Account:</span>
            <span className="font-bold">{user.email || 'Unauthenticated'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#49454F] dark:text-[#CAC4D0]">Assigned Role:</span>
            <span className="font-bold">{user.role}</span>
          </div>
        </div>
        <button
          id="btn-return-profile"
          onClick={() => setCurrentTab('PROFILE')}
          className="px-6 py-3 rounded-2xl bg-[#6750A4] text-white text-xs font-bold hover:bg-[#523e85] transition-all shadow-md"
        >
          Return to Profile
        </button>
      </div>
    );
  }

  return (
    <div id="admin-console-container" className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl font-black text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7 text-rose-500" />
            AVANYX Admin Security & Verification Console
          </h1>
          <p className="text-xs text-[#49454F] dark:text-[#CAC4D0]">
            Review developer applications, student verifications, app catalog moderation, developer compliance, multi-role governance, and audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-admin-sync-data"
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 rounded-2xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-[#1D1B20] dark:text-[#E6E1E5] text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <span className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-black flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Root Admin Active
          </span>
        </div>
      </div>

      {/* Live Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => {
            setActiveTab('VERIFICATIONS');
            setVerificationSubQueue('DEVELOPER');
            setFilterStatus('PENDING_REVIEW');
          }}
          className="p-4 rounded-3xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 cursor-pointer hover:border-emerald-500/30 transition-all shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0]">
                Pending Devs
              </div>
              <div className="text-xl font-black text-[#1D1B20] dark:text-[#E6E1E5]">
                {pendingDevCount}
              </div>
            </div>
          </div>
          {pendingDevCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
              Review
            </span>
          )}
        </div>

        <div
          onClick={() => {
            setActiveTab('VERIFICATIONS');
            setVerificationSubQueue('STUDENT');
            setFilterStatus('PENDING_REVIEW');
          }}
          className="p-4 rounded-3xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 cursor-pointer hover:border-blue-500/30 transition-all shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0]">
                Pending Students
              </div>
              <div className="text-xl font-black text-[#1D1B20] dark:text-[#E6E1E5]">
                {pendingStuCount}
              </div>
            </div>
          </div>
          {pendingStuCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500 text-white">
              Pending
            </span>
          )}
        </div>

        <div
          onClick={() => {
            setActiveTab('APPS');
          }}
          className="p-4 rounded-3xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 cursor-pointer hover:border-purple-500/30 transition-all shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0]">
                Pending Apps
              </div>
              <div className="text-xl font-black text-[#1D1B20] dark:text-[#E6E1E5]">
                {pendingAppCount}
              </div>
            </div>
          </div>
          {pendingAppCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
              Review
            </span>
          )}
        </div>

        <div
          onClick={() => {
            setActiveTab('VERIFICATIONS');
            setVerificationSubQueue('ALL');
            setFilterStatus('ALL');
          }}
          className="p-4 rounded-3xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 cursor-pointer hover:border-[#6750A4]/30 transition-all shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6750A4]/15 text-[#6750A4] dark:text-[#D0BCFF] flex items-center justify-center">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0]">
                Total Queue
              </div>
              <div className="text-xl font-black text-[#1D1B20] dark:text-[#E6E1E5]">
                {requests.length}
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-[#6750A4] dark:text-[#D0BCFF]">
            Live Sync
          </span>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-bold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-bold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-[#1E1F23] rounded-2xl border border-black/5 dark:border-white/5 shadow-sm overflow-x-auto">
        <button
          id="tab-verifications"
          onClick={() => setActiveTab('VERIFICATIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'VERIFICATIONS'
              ? 'bg-[#6750A4] text-white shadow-sm'
              : 'text-[#49454F] dark:text-[#CAC4D0] hover:text-[#1D1B20] dark:hover:text-white'
          }`}
        >
          <BadgeCheck className="w-4 h-4" />
          <span>Verification Queue</span>
          {totalPendingCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-black">
              {totalPendingCount}
            </span>
          )}
        </button>

        <button
          id="tab-apps-moderation"
          onClick={() => setActiveTab('APPS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'APPS'
              ? 'bg-[#6750A4] text-white shadow-sm'
              : 'text-[#49454F] dark:text-[#CAC4D0] hover:text-[#1D1B20] dark:hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Apps Moderation ({appsList.length})</span>
          {pendingAppCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-black">
              {pendingAppCount}
            </span>
          )}
        </button>

        <button
          id="tab-developers-moderation"
          onClick={() => setActiveTab('DEVELOPERS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'DEVELOPERS'
              ? 'bg-[#6750A4] text-white shadow-sm'
              : 'text-[#49454F] dark:text-[#CAC4D0] hover:text-[#1D1B20] dark:hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Developers ({developersList.length})</span>
        </button>

        <button
          id="tab-users-directory"
          onClick={() => setActiveTab('USERS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'USERS'
              ? 'bg-[#6750A4] text-white shadow-sm'
              : 'text-[#49454F] dark:text-[#CAC4D0] hover:text-[#1D1B20] dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Role Governance ({usersList.length})</span>
        </button>

        <button
          id="tab-audit-logs"
          onClick={() => setActiveTab('AUDIT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'AUDIT'
              ? 'bg-[#6750A4] text-white shadow-sm'
              : 'text-[#49454F] dark:text-[#CAC4D0] hover:text-[#1D1B20] dark:hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Trail</span>
        </button>

        <button
          id="tab-admin-notifications"
          onClick={() => setActiveTab('NOTIFICATIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'NOTIFICATIONS'
              ? 'bg-[#6750A4] text-white shadow-sm'
              : 'text-[#49454F] dark:text-[#CAC4D0] hover:text-[#1D1B20] dark:hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Admin Alerts ({adminNotifications.length})</span>
        </button>
      </div>

      {/* TAB 1: VERIFICATIONS QUEUE */}
      {activeTab === 'VERIFICATIONS' && (
        <div className="space-y-4">
          {/* Sub-Queue Tabs & Status Filter */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5">
            {/* Separate Review Queues */}
            <div className="flex items-center gap-1.5 bg-[#F3EDF7] dark:bg-[#25262B] p-1 rounded-2xl">
              <button
                id="queue-tab-all"
                onClick={() => setVerificationSubQueue('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  verificationSubQueue === 'ALL'
                    ? 'bg-[#6750A4] text-white shadow-sm'
                    : 'text-[#49454F] dark:text-[#CAC4D0]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> All ({requests.length})
              </button>
              <button
                id="queue-tab-developer"
                onClick={() => setVerificationSubQueue('DEVELOPER')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  verificationSubQueue === 'DEVELOPER'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-[#49454F] dark:text-[#CAC4D0]'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" /> Developer Applications
                {pendingDevCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-emerald-700 font-black">
                    {pendingDevCount}
                  </span>
                )}
              </button>
              <button
                id="queue-tab-student"
                onClick={() => setVerificationSubQueue('STUDENT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  verificationSubQueue === 'STUDENT'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-[#49454F] dark:text-[#CAC4D0]'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" /> Student Verifications
                {pendingStuCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-blue-700 font-black">
                    {pendingStuCount}
                  </span>
                )}
              </button>
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-[#49454F] dark:text-[#CAC4D0] mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Status:
              </span>
              {[
                { label: 'All', value: 'ALL' },
                { label: 'Pending Review', value: 'PENDING_REVIEW' },
                { label: 'Info Requested', value: 'REQUEST_INFO' },
                { label: 'Approved', value: 'APPROVED' },
                { label: 'Rejected', value: 'REJECTED' }
              ].map((s) => (
                <button
                  key={s.value}
                  onClick={() => setFilterStatus(s.value)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    filterStatus === s.value
                      ? 'bg-[#6750A4] text-white'
                      : 'bg-[#F3EDF7] dark:bg-[#25262B] text-[#49454F] dark:text-[#CAC4D0]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 flex items-center gap-3">
            <Search className="w-4 h-4 text-[#49454F] dark:text-[#CAC4D0]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search applications by applicant name, email, UID, organization, or institution..."
              className="bg-transparent text-xs w-full text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#49454F] dark:text-[#CAC4D0] hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Submissions List */}
          <div className="bg-white dark:bg-[#1E1F23] rounded-3xl border border-black/5 dark:border-white/5 overflow-hidden divide-y divide-black/5 dark:divide-white/5 shadow-sm">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req) => (
                <div
                  key={req.id}
                  id={`verification-row-${req.id}`}
                  className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="space-y-2 flex-1">
                    {/* Top line badges */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1.5 ${
                          req.type === 'DEVELOPER'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {req.type === 'DEVELOPER' ? (
                          <Terminal className="w-3.5 h-3.5" />
                        ) : (
                          <GraduationCap className="w-3.5 h-3.5" />
                        )}
                        {req.type === 'DEVELOPER' ? 'Developer Application' : 'Student Verification'}
                      </span>

                      <h3 className="font-extrabold text-sm text-[#1D1B20] dark:text-[#E6E1E5]">
                        {req.displayName || req.userName || req.applicantEmail}
                      </h3>

                      {/* Status Tag */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          req.status === 'APPROVED'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : req.status === 'REJECTED'
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                            : req.status === 'REQUEST_INFO'
                            ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {req.status === 'PENDING_REVIEW' || req.status === 'PENDING'
                          ? 'Pending Review'
                          : req.status}
                      </span>
                    </div>

                    {/* Metadata Summary */}
                    <div className="text-xs text-[#49454F] dark:text-[#CAC4D0] space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#6750A4]" />
                          <strong className="text-[#1D1B20] dark:text-[#E6E1E5]">
                            {req.applicantEmail || req.userEmail}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          UID: <code className="font-mono text-[11px]">{req.applicantUid || req.userId}</code>
                        </span>
                        {req.caseId && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                              Case: {req.caseId}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Submitted: {new Date(req.submittedAt).toLocaleString()}
                        </span>
                      </div>

                      {/* Specific Details Preview */}
                      {req.type === 'DEVELOPER' && req.developerDetails && (
                        <div className="flex items-center gap-3 flex-wrap pt-0.5 text-[11px]">
                          {req.developerDetails.organizationName && (
                            <span className="flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              Org: <strong>{req.developerDetails.organizationName}</strong>
                            </span>
                          )}
                          {req.developerDetails.websiteUrl && (
                            <a
                              href={req.developerDetails.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#6750A4] dark:text-[#D0BCFF] underline flex items-center gap-0.5"
                            >
                              <Globe className="w-3 h-3" /> Website
                            </a>
                          )}
                          {req.developerDetails.githubUrl && (
                            <a
                              href={req.developerDetails.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#6750A4] dark:text-[#D0BCFF] underline flex items-center gap-0.5"
                            >
                              <Github className="w-3 h-3" /> GitHub
                            </a>
                          )}
                          {req.developerDetails.country && (
                            <span>Country: {req.developerDetails.country}</span>
                          )}
                        </div>
                      )}

                      {req.type === 'STUDENT' && req.studentDetails && (
                        <div className="flex items-center gap-3 flex-wrap pt-0.5 text-[11px]">
                          <span className="flex items-center gap-1">
                            <School className="w-3 h-3" />
                            Institution: <strong>{req.studentDetails.institutionName}</strong>
                          </span>
                          {req.studentDetails.studentIdNumber && (
                            <span>ID: <strong>{req.studentDetails.studentIdNumber}</strong></span>
                          )}
                          {req.studentDetails.graduationYear && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Grad: {req.studentDetails.graduationYear}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Reviewer Note preview if reviewed */}
                      {req.reviewerNotes && (
                        <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-[11px] italic">
                          Reviewer Note: "{req.reviewerNotes}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-2 w-full lg:w-auto justify-end flex-wrap">
                    {/* View Details Button */}
                    <button
                      id={`btn-view-details-${req.id}`}
                      onClick={() => {
                        setSelectedReq(req);
                        setActionType(null);
                        setReviewerNotes(req.reviewerNotes || '');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#25262B] hover:bg-[#E8DEF8] dark:hover:bg-[#34323B] text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5] transition-all flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Verification Details</span>
                    </button>

                    {/* Quick Action Buttons for Pending */}
                    {(req.status === 'PENDING_REVIEW' || req.status === 'PENDING' || req.status === 'REQUEST_INFO') && (
                      <>
                        <button
                          id={`btn-quick-approve-${req.id}`}
                          onClick={() => {
                            setSelectedReq(req);
                            setActionType('APPROVE');
                            setReviewerNotes('Approved by store administration.');
                          }}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          id={`btn-quick-request-info-${req.id}`}
                          onClick={() => {
                            setSelectedReq(req);
                            setActionType('REQUEST_INFO');
                            setReviewerNotes('');
                          }}
                          className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                          title="Request Additional Information"
                        >
                          <HelpCircle className="w-3.5 h-3.5" /> Request Info
                        </button>
                        <button
                          id={`btn-quick-reject-${req.id}`}
                          onClick={() => {
                            setSelectedReq(req);
                            setActionType('REJECT');
                            setReviewerNotes('');
                          }}
                          className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-xs text-[#49454F] dark:text-[#CAC4D0]">
                No verification submissions found matching current queue and status filters.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: APPS MODERATION */}
      {activeTab === 'APPS' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 flex items-center gap-3">
            <Search className="w-4 h-4 text-[#49454F] dark:text-[#CAC4D0]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search apps by name, package name, developer..."
              className="bg-transparent text-xs w-full text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none"
            />
          </div>

          <div className="bg-white dark:bg-[#1E1F23] rounded-3xl border border-black/5 dark:border-white/5 overflow-hidden divide-y divide-black/5 dark:divide-white/5 shadow-sm">
            {appsList
              .filter(
                (a) =>
                  a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  a.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  a.developer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  a.id.includes(searchQuery)
              )
              .map((app) => (
                <div
                  key={app.id}
                  className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={app.iconUrl}
                      alt={app.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-1 ring-black/5 dark:ring-white/5"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-[#1D1B20] dark:text-[#E6E1E5]">
                          {app.name}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            app.status === 'PUBLISHED'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : app.status === 'APPROVED'
                              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                              : app.status === 'PENDING_REVIEW'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              : app.status === 'REJECTED' || app.status === 'SUSPENDED'
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                              : 'bg-black/5 dark:bg-white/5 text-[#49454F] dark:text-[#CAC4D0]'
                          }`}
                        >
                          {app.status}
                        </span>
                        <span className="text-[10px] text-[#49454F] dark:text-[#CAC4D0] font-mono">
                          v{app.version}
                        </span>
                      </div>
                      <p className="text-xs text-[#49454F] dark:text-[#CAC4D0]">
                        <code className="font-mono text-[11px]">{app.packageName}</code> • Dev: <strong className="text-[#1D1B20] dark:text-[#E6E1E5]">{app.developer}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setAppActionType('APPROVED');
                        setAppModerationNotes('Meets all application standards.');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setAppActionType('PUBLISHED');
                        setAppModerationNotes('Published to store catalog.');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-sm"
                    >
                      Publish
                    </button>
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setAppActionType('REJECTED');
                        setAppModerationNotes('');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-all shadow-sm"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setAppActionType(app.status === 'SUSPENDED' ? 'PUBLISHED' : 'SUSPENDED');
                        setAppModerationNotes('');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-all shadow-sm"
                    >
                      {app.status === 'SUSPENDED' ? 'Restore' : 'Suspend'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB: DEVELOPERS DIRECTORY */}
      {activeTab === 'DEVELOPERS' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 flex items-center gap-3">
            <Search className="w-4 h-4 text-[#49454F] dark:text-[#CAC4D0]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search developers by name, organization, UID..."
              className="bg-transparent text-xs w-full text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none"
            />
          </div>

          <div className="bg-white dark:bg-[#1E1F23] rounded-3xl border border-black/5 dark:border-white/5 overflow-hidden divide-y divide-black/5 dark:divide-white/5 shadow-sm">
            {developersList
              .filter(
                (d) =>
                  d.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (d.organizationName && d.organizationName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  d.id.includes(searchQuery) ||
                  (d.developerUid && d.developerUid.includes(searchQuery))
              )
              .map((dev) => (
                <div
                  key={dev.id}
                  className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={dev.logoUrl || dev.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                      alt={dev.displayName}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/20"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-[#1D1B20] dark:text-[#E6E1E5]">
                          {dev.displayName}
                        </h4>
                        {dev.verified && (
                          <span className="p-0.5 text-emerald-500" title="Verified Developer">
                            <BadgeCheck className="w-4 h-4" />
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            dev.developerStatus === 'VERIFIED'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : dev.developerStatus === 'SUSPENDED'
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {dev.developerStatus || (dev.verified ? 'VERIFIED' : 'NONE')}
                        </span>
                      </div>
                      <p className="text-xs text-[#49454F] dark:text-[#CAC4D0]">
                        Org: <strong className="text-[#1D1B20] dark:text-[#E6E1E5]">{dev.organizationName || 'Individual'}</strong> • UID: <code className="font-mono text-[11px]">{dev.developerUid}</code>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedDev(dev);
                        setDevActionType(dev.developerStatus === 'SUSPENDED' ? 'RESTORE' : 'SUSPEND');
                        setDevModerationNotes('');
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        dev.developerStatus === 'SUSPENDED'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-rose-600 hover:bg-rose-700 text-white'
                      }`}
                    >
                      {dev.developerStatus === 'SUSPENDED' ? 'Restore Developer' : 'Suspend Developer'}
                    </button>
                    {!dev.verified && (
                      <button
                        onClick={() => {
                          setSelectedDev(dev);
                          setDevActionType('VERIFY');
                          setDevModerationNotes('Verified by Administrator');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#6750A4] hover:bg-[#523e85] text-white text-xs font-bold transition-all shadow-sm"
                      >
                        Grant Verified
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 2: USERS DIRECTORY */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 flex items-center gap-3">
            <Search className="w-4 h-4 text-[#49454F] dark:text-[#CAC4D0]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name, email, or UID..."
              className="bg-transparent text-xs w-full text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none"
            />
          </div>

          <div className="bg-white dark:bg-[#1E1F23] rounded-3xl border border-black/5 dark:border-white/5 overflow-hidden divide-y divide-black/5 dark:divide-white/5 shadow-sm">
            {usersList
              .filter(
                (u) =>
                  u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  u.id.includes(searchQuery)
              )
              .map((usr) => (
                <div
                  key={usr.id}
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={usr.avatarUrl}
                      alt={usr.name}
                      className="w-11 h-11 rounded-2xl object-cover ring-2 ring-[#6750A4]/20"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-[#1D1B20] dark:text-[#E6E1E5]">
                          {usr.name}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            usr.role === 'ADMIN'
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                              : usr.role === 'VERIFIED_DEVELOPER' || usr.role === 'DEVELOPER'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : usr.role === 'VERIFIED_STUDENT' || usr.role === 'STUDENT'
                              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                              : 'bg-black/5 dark:bg-white/5 text-[#49454F] dark:text-[#CAC4D0]'
                          }`}
                        >
                          {usr.role}
                        </span>
                        {usr.verificationBadge && usr.verificationBadge !== 'NONE' && (
                          <span className="p-0.5 text-emerald-500" title={`Badge: ${usr.verificationBadge}`}>
                            <BadgeCheck className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#49454F] dark:text-[#CAC4D0]">
                        {usr.email} • UID: <code className="font-mono text-[11px]">{usr.id}</code>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditingUser(usr);
                      setTargetRole(usr.role);
                      setTargetBadge(usr.verificationBadge || 'NONE');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5] hover:bg-[#E8DEF8] dark:hover:bg-[#34323B] transition-all"
                  >
                    Manage Permissions
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white dark:bg-[#1E1F23] rounded-3xl border border-black/5 dark:border-white/5 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2">
              <History className="w-4 h-4 text-[#6750A4]" />
              Security & Verification Audit Trail
            </h3>
            <span className="text-xs text-[#49454F] dark:text-[#CAC4D0]">
              Total Records: {auditLogs.length}
            </span>
          </div>

          <div className="divide-y divide-black/5 dark:divide-white/5">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div key={log.id} className="py-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1D1B20] dark:text-[#E6E1E5] uppercase tracking-wider">
                        {log.action}
                      </span>
                      <span className="text-[11px] font-mono text-[#6750A4] dark:text-[#D0BCFF]">
                        Target: {log.targetId || log.targetUserId || 'N/A'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#49454F] dark:text-[#CAC4D0]">
                      {log.details || 'No additional details provided'} • Admin: <strong className="text-[#1D1B20] dark:text-[#E6E1E5]">{log.adminEmail || log.performedBy || log.adminUid || 'System'}</strong>
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-[#49454F] dark:text-[#CAC4D0] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-[#49454F] dark:text-[#CAC4D0]">
                No security audit logs recorded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ADMIN NOTIFICATIONS */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="bg-white dark:bg-[#1E1F23] rounded-3xl border border-black/5 dark:border-white/5 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#6750A4]" />
              Incoming Verification Notifications
            </h3>
            <span className="text-xs text-[#49454F] dark:text-[#CAC4D0]">
              Live Realtime Stream
            </span>
          </div>

          <div className="divide-y divide-black/5 dark:divide-white/5">
            {adminNotifications.length > 0 ? (
              adminNotifications.map((notif) => (
                <div key={notif.id} className="py-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="font-bold text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      {notif.title}
                    </div>
                    <p className="text-[#49454F] dark:text-[#CAC4D0]">
                      {notif.message}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-[#49454F] dark:text-[#CAC4D0] whitespace-nowrap">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-[#49454F] dark:text-[#CAC4D0]">
                No admin notifications yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULL VERIFICATION DETAILS & REVIEW MODAL */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1E1F23] rounded-3xl p-6 max-w-2xl w-full border border-black/10 dark:border-white/10 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                    selectedReq.type === 'DEVELOPER'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                  }`}
                >
                  {selectedReq.type === 'DEVELOPER' ? (
                    <Terminal className="w-5 h-5" />
                  ) : (
                    <GraduationCap className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#1D1B20] dark:text-[#E6E1E5]">
                    {selectedReq.type === 'DEVELOPER'
                      ? 'Developer Verification Application'
                      : 'Student Identity Verification'}
                  </h3>
                  <p className="text-[11px] text-[#49454F] dark:text-[#CAC4D0]">
                    Application ID: <code className="font-mono">{selectedReq.applicationId || selectedReq.id}</code>
                  </p>
                </div>
              </div>
              <button
                id="btn-close-details-modal"
                onClick={() => {
                  setSelectedReq(null);
                  setActionType(null);
                }}
                className="p-2 rounded-xl text-[#49454F] dark:text-[#CAC4D0] hover:bg-black/5 dark:hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            {/* Applicant Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs">
              <div>
                <span className="text-[11px] text-[#49454F] dark:text-[#CAC4D0] block">Applicant Name:</span>
                <strong className="text-[#1D1B20] dark:text-[#E6E1E5] text-sm">
                  {selectedReq.displayName || selectedReq.userName || 'N/A'}
                </strong>
              </div>
              <div>
                <span className="text-[11px] text-[#49454F] dark:text-[#CAC4D0] block">Applicant Email:</span>
                <strong className="text-[#1D1B20] dark:text-[#E6E1E5]">
                  {selectedReq.applicantEmail || selectedReq.userEmail}
                </strong>
              </div>
              <div>
                <span className="text-[11px] text-[#49454F] dark:text-[#CAC4D0] block">Applicant UID:</span>
                <code className="font-mono text-[11px] text-[#6750A4] dark:text-[#D0BCFF]">
                  {selectedReq.applicantUid || selectedReq.userId}
                </code>
              </div>
              <div>
                <span className="text-[11px] text-[#49454F] dark:text-[#CAC4D0] block">Current Status:</span>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    selectedReq.status === 'APPROVED'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : selectedReq.status === 'REJECTED'
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {selectedReq.status}
                </span>
              </div>
            </div>

            {/* Comprehensive Detail Fields */}
            {selectedReq.type === 'DEVELOPER' && selectedReq.developerDetails && (
              <div className="space-y-3 border-t border-black/5 dark:border-white/5 pt-3">
                <h4 className="font-extrabold text-xs text-[#1D1B20] dark:text-[#E6E1E5] uppercase tracking-wider">
                  Developer Credentials & Portfolio
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#49454F] dark:text-[#CAC4D0] block">Organization / Studio:</span>
                    <strong>{selectedReq.developerDetails.organizationName || 'Independent Developer'}</strong>
                  </div>
                  <div>
                    <span className="text-[#49454F] dark:text-[#CAC4D0] block">Country / Region:</span>
                    <strong>{selectedReq.developerDetails.country || 'Global'}</strong>
                  </div>
                  <div>
                    <span className="text-[#49454F] dark:text-[#CAC4D0] block">Website URL:</span>
                    {selectedReq.developerDetails.websiteUrl ? (
                      <a
                        href={selectedReq.developerDetails.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#6750A4] dark:text-[#D0BCFF] underline flex items-center gap-1"
                      >
                        <Globe className="w-3.5 h-3.5" /> {selectedReq.developerDetails.websiteUrl}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      'None specified'
                    )}
                  </div>
                  <div>
                    <span className="text-[#49454F] dark:text-[#CAC4D0] block">GitHub Profile / Repo:</span>
                    {selectedReq.developerDetails.githubUrl ? (
                      <a
                        href={selectedReq.developerDetails.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#6750A4] dark:text-[#D0BCFF] underline flex items-center gap-1"
                      >
                        <Github className="w-3.5 h-3.5" /> {selectedReq.developerDetails.githubUrl}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      'None specified'
                    )}
                  </div>
                </div>

                {selectedReq.developerDetails.description && (
                  <div className="text-xs">
                    <span className="text-[#49454F] dark:text-[#CAC4D0] block">Developer Bio / App Plans:</span>
                    <p className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 mt-1 leading-relaxed">
                      {selectedReq.developerDetails.description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedReq.type === 'STUDENT' && selectedReq.studentDetails && (
              <div className="space-y-3 border-t border-black/5 dark:border-white/5 pt-3">
                <h4 className="font-extrabold text-xs text-[#1D1B20] dark:text-[#E6E1E5] uppercase tracking-wider">
                  Academic Verification Data
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#49454F] dark:text-[#CAC4D0] block">Educational Institution:</span>
                    <strong>{selectedReq.studentDetails.institutionName || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-[#49454F] dark:text-[#CAC4D0] block">Student ID Number:</span>
                    <strong>{selectedReq.studentDetails.studentIdNumber || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-[#49454F] dark:text-[#CAC4D0] block">Graduation Year:</span>
                    <strong>{selectedReq.studentDetails.graduationYear || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-[#49454F] dark:text-[#CAC4D0] block">Student Email:</span>
                    <strong>{selectedReq.studentDetails.contactEmail || selectedReq.applicantEmail}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Document References / Uploads */}
            {((selectedReq.documentUrls && selectedReq.documentUrls.length > 0) ||
              selectedReq.studentDetails?.documentUrl ||
              selectedReq.developerDetails?.documentUrls) && (
              <div className="space-y-2 border-t border-black/5 dark:border-white/5 pt-3 text-xs">
                <h4 className="font-extrabold text-xs text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#6750A4]" /> Attached Verification Documents
                </h4>
                <div className="space-y-1.5">
                  {(selectedReq.documentUrls || []).concat(
                    selectedReq.studentDetails?.documentUrl ? [selectedReq.studentDetails.documentUrl] : []
                  ).map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-[#6750A4] dark:text-[#D0BCFF] hover:underline flex items-center justify-between truncate"
                    >
                      <span className="truncate">{url}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-2" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Review Decision Form */}
            <div className="border-t border-black/5 dark:border-white/5 pt-4 space-y-3">
              <h4 className="font-extrabold text-xs text-[#1D1B20] dark:text-[#E6E1E5]">
                Admin Review Decision
              </h4>

              {/* Action Buttons selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  id="btn-select-approve"
                  onClick={() => {
                    setActionType('APPROVE');
                    setReviewerNotes('Approved by store administration.');
                  }}
                  className={`py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    actionType === 'APPROVE'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve & Verify
                </button>

                <button
                  type="button"
                  id="btn-select-request-info"
                  onClick={() => {
                    setActionType('REQUEST_INFO');
                    setReviewerNotes('');
                  }}
                  className={`py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    actionType === 'REQUEST_INFO'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" /> Request Info
                </button>

                <button
                  type="button"
                  id="btn-select-reject"
                  onClick={() => {
                    setActionType('REJECT');
                    setReviewerNotes('');
                  }}
                  className={`py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    actionType === 'REJECT'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
                  }`}
                >
                  <XCircle className="w-4 h-4" /> Reject Application
                </button>
              </div>

              {actionType && (
                <div className="space-y-2 pt-1">
                  <label className="block text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0]">
                    {actionType === 'APPROVE'
                      ? 'Approval Notes (Optional - Sent to applicant)'
                      : actionType === 'REQUEST_INFO'
                      ? 'Specific Information / Documentation Requested (Sent to applicant):'
                      : 'Rejection Reason (Sent to applicant):'}
                  </label>
                  <textarea
                    id="input-reviewer-notes"
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    rows={3}
                    placeholder={
                      actionType === 'REQUEST_INFO'
                        ? 'e.g. Please provide a government ID or valid GitHub repository showcasing your Android development work.'
                        : actionType === 'REJECT'
                        ? 'e.g. Application details could not be verified with the registered educational institution.'
                        : 'Approval notes...'
                    }
                    className="w-full p-3 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                  />
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5 dark:border-white/5">
              <button
                type="button"
                onClick={() => {
                  setSelectedReq(null);
                  setActionType(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5]"
              >
                Close
              </button>

              {actionType && (
                <button
                  type="button"
                  id="btn-confirm-review-action"
                  disabled={isProcessing || (actionType === 'REQUEST_INFO' && !reviewerNotes.trim())}
                  onClick={handleExecuteReviewAction}
                  className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5 ${
                    actionType === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : actionType === 'REQUEST_INFO'
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Confirm {actionType}</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Permissions Management Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1F23] rounded-3xl p-6 max-w-md w-full border border-black/10 dark:border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#6750A4]" />
                Manage User Role & Badge
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-2 rounded-xl text-[#49454F] dark:text-[#CAC4D0] hover:bg-black/5 dark:hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs space-y-1">
              <div className="font-bold text-[#1D1B20] dark:text-[#E6E1E5]">
                {editingUser.name} ({editingUser.email})
              </div>
              <div className="text-[11px] text-[#49454F] dark:text-[#CAC4D0] font-mono">
                UID: {editingUser.id}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0] mb-1.5">
                  Assign Authoritative Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['USER', 'DEVELOPER', 'VERIFIED_DEVELOPER', 'STUDENT', 'VERIFIED_STUDENT', 'ADMIN'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setTargetRole(r)}
                      className={`p-2 rounded-xl text-[11px] font-bold border transition-all truncate ${
                        targetRole === r
                          ? 'border-[#6750A4] bg-[#6750A4] text-white shadow-sm'
                          : 'border-black/5 dark:border-white/5 bg-[#F3EDF7] dark:bg-[#25262B] text-[#49454F] dark:text-[#CAC4D0]'
                      }`}
                      title={r}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0] mb-1.5">
                  Verification Badge
                </label>
                <select
                  value={targetBadge}
                  onChange={(e: any) => setTargetBadge(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                >
                  <option value="NONE">None</option>
                  <option value="VERIFIED">Verified Checkmark</option>
                  <option value="VERIFIED_DEVELOPER">Verified Developer</option>
                  <option value="VERIFIED_STUDENT">Verified Student</option>
                  <option value="ADMIN">Admin Badge</option>
                  <option value="OFFICIAL">Official Organization</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleSaveUserPermissions}
                className="px-5 py-2 rounded-xl bg-[#6750A4] text-white text-xs font-bold hover:bg-[#523e85] disabled:opacity-50"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App Moderation Modal */}
      {selectedApp && appActionType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1F23] rounded-3xl p-6 max-w-md w-full border border-black/10 dark:border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                Moderate App: {selectedApp.name}
              </h3>
              <button
                onClick={() => {
                  setSelectedApp(null);
                  setAppActionType(null);
                }}
                className="p-2 rounded-xl text-[#49454F] dark:text-[#CAC4D0] hover:bg-black/5 dark:hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs space-y-1">
              <div>Package: <code className="font-mono font-bold">{selectedApp.packageName}</code></div>
              <div>Action: <strong className="text-purple-600 dark:text-purple-400 font-bold">{appActionType}</strong></div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0] mb-1.5">
                Reviewer / Audit Notes
              </label>
              <textarea
                value={appModerationNotes}
                onChange={(e) => setAppModerationNotes(e.target.value)}
                placeholder="Reason or notes for this moderation action..."
                className="w-full h-24 p-3 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedApp(null);
                  setAppActionType(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExecuteAppModeration}
                className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : `Confirm ${appActionType}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Developer Moderation Modal */}
      {selectedDev && devActionType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1F23] rounded-3xl p-6 max-w-md w-full border border-black/10 dark:border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-600" />
                Moderate Developer: {selectedDev.displayName}
              </h3>
              <button
                onClick={() => {
                  setSelectedDev(null);
                  setDevActionType(null);
                }}
                className="p-2 rounded-xl text-[#49454F] dark:text-[#CAC4D0] hover:bg-black/5 dark:hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs space-y-1">
              <div>UID: <code className="font-mono">{selectedDev.developerUid}</code></div>
              <div>Action: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{devActionType}</strong></div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0] mb-1.5">
                Audit Notes / Reason
              </label>
              <textarea
                value={devModerationNotes}
                onChange={(e) => setDevModerationNotes(e.target.value)}
                placeholder="Reason or notes for developer moderation..."
                className="w-full h-24 p-3 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedDev(null);
                  setDevActionType(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExecuteDeveloperModeration}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : `Confirm ${devActionType}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
