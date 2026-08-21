import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { isPrimaryAdminEmail } from '../services/firestoreService';
import {
  User,
  Settings,
  Bell,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  PackageCheck,
  ExternalLink,
  Lock,
  LogIn,
  LogOut,
  Mail,
  UserPlus,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  GraduationCap,
  Sparkles,
  KeyRound,
  Trash2,
  Edit3,
  X,
  BadgeCheck,
  Eye,
  Building2,
  Clock,
  ShieldAlert
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const {
    user,
    firebaseUser,
    isAuthenticated,
    authLoading,
    authError,
    signInWithGoogle,
    signInWithGoogleRedirect,
    signInWithEmail,
    signUpWithEmail,
    signOutUser,
    setAdminViewRole,
    updateProfileDetails,
    sendPasswordReset,
    sendVerificationEmail,
    deleteAccount,
    requestDeveloperVerification,
    requestStudentVerification,
    clearAuthError,
    apps,
    notifications,
    setCurrentTab
  } = useStore();

  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [copiedHostname, setCopiedHostname] = useState(false);

  // Edit Profile Modal State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editAvatar, setEditAvatar] = useState(user.avatarUrl);
  const [editBio, setEditBio] = useState(user.bio || '');

  // Forgot Password Modal State (Before Authentication)
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Verification Request Modals & Finite State Machine
  const [showDevModal, setShowDevModal] = useState(false);
  const [devSubmitState, setDevSubmitState] = useState<'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [devSubmitError, setDevSubmitError] = useState<string | null>(null);
  const [devCaseId, setDevCaseId] = useState<string | null>(null);
  const [copiedDevCaseId, setCopiedDevCaseId] = useState(false);
  const [devOrg, setDevOrg] = useState('');
  const [devWebsite, setDevWebsite] = useState('');
  const [devGithub, setDevGithub] = useState('');
  const [devCountry, setDevCountry] = useState('United States');
  const [devEmail, setDevEmail] = useState(user.email || '');
  const [devDescription, setDevDescription] = useState('');
  const [devNotes, setDevNotes] = useState('');

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [stuSubmitState, setStuSubmitState] = useState<'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [stuSubmitError, setStuSubmitError] = useState<string | null>(null);
  const [stuCaseId, setStuCaseId] = useState<string | null>(null);
  const [copiedStuCaseId, setCopiedStuCaseId] = useState(false);
  const [stuInstitution, setStuInstitution] = useState('');
  const [stuId, setStuId] = useState('');
  const [stuGradYear, setStuGradYear] = useState('2026');
  const [stuDocUrl, setStuDocUrl] = useState('');
  const [stuNotes, setStuNotes] = useState('');

  // Delete Account Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  const handleCopyHostname = (hostToCopy?: string) => {
    const text = hostToCopy || currentHostname;
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedHostname(true);
      setTimeout(() => setCopiedHostname(false), 2500);
    }
  };

  const installedApps = apps.filter((app) => app.isInstalled);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPass = password;
    const cleanName = displayName.trim();

    if (!cleanEmail || !cleanPass) return;
    setIsSubmitting(true);
    setActionSuccess(null);
    clearAuthError();
    try {
      if (authMode === 'LOGIN') {
        await signInWithEmail(cleanEmail, cleanPass);
        setActionSuccess('Signed in successfully via Firebase Auth!');
      } else {
        await signUpWithEmail(cleanEmail, cleanPass, cleanName);
        setActionSuccess('Account created and signed in via Firebase Auth!');
      }
      setEmail('');
      setPassword('');
      setDisplayName('');
    } catch {
      // Error handled by StoreContext authError
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setActionSuccess(null);
    clearAuthError();
    try {
      await signInWithGoogle();
      setActionSuccess('Signed in with Google successfully!');
    } catch {
      // Error handled in StoreContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleRedirectSignIn = async () => {
    setIsSubmitting(true);
    setActionSuccess(null);
    clearAuthError();
    try {
      await signInWithGoogleRedirect();
    } catch {
      // Error handled in StoreContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setIsSubmitting(true);
    setActionSuccess(null);
    try {
      await signOutUser();
      setActionSuccess('Signed out of Firebase account.');
    } catch {
      // Error handled in StoreContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionSuccess(null);
    try {
      await updateProfileDetails(editName, editAvatar, editBio);
      setIsEditingProfile(false);
      setActionSuccess('Profile updated successfully!');
    } catch (err: any) {
      console.warn('[Profile Edit Notice]', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    setIsSubmitting(true);
    setActionSuccess(null);
    try {
      await sendPasswordReset();
      setActionSuccess(`Password reset email sent to ${user.email}. Check your inbox!`);
    } catch {
      // Handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    setIsSubmitting(true);
    setActionSuccess(null);
    try {
      await sendVerificationEmail();
      setActionSuccess(`Verification email sent to ${user.email}. Please verify your address!`);
    } catch {
      // Handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setIsSubmitting(true);
    setActionSuccess(null);
    try {
      await deleteAccount();
      setShowDeleteModal(false);
      setActionSuccess('Account successfully deleted.');
    } catch {
      // Handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnauthenticatedPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = forgotEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setForgotMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    setForgotSubmitting(true);
    setForgotMessage(null);
    try {
      await sendPasswordReset(cleanEmail);
      setForgotMessage({
        type: 'success',
        text: `If an account is associated with ${cleanEmail}, a password reset email has been sent. Please check your inbox and spam folder.`
      });
      setForgotEmail('');
    } catch (err: any) {
      setForgotMessage({
        type: 'error',
        text: err.message || 'Failed to send password reset email. Please try again later.'
      });
    } finally {
      setForgotSubmitting(false);
    }
  };

  const handleSubmitDevRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setDevSubmitState('SUBMITTING');
    setDevSubmitError(null);
    setActionSuccess(null);
    try {
      const result = await requestDeveloperVerification({
        developerName: user.name,
        organizationName: devOrg,
        websiteUrl: devWebsite,
        githubUrl: devGithub,
        country: devCountry,
        contactEmail: devEmail || user.email,
        description: devDescription,
        notes: devNotes
      });
      const generatedCaseId = result.caseId || result.applicationId;
      setDevCaseId(generatedCaseId);
      setDevSubmitState('SUCCESS');
      setActionSuccess(`Developer verification submitted successfully! Case ID: ${generatedCaseId}`);
    } catch (err: any) {
      console.warn('[Developer Request Notice]', err);
      setDevSubmitState('ERROR');
      setDevSubmitError(err.message || 'Developer verification submission failed. Please verify your connection and try again.');
    }
  };

  const handleSubmitStudentRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setStuSubmitState('SUBMITTING');
    setStuSubmitError(null);
    setActionSuccess(null);
    try {
      const result = await requestStudentVerification({
        studentName: user.name,
        institutionName: stuInstitution,
        studentIdNumber: stuId,
        graduationYear: stuGradYear,
        documentUrl: stuDocUrl,
        notes: stuNotes
      });
      const generatedCaseId = result.caseId || result.requestId;
      setStuCaseId(generatedCaseId);
      setStuSubmitState('SUCCESS');
      setActionSuccess(`Student verification submitted successfully! Case ID: ${generatedCaseId}`);
    } catch (err: any) {
      console.warn('[Student Request Notice]', err);
      setStuSubmitState('ERROR');
      setStuSubmitError(err.message || 'Student verification submission failed. Please verify your connection and try again.');
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Header Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-white via-white to-[#F3EDF7] dark:from-[#1E1F23] dark:via-[#1E1F23] dark:to-[#2A282F] border border-black/5 dark:border-white/5 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#6750A4]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover ring-4 ring-[#6750A4]/20 shadow-lg"
                referrerPolicy="no-referrer"
              />
              {user.verificationBadge === 'VERIFIED' && (
                <span
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-emerald-500 text-white shadow-md"
                  title="Verified Badge"
                >
                  <BadgeCheck className="w-4 h-4" />
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-[#1D1B20] dark:text-[#E6E1E5]">
                  {user.name}
                </h1>

                {/* Role Pill */}
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-black flex items-center gap-1 ${
                    user.role === 'ADMIN'
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      : user.role === 'DEVELOPER'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : user.role === 'STUDENT'
                      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                      : 'bg-[#6750A4]/10 text-[#6750A4] dark:text-[#D0BCFF]'
                  }`}
                >
                  {user.role === 'ADMIN' && <ShieldAlert className="w-3.5 h-3.5" />}
                  {user.role === 'DEVELOPER' && <Terminal className="w-3.5 h-3.5" />}
                  {user.role === 'STUDENT' && <GraduationCap className="w-3.5 h-3.5" />}
                  {user.role === 'USER' && <ShieldCheck className="w-3.5 h-3.5" />}
                  {user.role}
                </span>

                {user.verificationBadge === 'VERIFIED' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified Badge
                  </span>
                )}

                {isAuthenticated && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    Firebase Single UID
                  </span>
                )}
              </div>

              <p className="text-xs text-[#49454F] dark:text-[#CAC4D0] font-medium">
                {user.email || 'Guest User (Unauthenticated)'}
              </p>

              {user.bio && (
                <p className="text-xs text-[#1D1B20] dark:text-[#E6E1E5] italic pt-0.5 max-w-md">
                  "{user.bio}"
                </p>
              )}

              <p className="text-[11px] text-[#49454F] dark:text-[#CAC4D0] font-mono">
                UID: {user.id || 'GUEST_SESSION'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            {isAuthenticated && (
              <button
                onClick={() => {
                  setEditName(user.name);
                  setEditAvatar(user.avatarUrl);
                  setEditBio(user.bio || '');
                  setIsEditingProfile(true);
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-[#1D1B20] dark:text-[#E6E1E5] hover:bg-[#E8DEF8] dark:hover:bg-[#34323B] font-bold text-xs shadow-sm transition-all"
              >
                <Edit3 className="w-4 h-4 text-[#6750A4]" />
                Edit Profile
              </button>
            )}

            {isAuthenticated ? (
              <button
                onClick={handleSignOut}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            ) : null}
          </div>
        </div>

        {/* Master Admin View Switcher (Only visible to authenticated ADMIN accounts) */}
        {user.realRole === 'ADMIN' && (
          <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#6750A4]/5 dark:bg-[#D0BCFF]/5 p-4 rounded-2xl">
            <div className="space-y-0.5">
              <span className="text-xs font-black text-[#6750A4] dark:text-[#D0BCFF] flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> Admin Store Preview Mode
              </span>
              <p className="text-[11px] text-[#49454F] dark:text-[#CAC4D0]">
                Preview store behavior under different role views (User / Developer / Student / Admin) without altering backend permissions.
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#1E1F23] rounded-2xl shrink-0 shadow-sm border border-black/5 dark:border-white/5">
              {(['USER', 'DEVELOPER', 'STUDENT', 'ADMIN'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setAdminViewRole(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    user.role === r
                      ? 'bg-[#6750A4] text-white shadow-sm'
                      : 'text-[#49454F] dark:text-[#CAC4D0] hover:text-[#1D1B20] dark:hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Verification Status Cards (Developer / Student) */}
      {isAuthenticated && (() => {
        const isAdmin = user.role === 'ADMIN' || user.realRole === 'ADMIN' || isPrimaryAdminEmail(user.email);
        const isDevVerified = isAdmin || user.developerStatus === 'VERIFIED' || user.developerStatus === 'APPROVED' || user.role === 'DEVELOPER' || user.realRole === 'DEVELOPER' || user.role === 'VERIFIED_DEVELOPER' || user.realRole === 'VERIFIED_DEVELOPER';
        const isDevPending = !isAdmin && (user.developerStatus === 'PENDING' || user.developerStatus === 'PENDING_REVIEW' || user.developerStatus === 'UNDER_REVIEW');
        const isStuVerified = !isAdmin && (user.studentStatus === 'VERIFIED' || user.studentStatus === 'APPROVED' || user.role === 'STUDENT' || user.realRole === 'STUDENT' || user.role === 'VERIFIED_STUDENT' || user.realRole === 'VERIFIED_STUDENT');
        const isStuPending = !isAdmin && (user.studentStatus === 'PENDING' || user.studentStatus === 'PENDING_REVIEW' || user.studentStatus === 'UNDER_REVIEW');

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Developer Verification Box */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 space-y-3 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-[#1D1B20] dark:text-[#E6E1E5]">
                    <Terminal className="w-4.5 h-4.5 text-emerald-500" />
                    <span>Developer Verification</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isAdmin
                        ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                        : isDevVerified
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : isDevPending
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-black/5 dark:bg-white/5 text-[#49454F] dark:text-[#CAC4D0]'
                    }`}
                  >
                    {isAdmin
                      ? 'ADMINISTRATOR VERIFIED'
                      : isDevVerified
                      ? 'VERIFIED'
                      : isDevPending
                      ? 'PENDING REVIEW'
                      : 'UNVERIFIED'}
                  </span>
                </div>
                <p className="text-xs text-[#49454F] dark:text-[#CAC4D0] leading-relaxed">
                  {isAdmin
                    ? 'Permanent developer and global store management privileges are actively provisioned for this Administrator account.'
                    : 'Publish Android APKs directly to the global store, sign releases with SHA-256 certificates, and manage store listings.'}
                </p>
              </div>

              {isAdmin ? (
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Full Developer & Admin Access Active
                  </span>
                  <button
                    onClick={() => setCurrentTab('DEV_CONSOLE')}
                    className="px-3.5 py-1.5 rounded-xl bg-[#6750A4] text-white text-xs font-bold hover:bg-[#523e85] transition-all flex items-center gap-1.5"
                  >
                    Developer Console &rarr;
                  </button>
                </div>
              ) : isDevVerified ? (
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Developer privileges active
                  </span>
                  <button
                    onClick={() => setCurrentTab('DEV_CONSOLE')}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-1.5"
                  >
                    Console &rarr;
                  </button>
                </div>
              ) : isDevPending ? (
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Verification request is currently queued for Admin review.</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setDevSubmitState('IDLE');
                    setDevSubmitError(null);
                    setDevCaseId(null);
                    setShowDevModal(true);
                  }}
                  className="w-full py-2.5 rounded-2xl bg-[#6750A4] hover:bg-[#523e85] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" /> Apply for Developer Verification
                </button>
              )}
            </div>

            {/* Student Verification Box */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 space-y-3 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-[#1D1B20] dark:text-[#E6E1E5]">
                    <GraduationCap className="w-4.5 h-4.5 text-blue-500" />
                    <span>Student Verification</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isAdmin
                        ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                        : isStuVerified
                        ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                        : isStuPending
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-black/5 dark:bg-white/5 text-[#49454F] dark:text-[#CAC4D0]'
                    }`}
                  >
                    {isAdmin
                      ? 'ADMINISTRATOR'
                      : isStuVerified
                      ? 'VERIFIED'
                      : isStuPending
                      ? 'PENDING REVIEW'
                      : 'UNVERIFIED'}
                  </span>
                </div>
                <p className="text-xs text-[#49454F] dark:text-[#CAC4D0] leading-relaxed">
                  {isAdmin
                    ? 'Administrative role active. Administrator access supersedes academic and student tier restrictions.'
                    : 'Gain verified student badges, early access developer beta tracks, and academic developer cloud tiers.'}
                </p>
              </div>

              {isAdmin ? (
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Academic Restrictions Waived
                  </span>
                  <span className="text-[11px] font-mono text-[#49454F] dark:text-[#CAC4D0]">
                    Administrator Tier
                  </span>
                </div>
              ) : isStuVerified ? (
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Student status verified
                  </span>
                  <span className="text-[11px] font-mono text-[#49454F] dark:text-[#CAC4D0]">
                    {user.studentDetails?.institutionName || 'Academic Tier'}
                  </span>
                </div>
              ) : isStuPending ? (
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Student credentials queued for Admin review.</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setStuSubmitState('IDLE');
                    setStuSubmitError(null);
                    setStuCaseId(null);
                    setShowStudentModal(true);
                  }}
                  className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <GraduationCap className="w-4 h-4" /> Apply for Student Verification
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* Firebase Authentication / Account Details Panel */}
      <div className="bg-white dark:bg-[#1E1F23] rounded-3xl border border-black/5 dark:border-white/5 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2">
              <LogIn className="w-5 h-5 text-[#6750A4]" />
              {isAuthenticated ? 'Security & Account Management' : 'Firebase Authentication'}
            </h2>
            <p className="text-xs text-[#49454F] dark:text-[#CAC4D0]">
              Single UID Identity Model across Web and Android (Project: <span className="font-mono text-[#6750A4] dark:text-[#D0BCFF]">avanyx-store</span>)
            </p>
          </div>
        </div>

        {/* Auth status or messages */}
        {authError && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed space-y-2">
                <div>{authError}</div>
                {authError.includes('already registered') && authMode === 'REGISTER' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('LOGIN');
                      clearAuthError();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-700 dark:text-rose-300 font-bold transition-all text-xs"
                  >
                    <LogIn className="w-3.5 h-3.5" /> Switch to Sign In &rarr;
                  </button>
                )}
              </div>
            </div>

            {authError.includes('Domain authorization required') && (
              <div className="p-4 rounded-2xl bg-[#6750A4]/10 border border-[#6750A4]/20 text-[#1D1B20] dark:text-[#E6E1E5] text-xs space-y-3">
                <div className="font-bold text-[#6750A4] dark:text-[#D0BCFF] flex items-center justify-between gap-2">
                  <span>How to authorize this domain for Google Sign-In:</span>
                  {copiedHostname && (
                    <span className="text-[11px] text-emerald-500 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Copied to clipboard!
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-[11px] text-[#49454F] dark:text-[#CAC4D0]">
                  <p>
                    1. Open <strong>Firebase Console</strong> &rarr; <strong>Authentication</strong> &rarr; <strong>Settings</strong> &rarr; <strong>Authorized Domains</strong>.
                  </p>
                  <p>
                    2. Click <strong>Add Domain</strong> and paste either or both of these domains:
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {currentHostname && (
                    <button
                      onClick={() => handleCopyHostname(currentHostname)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#25262B] border border-black/10 dark:border-white/10 text-xs font-mono font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-all text-[#1D1B20] dark:text-[#E6E1E5]"
                      title="Copy Current Domain"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#6750A4]" />
                      <span>{currentHostname}</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleCopyHostname('avanyx-store.ai.studio')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#25262B] border border-black/10 dark:border-white/10 text-xs font-mono font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-all text-[#1D1B20] dark:text-[#E6E1E5]"
                    title="Copy Production Domain"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#6750A4]" />
                    <span>avanyx-store.ai.studio</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {actionSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {!isAuthenticated ? (
          <div className="space-y-4 pt-2">
            {/* Google Sign-In options */}
            <div className="space-y-2">
              <button
                onClick={handleGoogleSignIn}
                disabled={isSubmitting || authLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-[#F3EDF7] dark:bg-[#2A282F] hover:bg-[#E8DEF8] dark:hover:bg-[#34323B] border border-black/5 dark:border-white/5 text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5] transition-all disabled:opacity-50 shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-3.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.4-6.7-5.3L1.6 16.1C3.5 19.9 7.4 23 12 23z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleGoogleRedirectSignIn}
                  disabled={isSubmitting || authLoading}
                  className="text-[11px] text-[#6750A4] dark:text-[#D0BCFF] hover:underline font-semibold transition-all disabled:opacity-50"
                >
                  Having trouble with popups? Sign in with redirect &rarr;
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#49454F] dark:text-[#CAC4D0]">
              <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
              <span>or email and password</span>
              <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
            </div>

            {/* Email form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {authMode === 'REGISTER' && (
                <div>
                  <label className="block text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0] mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex Vance"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                  />
                </div>
              )}
              <div>
                <label className="block text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@avanyx.io"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0]">
                    Password
                  </label>
                  {authMode === 'LOGIN' && (
                    <button
                      id="btn-forgot-password-trigger"
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        setForgotMessage(null);
                        setShowForgotModal(true);
                      }}
                      className="text-[11px] font-semibold text-[#6750A4] dark:text-[#D0BCFF] hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                />
              </div>

              <div className="flex items-center justify-between pt-1 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN');
                    clearAuthError();
                  }}
                  className="text-xs font-bold text-[#6750A4] dark:text-[#D0BCFF] hover:underline"
                >
                  {authMode === 'LOGIN' ? 'Create new account' : 'Already have an account? Log in'}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || authLoading}
                  className="px-5 py-2.5 rounded-2xl bg-[#6750A4] hover:bg-[#523e85] text-white text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : authMode === 'LOGIN' ? (
                    <LogIn className="w-4 h-4" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  <span>{authMode === 'LOGIN' ? 'Sign In' : 'Register'}</span>
                </button>
              </div>

              {/* Quick Fill Test Accounts */}
              <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-1.5">
                <div className="text-[10px] font-bold text-[#49454F] dark:text-[#CAC4D0] uppercase tracking-wider">
                  Quick Fill Test Accounts:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('alok8881864873@gmail.com');
                      setPassword('Admin@123456');
                      setAuthMode('LOGIN');
                      clearAuthError();
                    }}
                    className="px-2.5 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-[#6750A4] dark:text-[#D0BCFF] text-[11px] font-bold transition-all"
                  >
                    👑 Primary Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('developer@avanyx.io');
                      setPassword('Developer@123');
                      setAuthMode('LOGIN');
                      clearAuthError();
                    }}
                    className="px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold transition-all"
                  >
                    🛠️ Developer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('student@mit.edu');
                      setPassword('Student@123');
                      setAuthMode('LOGIN');
                      clearAuthError();
                    }}
                    className="px-2.5 py-1 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[11px] font-bold transition-all"
                  >
                    🎓 Student
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {/* Authenticated user management buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                id="btn-goto-account-settings"
                onClick={() => setCurrentTab('ACCOUNT_SETTINGS')}
                className="p-3.5 rounded-2xl bg-[#6750A4]/10 dark:bg-[#D0BCFF]/10 hover:bg-[#6750A4]/20 text-[#6750A4] dark:text-[#D0BCFF] text-xs font-bold transition-all flex items-center gap-2.5 text-left border border-[#6750A4]/20"
              >
                <Settings className="w-4 h-4 text-[#6750A4] dark:text-[#D0BCFF]" />
                <div>
                  <div>Account Settings</div>
                  <div className="text-[10px] font-normal text-[#49454F] dark:text-[#CAC4D0]">Email, password, security</div>
                </div>
              </button>

              <button
                onClick={handlePasswordReset}
                disabled={isSubmitting}
                className="p-3.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] hover:bg-[#E8DEF8] dark:hover:bg-[#34323B] text-[#1D1B20] dark:text-[#E6E1E5] text-xs font-bold transition-all flex items-center gap-2.5 text-left"
              >
                <KeyRound className="w-4 h-4 text-[#6750A4]" />
                <div>
                  <div>Reset / Change Password</div>
                  <div className="text-[10px] font-normal text-[#49454F] dark:text-[#CAC4D0]">Send secure reset link</div>
                </div>
              </button>

              <button
                onClick={handleSendVerificationEmail}
                disabled={isSubmitting}
                className="p-3.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] hover:bg-[#E8DEF8] dark:hover:bg-[#34323B] text-[#1D1B20] dark:text-[#E6E1E5] text-xs font-bold transition-all flex items-center gap-2.5 text-left"
              >
                <Mail className="w-4 h-4 text-emerald-500" />
                <div>
                  <div>Email Verification</div>
                  <div className="text-[10px] font-normal text-[#49454F] dark:text-[#CAC4D0]">
                    {user.emailVerified ? 'Verified address' : 'Send verification link'}
                  </div>
                </div>
              </button>
            </div>

            {/* Account Deletion Section (Forbidden for Admin) */}
            <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4" /> Danger Zone: Delete Account
                </span>
                <p className="text-[11px] text-[#49454F] dark:text-[#CAC4D0]">
                  Permanently erase your user profile and Firestore data.
                  {user.realRole === 'ADMIN' && (
                    <span className="font-bold text-rose-600 block mt-0.5">
                      (Admin accounts cannot be self-deleted for security and system continuity).
                    </span>
                  )}
                </p>
              </div>

              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={user.realRole === 'ADMIN'}
                className="px-4 py-2 rounded-xl bg-rose-600/10 hover:bg-rose-600 text-rose-600 hover:text-white font-bold text-xs transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Account Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 space-y-1">
          <div className="flex items-center justify-between text-[#49454F] dark:text-[#CAC4D0]">
            <span className="text-xs font-bold">Installed Applications</span>
            <PackageCheck className="w-4 h-4 text-[#6750A4]" />
          </div>
          <p className="text-2xl font-black text-[#1D1B20] dark:text-[#E6E1E5]">
            {installedApps.length} APKS
          </p>
          <span className="text-[10px] text-emerald-500 font-bold">100% CyberShield Scanned</span>
        </div>

        <div
          onClick={() => setCurrentTab('NOTIFICATIONS')}
          className="p-5 rounded-2xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 space-y-1 cursor-pointer hover:border-[#6750A4]/40 transition-all"
        >
          <div className="flex items-center justify-between text-[#49454F] dark:text-[#CAC4D0]">
            <span className="text-xs font-bold">Unread Notifications</span>
            <Bell className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-[#1D1B20] dark:text-[#E6E1E5]">
            {unreadCount} Alerts
          </p>
          <span className="text-[10px] text-[#6750A4] dark:text-[#D0BCFF] font-bold">Click to view alerts</span>
        </div>

        <div
          onClick={() => (user.realRole === 'ADMIN' ? setCurrentTab('ADMIN_CONSOLE') : setCurrentTab('DEV_CONSOLE'))}
          className="p-5 rounded-2xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 space-y-1 cursor-pointer hover:border-[#6750A4]/40 transition-all"
        >
          <div className="flex items-center justify-between text-[#49454F] dark:text-[#CAC4D0]">
            <span className="text-xs font-bold">Admin / Developer Console</span>
            <Terminal className="w-4 h-4 text-[#6750A4]" />
          </div>
          <p className="text-2xl font-black text-[#1D1B20] dark:text-[#E6E1E5]">
            {user.realRole === 'ADMIN' ? 'Admin Access' : user.role === 'DEVELOPER' ? 'Developer' : 'Standard'}
          </p>
          <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
            Open Management Console <ExternalLink className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1F23] rounded-3xl p-6 max-w-md w-full border border-black/10 dark:border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#6750A4]" />
                Edit Profile Details
              </h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-2 rounded-xl text-[#49454F] dark:text-[#CAC4D0] hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0] mb-1">
                  Full Name / Display Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0] mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0] mb-1">
                  Bio / Status Note
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Android developer, AI explorer..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#6750A4] text-white text-xs font-bold hover:bg-[#523e85] disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Developer Verification Modal */}
      {showDevModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1F23] rounded-3xl p-6 max-w-md w-full border border-black/10 dark:border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-500" />
                Apply for Developer Verification
              </h3>
              <button
                onClick={() => {
                  setShowDevModal(false);
                  setDevSubmitState('IDLE');
                  setDevSubmitError(null);
                }}
                className="p-2 rounded-xl text-[#49454F] dark:text-[#CAC4D0] hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {devSubmitState === 'SUCCESS' ? (
              <div className="py-4 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-base text-[#1D1B20] dark:text-[#E6E1E5]">
                    Application Submitted Successfully
                  </h4>
                  <p className="text-xs text-[#49454F] dark:text-[#CAC4D0] leading-relaxed">
                    Your developer credentials have been received and queued in the Administrator Review panel.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-left space-y-1.5 border border-black/5 dark:border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0]">Status</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      PENDING_REVIEW
                    </span>
                  </div>
                  {devCaseId && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0]">Case / Application ID</span>
                      <div className="flex items-center gap-1.5">
                        <code className="text-[11px] font-mono font-bold text-[#1D1B20] dark:text-[#E6E1E5]">
                          {devCaseId.length > 16 ? `${devCaseId.substring(0, 8)}...${devCaseId.substring(devCaseId.length - 6)}` : devCaseId}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(devCaseId);
                            setCopiedDevCaseId(true);
                            setTimeout(() => setCopiedDevCaseId(false), 2000);
                          }}
                          className="p-1 rounded-lg text-[#49454F] dark:text-[#CAC4D0] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                          title="Copy Case ID"
                        >
                          {copiedDevCaseId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowDevModal(false);
                    setDevSubmitState('IDLE');
                    setDevSubmitError(null);
                  }}
                  className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitDevRequest} className="space-y-3">
                {devSubmitState === 'ERROR' && devSubmitError && (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{devSubmitError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0] mb-1">
                    Organization / Studio Name
                  </label>
                  <input
                    type="text"
                    required
                    value={devOrg}
                    onChange={(e) => setDevOrg(e.target.value)}
                    placeholder="e.g. Apex Software Labs"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0] mb-1">
                    Official Website
                  </label>
                  <input
                    type="url"
                    required
                    value={devWebsite}
                    onChange={(e) => setDevWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0] mb-1">
                    GitHub Profile or Organization URL
                  </label>
                  <input
                    type="url"
                    required
                    value={devGithub}
                    onChange={(e) => setDevGithub(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0] mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      required
                      value={devEmail}
                      onChange={(e) => setDevEmail(e.target.value)}
                      placeholder="contact@dev.com"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0] mb-1">
                      Country / Region
                    </label>
                    <input
                      type="text"
                      required
                      value={devCountry}
                      onChange={(e) => setDevCountry(e.target.value)}
                      placeholder="e.g. United States"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0] mb-1">
                    Developer / Studio Description
                  </label>
                  <textarea
                    rows={2}
                    value={devDescription}
                    onChange={(e) => setDevDescription(e.target.value)}
                    placeholder="Summary of your studio, indie experience, or development focus..."
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0] mb-1">
                    Additional Verification Notes
                  </label>
                  <textarea
                    rows={2}
                    value={devNotes}
                    onChange={(e) => setDevNotes(e.target.value)}
                    placeholder="Tell administrators about the applications you plan to publish..."
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    disabled={devSubmitState === 'SUBMITTING'}
                    onClick={() => {
                      setShowDevModal(false);
                      setDevSubmitState('IDLE');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={devSubmitState === 'SUBMITTING'}
                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {devSubmitState === 'SUBMITTING' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <span>Submit Application</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Forgot Password Modal (Before Authentication) */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1F23] rounded-3xl p-6 max-w-md w-full border border-black/10 dark:border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#6750A4] dark:text-[#D0BCFF]" />
                Reset Your Password
              </h3>
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotMessage(null);
                }}
                className="p-2 rounded-xl text-[#49454F] dark:text-[#CAC4D0] hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#49454F] dark:text-[#CAC4D0] leading-relaxed">
              Enter your account's email address. We'll send a secure password reset link to your inbox.
            </p>

            {forgotMessage && (
              <div
                className={`p-3 rounded-2xl text-xs font-medium flex items-center gap-2 ${
                  forgotMessage.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                }`}
              >
                {forgotMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{forgotMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUnauthenticatedPasswordReset} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0] mb-1">
                  Email Address
                </label>
                <input
                  id="input-forgot-password-email"
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="your-account@example.com"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotMessage(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5]"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-forgot-password"
                  type="submit"
                  disabled={forgotSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#6750A4] hover:bg-[#523e85] text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {forgotSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Verification Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1F23] rounded-3xl p-6 max-w-md w-full border border-black/10 dark:border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-500" />
                Apply for Student Verification
              </h3>
              <button
                onClick={() => {
                  setShowStudentModal(false);
                  setStuSubmitState('IDLE');
                  setStuSubmitError(null);
                }}
                className="p-2 rounded-xl text-[#49454F] dark:text-[#CAC4D0] hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {stuSubmitState === 'SUCCESS' ? (
              <div className="py-4 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-base text-[#1D1B20] dark:text-[#E6E1E5]">
                    Student Application Submitted
                  </h4>
                  <p className="text-xs text-[#49454F] dark:text-[#CAC4D0] leading-relaxed">
                    Your student verification credentials have been submitted and queued for review.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-left space-y-1.5 border border-black/5 dark:border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0]">Status</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      PENDING_REVIEW
                    </span>
                  </div>
                  {stuCaseId && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0]">Request ID</span>
                      <div className="flex items-center gap-1.5">
                        <code className="text-[11px] font-mono font-bold text-[#1D1B20] dark:text-[#E6E1E5]">
                          {stuCaseId.length > 16 ? `${stuCaseId.substring(0, 8)}...${stuCaseId.substring(stuCaseId.length - 6)}` : stuCaseId}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(stuCaseId);
                            setCopiedStuCaseId(true);
                            setTimeout(() => setCopiedStuCaseId(false), 2000);
                          }}
                          className="p-1 rounded-lg text-[#49454F] dark:text-[#CAC4D0] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                          title="Copy Request ID"
                        >
                          {copiedStuCaseId ? <Check className="w-3.5 h-3.5 text-blue-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowStudentModal(false);
                    setStuSubmitState('IDLE');
                    setStuSubmitError(null);
                  }}
                  className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitStudentRequest} className="space-y-3">
                {stuSubmitState === 'ERROR' && stuSubmitError && (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{stuSubmitError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0] mb-1">
                    Educational Institution Name
                  </label>
                  <input
                    type="text"
                    required
                    value={stuInstitution}
                    onChange={(e) => setStuInstitution(e.target.value)}
                    placeholder="e.g. Stanford University / MIT"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0] mb-1">
                    Student ID Number / Enrollment Code
                  </label>
                  <input
                    type="text"
                    required
                    value={stuId}
                    onChange={(e) => setStuId(e.target.value)}
                    placeholder="e.g. STU-892102"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0] mb-1">
                    Expected Graduation Year
                  </label>
                  <input
                    type="number"
                    required
                    min="2024"
                    max="2035"
                    value={stuGradYear}
                    onChange={(e) => setStuGradYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0] mb-1">
                    Supporting Document Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={stuDocUrl}
                    onChange={(e) => setStuDocUrl(e.target.value)}
                    placeholder="https://... (ID card or enrollment cert)"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    disabled={stuSubmitState === 'SUBMITTING'}
                    onClick={() => {
                      setShowStudentModal(false);
                      setStuSubmitState('IDLE');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={stuSubmitState === 'SUBMITTING'}
                    className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {stuSubmitState === 'SUBMITTING' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <span>Submit Student Application</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1F23] rounded-3xl p-6 max-w-md w-full border border-rose-500/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Confirm Account Deletion
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-2 rounded-xl text-[#49454F] dark:text-[#CAC4D0] hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#49454F] dark:text-[#CAC4D0] leading-relaxed">
              This action is permanent and irreversible. Your user document, verification requests, and account credentials will be erased immediately.
            </p>

            <div className="p-3 rounded-2xl bg-rose-500/10 text-xs text-rose-700 dark:text-rose-300 font-medium">
              Please type <span className="font-mono font-black">DELETE</span> below to confirm:
            </div>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-center font-bold"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== 'DELETE' || isSubmitting}
                onClick={handleDeleteAccount}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-40"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
