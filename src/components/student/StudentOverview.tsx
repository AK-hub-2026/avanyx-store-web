import React from 'react';
import { User, StoreApp } from '../../types';
import {
  GraduationCap,
  School,
  Calendar,
  CheckCircle2,
  Package,
  Download,
  Star,
  ShieldCheck,
  Key,
  Plus,
  BookOpen,
  ArrowUpRight,
  Sparkles,
  Terminal
} from 'lucide-react';

interface StudentOverviewProps {
  user: User;
  studentApps: StoreApp[];
  onNavigateTab: (tab: 'PROJECTS' | 'RESOURCES' | 'SANDBOX' | 'PERMISSIONS') => void;
  onOpenSubmitModal: () => void;
}

export const StudentOverview: React.FC<StudentOverviewProps> = ({
  user,
  studentApps,
  onNavigateTab,
  onOpenSubmitModal
}) => {
  const totalDownloads = studentApps.reduce((acc, a) => acc + (a.downloadCount || 0), 0);
  const averageRating =
    studentApps.length > 0
      ? (
          studentApps.reduce((acc, a) => acc + (a.rating || 5.0), 0) / studentApps.length
        ).toFixed(1)
      : '5.0';

  const institution = user.studentDetails?.institutionName || user.studentDetails?.institution || 'Enrolled University';
  const major = user.studentDetails?.major || user.studentDetails?.fieldOfStudy || 'Computer Science / Engineering';
  const gradYear = user.studentDetails?.graduationYear || '2026';
  const studentKey = `AVX-STU-${user.id.substring(0, 8).toUpperCase()}`;

  return (
    <div id="student-overview-module" className="space-y-6">
      {/* Top Academic Profile Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#111C2E] to-[#0A101D] border border-cyan-500/20 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-400 p-0.5 shadow-lg shadow-cyan-500/20 shrink-0">
              <div className="w-full h-full bg-[#0F172A] rounded-[14px] flex items-center justify-center text-cyan-400 font-bold">
                <GraduationCap className="w-8 h-8" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
                  {user.name || 'Student Developer'}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                  Verified Student
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-cyan-100/70 flex-wrap">
                <span className="flex items-center gap-1">
                  <School className="w-3.5 h-3.5 text-cyan-400" />
                  {institution}
                </span>
                <span>•</span>
                <span>{major}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  Class of {gradYear}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-quick-submit-app"
              onClick={onOpenSubmitModal}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Educational APK</span>
            </button>
          </div>
        </div>

        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#06B6D4_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#131926] border border-black/10 dark:border-cyan-500/10 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[#6750A4] dark:text-cyan-400">
            <Package className="w-5 h-5" />
            <span className="text-[10px] uppercase font-black tracking-wider text-[#6750A4]/70 dark:text-cyan-500/60">Live</span>
          </div>
          <div>
            <div className="text-2xl font-black text-[#1D1B20] dark:text-white">{studentApps.length}</div>
            <div className="text-xs font-semibold text-[#49454F] dark:text-slate-400">Published Projects</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#131926] border border-black/10 dark:border-cyan-500/10 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <Download className="w-5 h-5" />
            <span className="text-[10px] uppercase font-black tracking-wider text-emerald-700/70 dark:text-emerald-500/60">Real-time</span>
          </div>
          <div>
            <div className="text-2xl font-black text-[#1D1B20] dark:text-white">{totalDownloads.toLocaleString()}</div>
            <div className="text-xs font-semibold text-[#49454F] dark:text-slate-400">Total Downloads</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#131926] border border-black/10 dark:border-cyan-500/10 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <Star className="w-5 h-5" />
            <span className="text-[10px] uppercase font-black tracking-wider text-amber-700/70 dark:text-amber-500/60">Peer Review</span>
          </div>
          <div>
            <div className="text-2xl font-black text-[#1D1B20] dark:text-white">{averageRating} ★</div>
            <div className="text-xs font-semibold text-[#49454F] dark:text-slate-400">Average Rating</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#131926] border border-black/10 dark:border-cyan-500/10 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[#6750A4] dark:text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] uppercase font-black tracking-wider text-[#6750A4]/70 dark:text-cyan-500/60">100% Clean</span>
          </div>
          <div>
            <div className="text-2xl font-black text-[#1D1B20] dark:text-white">99.8%</div>
            <div className="text-xs font-semibold text-[#49454F] dark:text-slate-400">Security Score</div>
          </div>
        </div>
      </div>

      {/* API Sandbox Key & Academic Token */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#131926] border border-black/10 dark:border-cyan-500/10 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#6750A4] dark:text-cyan-400 font-bold text-sm">
            <Key className="w-4 h-4" />
            <span>Academic Developer Sandbox Credentials</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            Sandbox Active
          </span>
        </div>

        <p className="text-xs text-[#49454F] dark:text-slate-400 leading-relaxed">
          Use this authorization key in your Android manifest or build scripts to authenticate with AVANYX test telemetry streams and verify APK distribution:
        </p>

        <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#F8F9FA] dark:bg-[#0B0F17] border border-black/10 dark:border-cyan-500/20 font-mono text-xs text-[#6750A4] dark:text-cyan-300">
          <Terminal className="w-4 h-4 text-[#6750A4] dark:text-cyan-500 shrink-0" />
          <span className="select-all flex-1 truncate font-bold">{studentKey}</span>
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(studentKey);
                alert('Academic Sandbox Key copied to clipboard!');
              }
            }}
            className="px-2.5 py-1 rounded-lg bg-[#6750A4]/10 dark:bg-cyan-500/15 text-[#6750A4] dark:text-cyan-300 hover:bg-[#6750A4]/20 dark:hover:bg-cyan-500/25 text-[11px] font-bold shrink-0 transition-colors"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigateTab('PROJECTS')}
          className="text-left p-5 rounded-3xl bg-white dark:bg-[#131926] hover:bg-[#F8F9FA] dark:hover:bg-[#161F30] border border-black/10 dark:border-cyan-500/10 hover:border-[#6750A4]/30 dark:hover:border-cyan-500/30 transition-all space-y-2 group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#6750A4]/10 dark:bg-cyan-500/10 text-[#6750A4] dark:text-cyan-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#6750A4] dark:group-hover:text-cyan-400 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-[#1D1B20] dark:text-white group-hover:text-[#6750A4] dark:group-hover:text-cyan-300 transition-colors">
            Manage Projects ({studentApps.length})
          </h4>
          <p className="text-xs text-[#49454F] dark:text-slate-400">
            Review your published coursework apps, update APK versions, and track download telemetry.
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('RESOURCES')}
          className="text-left p-5 rounded-3xl bg-white dark:bg-[#131926] hover:bg-[#F8F9FA] dark:hover:bg-[#161F30] border border-black/10 dark:border-cyan-500/10 hover:border-purple-500/30 transition-all space-y-2 group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-[#1D1B20] dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
            Student Developer Pack
          </h4>
          <p className="text-xs text-[#49454F] dark:text-slate-400">
            Access free Gemini AI sandbox tokens, Kotlin templates, and Android Studio guidelines.
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('PERMISSIONS')}
          className="text-left p-5 rounded-3xl bg-white dark:bg-[#131926] hover:bg-[#F8F9FA] dark:hover:bg-[#161F30] border border-black/10 dark:border-cyan-500/10 hover:border-emerald-500/30 transition-all space-y-2 group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-[#1D1B20] dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
            RBAC Compliance & Rules
          </h4>
          <p className="text-xs text-[#49454F] dark:text-slate-400">
            Understand non-commercial educational publishing bounds and upgrade to Full Developer.
          </p>
        </button>
      </div>
    </div>
  );
};
