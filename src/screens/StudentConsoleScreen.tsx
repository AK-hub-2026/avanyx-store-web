import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronLeft,
  School,
  Calendar,
  Mail,
  ShieldCheck,
  Package,
  ArrowRight,
  Terminal,
  LogOut,
  Hash,
  Layers,
  Sparkle
} from 'lucide-react';
import { StudentOverview } from '../components/student/StudentOverview';
import { StudentProjectsList } from '../components/student/StudentProjectsList';
import { StudentPackResources } from '../components/student/StudentPackResources';
import { StudentTelemetrySandbox } from '../components/student/StudentTelemetrySandbox';
import { StudentPermissionsMatrix } from '../components/student/StudentPermissionsMatrix';
import { StudentApplyScreen } from './StudentApplyScreen';

interface StudentConsoleScreenProps {
  onExit?: () => void;
  applyMode?: boolean;
}

export const StudentConsoleScreen: React.FC<StudentConsoleScreenProps> = ({ onExit, applyMode = false }) => {
  const {
    user,
    isAuthenticated,
    apps,
    setCurrentTab,
    requestStudentVerification,
    reloadUserProfile
  } = useStore();

  const isVerifiedStudent =
    user?.role === 'STUDENT' ||
    user?.studentStatus === 'VERIFIED' ||
    user?.role === 'ADMIN' ||
    user?.realRole === 'ADMIN';

  const isStudentPending = user?.studentStatus === 'PENDING' || user?.studentStatus === 'PENDING_REVIEW';

  // Active module in sidebar
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PROJECTS' | 'RESOURCES' | 'SANDBOX' | 'PERMISSIONS'>('OVERVIEW');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Application form states if applying
  const [institutionName, setInstitutionName] = useState(user?.studentDetails?.institutionName || '');
  const [degreeProgram, setDegreeProgram] = useState(user?.studentDetails?.major || '');
  const [gradYear, setGradYear] = useState(user?.studentDetails?.graduationYear || new Date().getFullYear() + 2);
  const [studentEmail, setStudentEmail] = useState(user?.email || '');
  const [agreeAcademicCode, setAgreeAcademicCode] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter apps submitted by this student or educational apps
  const studentApps = apps.filter(
    (a) =>
      (a.developerUid && a.developerUid === user?.id) ||
      a.isStudentSpotlight ||
      (a.category === 'EDUCATION' && a.developer === user?.name)
  );

  const handleApplyStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeAcademicCode) {
      setErrorMessage('Please confirm your enrollment in an accredited institution.');
      return;
    }
    if (!institutionName.trim()) {
      setErrorMessage('Please provide your university or college name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await requestStudentVerification({
        institutionName: institutionName.trim(),
        studentIdNumber: `STU_${Date.now().toString().slice(-6)}`,
        graduationYear: String(gradYear),
        notes: `Major / Degree: ${degreeProgram.trim() || 'Computer Science'}`
      });

      if (res && res.requestId) {
        setSubmitSuccess(true);
      } else {
        setErrorMessage('Failed to submit student verification request.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error submitting student verification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturn = () => {
    if (onExit) {
      onExit();
    } else {
      setCurrentTab('HOME');
      if (typeof window !== 'undefined' && window.history && window.history.pushState) {
        window.history.pushState({}, '', '/store');
      }
    }
  };

  const handleApplyDeveloper = () => {
    setCurrentTab('DEVELOPER_APPLY');
    if (typeof window !== 'undefined' && window.history && window.history.pushState) {
      window.history.pushState({}, '', '/developer/apply');
    }
  };

  // 1. If not authenticated, prompt sign in
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-[#F8F9FA] dark:bg-[#0B0F17] text-[#1D1B20] dark:text-white">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-[#131926] border border-black/10 dark:border-cyan-500/20 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#6750A4]/10 dark:bg-cyan-500/15 text-[#6750A4] dark:text-cyan-400 mx-auto flex items-center justify-center shadow-lg shadow-[#6750A4]/10 dark:shadow-cyan-500/20">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-[#1D1B20] dark:text-white">AVANYX Student Console</h2>
            <p className="text-xs text-[#49454F] dark:text-slate-400 leading-relaxed">
              Sign in with your student account or university credentials to access the academic APK sandbox and educational distribution portal.
            </p>
          </div>
          <button
            onClick={() => {
              setCurrentTab('LOGIN');
              if (typeof window !== 'undefined' && window.history && window.history.pushState) {
                window.history.pushState({}, '', '/login');
              }
            }}
            className="w-full py-3 rounded-xl bg-[#6750A4] hover:bg-[#523e85] text-white font-black text-xs transition-all shadow-md shadow-[#6750A4]/25"
          >
            Sign In with AVANYX Account
          </button>
        </div>
      </div>
    );
  }

  // 2. If authenticated but NOT verified student, show full Class 10+ Student Application Screen
  if (!isVerifiedStudent || applyMode) {
    return <StudentApplyScreen onBack={handleReturn} />;
  }

  // 3. Authenticated Verified Student Console with Sidebar layout
  return (
    <div className="w-full space-y-6 text-[#1D1B20] dark:text-zinc-100 font-sans">
      <div className="w-full space-y-6">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={handleReturn}
            className="self-start px-3.5 py-2 rounded-xl bg-white dark:bg-[#131926] border border-black/10 dark:border-cyan-500/20 text-xs font-bold text-[#1D1B20] dark:text-slate-300 hover:bg-black/5 dark:hover:text-white transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#6750A4]/10 dark:bg-cyan-500/15 text-[#6750A4] dark:text-cyan-400 border border-[#6750A4]/20 dark:border-cyan-500/30 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Developer Portal</span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Academic</span>
            </span>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar (Scrollable horizontally) */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-black/10 dark:border-cyan-500/20">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'OVERVIEW'
                ? 'bg-[#6750A4] text-white dark:bg-cyan-500 dark:text-slate-950 font-black'
                : 'bg-white dark:bg-[#131926] text-[#49454F] dark:text-slate-400 border border-black/5 dark:border-white/5'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('PROJECTS')}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'PROJECTS'
                ? 'bg-[#6750A4] text-white dark:bg-cyan-500 dark:text-slate-950 font-black'
                : 'bg-white dark:bg-[#131926] text-[#49454F] dark:text-slate-400 border border-black/5 dark:border-white/5'
            }`}
          >
            My Projects ({studentApps.length})
          </button>
          <button
            onClick={() => setActiveTab('RESOURCES')}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'RESOURCES'
                ? 'bg-[#6750A4] text-white dark:bg-cyan-500 dark:text-slate-950 font-black'
                : 'bg-white dark:bg-[#131926] text-[#49454F] dark:text-slate-400 border border-black/5 dark:border-white/5'
            }`}
          >
            Developer Pack
          </button>
          <button
            onClick={() => setActiveTab('SANDBOX')}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'SANDBOX'
                ? 'bg-[#6750A4] text-white dark:bg-cyan-500 dark:text-slate-950 font-black'
                : 'bg-white dark:bg-[#131926] text-[#49454F] dark:text-slate-400 border border-black/5 dark:border-white/5'
            }`}
          >
            APK Sandbox
          </button>
          <button
            onClick={() => setActiveTab('PERMISSIONS')}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'PERMISSIONS'
                ? 'bg-[#6750A4] text-white dark:bg-cyan-500 dark:text-slate-950 font-black'
                : 'bg-white dark:bg-[#131926] text-[#49454F] dark:text-slate-400 border border-black/5 dark:border-white/5'
            }`}
          >
            RBAC Rules
          </button>
        </div>

        {/* Layout: Desktop Sidebar + Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 rounded-3xl bg-white dark:bg-[#131926] border border-black/10 dark:border-cyan-500/20 p-5 space-y-6 sticky top-6 shadow-xl">
            {/* Student User Snapshot */}
            <div className="flex items-center gap-3 pb-5 border-b border-black/5 dark:border-cyan-500/10">
              <img
                src={
                  user.avatarUrl ||
                  `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(user.name || 'student')}`
                }
                alt={user.name}
                className="w-11 h-11 rounded-2xl object-cover border border-[#6750A4]/20 dark:border-cyan-500/30 bg-[#F8F9FA] dark:bg-[#0B0F17]"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <div className="font-bold text-[#1D1B20] dark:text-white text-xs truncate">{user.name || 'Student'}</div>
                <div className="text-[10px] text-[#6750A4] dark:text-cyan-400 font-semibold truncate">
                  {user.studentDetails?.institutionName || 'Verified Scholar'}
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1.5 text-xs font-bold">
              <button
                onClick={() => setActiveTab('OVERVIEW')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all ${
                  activeTab === 'OVERVIEW'
                    ? 'bg-[#6750A4] text-white dark:bg-cyan-500 dark:text-slate-950 font-black shadow-md shadow-[#6750A4]/20'
                    : 'text-[#49454F] dark:text-slate-400 hover:text-[#1D1B20] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <GraduationCap className="w-4 h-4 shrink-0" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('PROJECTS')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all ${
                  activeTab === 'PROJECTS'
                    ? 'bg-[#6750A4] text-white dark:bg-cyan-500 dark:text-slate-950 font-black shadow-md shadow-[#6750A4]/20'
                    : 'text-[#49454F] dark:text-slate-400 hover:text-[#1D1B20] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 shrink-0" />
                  <span>My Projects</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === 'PROJECTS'
                      ? 'bg-white/20 text-white dark:bg-slate-950 dark:text-cyan-300 font-bold'
                      : 'bg-black/5 dark:bg-[#0B0F17] text-[#49454F] dark:text-slate-400'
                  }`}
                >
                  {studentApps.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('RESOURCES')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all ${
                  activeTab === 'RESOURCES'
                    ? 'bg-[#6750A4] text-white dark:bg-cyan-500 dark:text-slate-950 font-black shadow-md shadow-[#6750A4]/20'
                    : 'text-[#49454F] dark:text-slate-400 hover:text-[#1D1B20] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>Developer Pack</span>
              </button>

              <button
                onClick={() => setActiveTab('SANDBOX')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all ${
                  activeTab === 'SANDBOX'
                    ? 'bg-[#6750A4] text-white dark:bg-cyan-500 dark:text-slate-950 font-black shadow-md shadow-[#6750A4]/20'
                    : 'text-[#49454F] dark:text-slate-400 hover:text-[#1D1B20] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <Terminal className="w-4 h-4 shrink-0" />
                <span>APK Sandbox</span>
              </button>

              <button
                onClick={() => setActiveTab('PERMISSIONS')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all ${
                  activeTab === 'PERMISSIONS'
                    ? 'bg-[#6750A4] text-white dark:bg-cyan-500 dark:text-slate-950 font-black shadow-md shadow-[#6750A4]/20'
                    : 'text-[#49454F] dark:text-slate-400 hover:text-[#1D1B20] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>RBAC & Rules</span>
              </button>
            </nav>

            {/* Quick Submit APK action */}
            <div className="pt-5 border-t border-black/5 dark:border-cyan-500/10 space-y-2">
              <button
                onClick={() => {
                  setActiveTab('PROJECTS');
                  setIsSubmitModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-[#6750A4] hover:bg-[#523e85] text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Submit Project APK</span>
              </button>
            </div>
          </aside>

          {/* Right Main Workspace */}
          <main className="flex-1 w-full min-w-0">
            {activeTab === 'OVERVIEW' && (
              <StudentOverview
                user={user}
                studentApps={studentApps}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenSubmitModal={() => {
                  setActiveTab('PROJECTS');
                  setIsSubmitModalOpen(true);
                }}
              />
            )}

            {activeTab === 'PROJECTS' && (
              <StudentProjectsList
                user={user}
                studentApps={studentApps}
                onRefresh={async () => {
                  await reloadUserProfile();
                }}
                isModalOpen={isSubmitModalOpen}
                onCloseModal={() => setIsSubmitModalOpen(false)}
                onOpenModal={() => setIsSubmitModalOpen(true)}
              />
            )}

            {activeTab === 'RESOURCES' && <StudentPackResources />}

            {activeTab === 'SANDBOX' && (
              <StudentTelemetrySandbox user={user} studentApps={studentApps} />
            )}

            {activeTab === 'PERMISSIONS' && (
              <StudentPermissionsMatrix onApplyDeveloper={handleApplyDeveloper} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
