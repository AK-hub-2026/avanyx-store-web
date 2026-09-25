import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { AvanyxLogo } from '../components/AvanyxLogo';
import { AppCard } from '../components/AppCard';
import {
  ShieldCheck,
  Sparkles,
  Gamepad2,
  Wrench,
  GraduationCap,
  FileText,
  Mail,
  Shield,
  Download,
  CheckCircle2,
  Lock,
  Terminal,
  ArrowRight,
  Send,
  HelpCircle,
  Code2,
  Zap,
  Star,
  Check,
  AlertCircle,
  Sun,
  Moon,
  LogIn,
  UserPlus,
  ExternalLink,
  ChevronRight,
  Globe2,
  Cpu,
  Layers,
  Flame,
  TrendingUp,
  FolderGit2,
  Users,
  Server,
  Clock,
  Compass,
  BookOpen,
  Sliders,
  Search
} from 'lucide-react';

interface IntroWelcomePageProps {
  onNavigate: (path: string) => void;
}

export const IntroWelcomePage: React.FC<IntroWelcomePageProps> = ({ onNavigate }) => {
  const { apps, darkMode, setDarkMode, isAuthenticated, user, setCurrentTab } = useStore();

  // Interactive Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('General Inquiry');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  // FAQ Accordion State (Multiple open or single active)
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Category filter state for catalog section
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Interactive search filter inside docs
  const [faqSearch, setFaqSearch] = useState('');

  // Previews from store catalog
  const latestAppsPreview = [...apps]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 6);

  const trendingAppsPreview = apps.filter((a) => a.isFeatured || a.rating >= 4.5).slice(0, 6);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactError(null);
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setContactError('Please fill out all required fields.');
      return;
    }
    setContactSent(true);
    setContactName('');
    setContactEmail('');
    setContactMessage('');
    setTimeout(() => setContactSent(false), 6000);
  };

  // 25 Comprehensive SEO & AI Search FAQs
  const faqs = [
    {
      q: 'What is AVANYX Store?',
      a: 'AVANYX Store is an official, open, and cryptographically secure Android application marketplace and developer distribution hub. It features verified APK downloads, a native Android client, a Developer Console, a free Student Publishing Program, and an automated AI security verification pipeline.'
    },
    {
      q: 'How does AVANYX Store guarantee APK safety and malware prevention?',
      a: 'Every package submitted to AVANYX Store undergoes CyberShield 4-tier security auditing: static bytecode decompilation, isolated Linux/Android sandbox execution, malware signature scanning, SHA-256 checksum verification, and automated AI permission analysis.'
    },
    {
      q: 'Can I download APKs without creating an account or signing in?',
      a: 'Yes! Guest users can freely browse, search, and download verified APKs and desktop packages with zero registration required. Accounts are only needed if you wish to write reviews, track update histories, or publish apps.'
    },
    {
      q: 'What is the AVANYX Developer Console?',
      a: 'The AVANYX Developer Console is a professional portal where software developers can register, upload APK binaries, configure release tracks, view download analytics, manage versions, and distribute Android applications to a global audience with zero forced revenue commissions.'
    },
    {
      q: 'How does Student App Publishing work on AVANYX Store?',
      a: 'Verified students enrolled in accredited schools or universities receive 100% free developer accounts, zero publishing fees, access to AVANYX SDK preview tools, and eligibility for annual developer grants and hackathons.'
    },
    {
      q: 'What are the requirements for publishing Android apps on AVANYX Store?',
      a: 'Publishers must submit compiled APK packages with valid Android manifest metadata, SHA-256 signatures, clear descriptions, and icon assets. Submitted apps must comply with AVANYX Content Policies and pass the CyberShield AI security scan.'
    },
    {
      q: 'What is Bomb Rush 3D on AVANYX Store?',
      a: 'Bomb Rush 3D is a featured high-FPS action game available on AVANYX Store. It provides fast-paced 3D arcade combat, offline gameplay support, and verified malware-free installation.'
    },
    {
      q: 'What is AVANYX AutoPDF?',
      a: 'AVANYX AutoPDF is a popular productivity application available on AVANYX Store. It offers automated PDF document generation, OCR text extraction, offline file conversion, and zero telemetry.'
    },
    {
      q: 'How does the AI Verification Pipeline work for new app uploads?',
      a: 'When an app is uploaded, the automated AI verification engine analyzes the manifest permissions, network socket calls, decompiled DEX bytecode, and developer domain reputation to assign a trust verification score before public publishing.'
    },
    {
      q: 'How are titles, meta descriptions, and keywords generated for published apps?',
      a: 'AVANYX Store includes an Auto SEO Engine that automatically generates search engine titles, meta descriptions, canonical URLs, Open Graph tags, Twitter cards, and SoftwareApplication JSON-LD structured data immediately upon app publishing.'
    },
    {
      q: 'Is AVANYX Store free for indie Android developers?',
      a: 'Yes. AVANYX Store supports indie Android developers by providing free app hosting, zero hidden fees, direct APK distribution, and organic discovery across search engines and AI search assistants.'
    },
    {
      q: 'What limitations apply to student developer accounts?',
      a: 'Student developer accounts enjoy full publishing capabilities with standard rate limits (up to 10 active package releases per account) to maintain ecosystem security while providing free educational hosting.'
    },
    {
      q: 'How does AVANYX Store protect user privacy?',
      a: 'AVANYX Store operates under a strict Zero Telemetry policy. We do not track user device locations, sell personal data to advertisers, or inject third-party ad tracking SDKs into downloaded binaries.'
    },
    {
      q: 'What is AVANYX Identity?',
      a: 'AVANYX Identity is an OAuth 2.0 / OIDC single sign-on framework that allows users to securely log into AVANYX Store, sync app updates across devices, and manage developer security keys using industry-standard PKCE tokens.'
    },
    {
      q: 'Can I install AVANYX Store as a Progressive Web App (PWA)?',
      a: 'Yes! AVANYX Store supports full PWA compliance. You can install it directly to your Android home screen or desktop taskbar for offline catalog browsing and background updates.'
    },
    {
      q: 'What content is prohibited on AVANYX Store?',
      a: 'Prohibited content includes malware, spyware, unauthorized cryptominers, phishing apps, stolen copyright material, predatory adware, and software that violates user consent.'
    },
    {
      q: 'How are SHA-256 checksums verified during APK downloads?',
      a: 'Each APK file has a unique cryptographic SHA-256 hash calculated upon upload. When downloading through the store, the client verifies that the downloaded binary exactly matches the server checksum.'
    },
    {
      q: 'How fast are APK downloads on AVANYX Store?',
      a: 'Downloads are served through global CDN edge mirrors with sub-50ms initial latency and high-speed multi-threaded download support.'
    },
    {
      q: 'How do AI search engines like Gemini, ChatGPT, and Perplexity index AVANYX Store?',
      a: 'AVANYX Store uses structured FAQPage JSON-LD schemas, semantic HTML headers, clean canonical URLs, and public sitemaps allowing AI search engines to accurately ground and reference store applications.'
    },
    {
      q: 'What app categories are available on AVANYX Store?',
      a: 'Categories include Productivity, Tools, Security, Games, AI Agents, Education, Media, Social, Entertainment, Finance, Health, Shopping, Lifestyle, Creativity, Business, and Utilities.'
    },
    {
      q: 'How do I update an existing app in the Developer Console?',
      a: 'Registered developers can log into the Developer Console, select their application, upload a new APK binary with an incremented version code, update changelog notes, and publish instantly.'
    },
    {
      q: 'Does AVANYX Store charge any commission on free or paid apps?',
      a: 'No. AVANYX Store charges 0% commission on free apps and open-source distribution. Developers retain complete ownership of their intellectual property.'
    },
    {
      q: 'What happens if a security vulnerability is reported in a published app?',
      a: 'Our security response team reviews reports within 24 hours. If a package fails re-audit, it is temporarily quarantined and the developer is notified to issue a patched release.'
    },
    {
      q: 'Can I use AVANYX Store on a desktop PC or Mac?',
      a: 'Yes! You can browse the web catalog on any modern browser, download desktop binaries or APKs for Android emulators, and access documentation on Windows, macOS, or Linux.'
    },
    {
      q: 'How can I contact AVANYX Store Developer Relations?',
      a: 'You can submit a ticket directly using the interactive contact form on this documentation page or email support@avanyx.io for partnership, security, or developer support inquiries.'
    }
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const categories = [
    { id: 'PRODUCTIVITY', name: 'Productivity', count: '45+ Apps', desc: 'AutoPDF, note tools, task planners' },
    { id: 'TOOLS', name: 'Developer Tools', count: '30+ Tools', desc: 'Code editors, terminal utilities, APIs' },
    { id: 'SECURITY', name: 'Security & Privacy', count: '20+ Apps', desc: 'CyberShield auditors, VPNs, encryption' },
    { id: 'GAMES', name: 'Action & Arcade Games', count: '50+ Games', desc: 'Bomb Rush 3D, casual, retro runners' },
    { id: 'AI_AGENTS', name: 'AI & Neural Agents', count: '25+ Models', desc: 'AI copilots, text gen, vision bots' },
    { id: 'EDUCATION', name: 'Education & Study', count: '18+ Apps', desc: 'Student publishing, study companions' }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5] selection:bg-[#6750A4]/20 selection:text-[#6750A4] transition-colors">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* TOP NAVIGATION BAR */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 h-20 bg-white/95 dark:bg-[#18191D]/95 backdrop-blur-md border-b border-black/5 dark:border-white/5 px-4 sm:px-8 flex items-center justify-between transition-colors">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setCurrentTab('HOME');
              onNavigate('/store');
            }}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <AvanyxLogo size={36} showText={false} />
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black tracking-tight text-[#1D1B20] dark:text-[#E6E1E5] group-hover:text-[#6750A4] dark:group-hover:text-[#D0BCFF] transition-colors">
                AVANYX <span className="text-[#6750A4] dark:text-[#D0BCFF]">Store</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Official Documentation Hub
              </span>
            </div>
          </button>
        </div>

        {/* Center: Quick Section Links */}
        <nav className="hidden xl:flex items-center gap-1.5 text-xs font-bold text-[#49454F] dark:text-[#CAC4D0]">
          <a href="#about" className="px-2.5 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#1D1B20] dark:hover:text-white transition-colors">
            About
          </a>
          <a href="#features" className="px-2.5 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#1D1B20] dark:hover:text-white transition-colors">
            Features
          </a>
          <a href="#ai-pipeline" className="px-2.5 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#1D1B20] dark:hover:text-white transition-colors">
            AI Security
          </a>
          <a href="#dev-console" className="px-2.5 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#1D1B20] dark:hover:text-white transition-colors">
            Developer Console
          </a>
          <a href="#student-publishing" className="px-2.5 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#1D1B20] dark:hover:text-white transition-colors">
            Students
          </a>
          <a href="#roadmap" className="px-2.5 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#1D1B20] dark:hover:text-white transition-colors">
            Roadmap
          </a>
          <a href="#faqs" className="px-2.5 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#1D1B20] dark:hover:text-white transition-colors">
            FAQs
          </a>
          <a href="#contact" className="px-2.5 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#1D1B20] dark:hover:text-white transition-colors">
            Contact
          </a>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-[#1D1B20] dark:text-[#E6E1E5] hover:bg-[#E8DEF8] dark:hover:bg-[#32343B] transition-colors focus:outline-none"
            title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle Dark/Light Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#6750A4]" />}
          </button>

          <button
            onClick={() => {
              setCurrentTab('HOME');
              onNavigate('/store');
            }}
            className="px-5 py-2.5 rounded-2xl bg-[#6750A4] hover:bg-[#523e85] text-white text-xs font-black shadow-md shadow-[#6750A4]/25 transition-all flex items-center gap-2"
          >
            <span>Enter AVANYX Store</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. HERO SECTION */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-8 border-b border-black/5 dark:border-white/5 bg-gradient-to-b from-transparent via-[#6750A4]/5 to-transparent">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6750A4]/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider shadow-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Official Documentation & Secure App Marketplace</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-[#1D1B20] dark:text-white">
            The Secure App Store for{' '}
            <span className="bg-gradient-to-r from-[#6750A4] via-[#9A82DB] to-[#D0BCFF] bg-clip-text text-transparent">
              Android Apps, AI & Developers
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#49454F] dark:text-[#CAC4D0] max-w-3xl mx-auto leading-relaxed">
            Discover verified Android APK downloads, publish apps using the AVANYX Developer Console, access student publishing programs, and explore malware-scanned software with complete privacy and zero telemetry.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                setCurrentTab('HOME');
                onNavigate('/store');
              }}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-[#6750A4] hover:bg-[#523e85] text-white font-black text-sm sm:text-base shadow-xl shadow-[#6750A4]/30 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5"
            >
              <span>Enter AVANYX Store</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                setCurrentTab('DEV_CONSOLE');
                onNavigate('/developer-console');
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-[#18191D] border border-black/10 dark:border-white/10 hover:bg-[#F3EDF7] dark:hover:bg-[#25262B] text-[#1D1B20] dark:text-white font-bold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Terminal className="w-4 h-4 text-[#6750A4] dark:text-[#D0BCFF]" />
              <span>Open Developer Console</span>
            </button>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#18191D] border border-black/5 dark:border-white/5 shadow-sm">
              <div className="text-2xl font-black text-[#1D1B20] dark:text-white">100%</div>
              <div className="text-xs text-[#49454F] dark:text-[#CAC4D0] font-medium mt-0.5">Verified Clean APKs</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#18191D] border border-black/5 dark:border-white/5 shadow-sm">
              <div className="text-2xl font-black text-emerald-500">0</div>
              <div className="text-xs text-[#49454F] dark:text-[#CAC4D0] font-medium mt-0.5">Malicious Signatures</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#18191D] border border-black/5 dark:border-white/5 shadow-sm">
              <div className="text-2xl font-black text-[#6750A4] dark:text-[#D0BCFF]">SHA-256</div>
              <div className="text-xs text-[#49454F] dark:text-[#CAC4D0] font-medium mt-0.5">Checksum Verified</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#18191D] border border-black/5 dark:border-white/5 shadow-sm">
              <div className="text-2xl font-black text-amber-500">0%</div>
              <div className="text-xs text-[#49454F] dark:text-[#CAC4D0] font-medium mt-0.5">Developer Commission</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-16 space-y-24">
        {/* ───────────────────────────────────────────────────────────── */}
        {/* 2. ABOUT AVANYX STORE */}
        {/* ───────────────────────────────────────────────────────────── */}
        <section id="about" className="space-y-8 scroll-mt-24">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6750A4]/10 dark:bg-[#6750A4]/20 text-[#6750A4] dark:text-[#D0BCFF] text-xs font-black uppercase">
              <Globe2 className="w-3.5 h-3.5" />
              <span>About AVANYX Store</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1D1B20] dark:text-[#E6E1E5]">
              An Open, Independent App Marketplace
            </h2>
            <p className="text-sm sm:text-base text-[#49454F] dark:text-[#CAC4D0] leading-relaxed">
              AVANYX Store was engineered to eliminate ecosystem monopolies, high publisher fees, and invasive telemetry. It provides developers and students with instant publishing rights and users with direct, cryptographically audited APK downloads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#18191D] border border-black/5 dark:border-white/5 space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#6750A4]/15 text-[#6750A4] dark:text-[#D0BCFF] flex items-center justify-center font-black">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-[#1D1B20] dark:text-white">Direct & Unfiltered APK Downloads</h3>
              <p className="text-xs text-[#49454F] dark:text-[#CAC4D0] leading-relaxed">
                Download verified Android APKs directly to any device or emulator without registration bottlenecks or forced store accounts.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#18191D] border border-black/5 dark:border-white/5 space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-black">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-[#1D1B20] dark:text-white">CyberShield 4-Tier Security</h3>
              <p className="text-xs text-[#49454F] dark:text-[#CAC4D0] leading-relaxed">
                Every release is decompiled, audited for malicious code in sandbox containers, and verified against SHA-256 cryptographic signatures.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#18191D] border border-black/5 dark:border-white/5 space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-500 flex items-center justify-center font-black">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-[#1D1B20] dark:text-white">Student Developer Program</h3>
              <p className="text-xs text-[#49454F] dark:text-[#CAC4D0] leading-relaxed">
                Empowering student developers worldwide with zero-cost publishing, verified campus badges, and educational software distribution.
              </p>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 3. PLATFORM FEATURES */}
        {/* ───────────────────────────────────────────────────────────── */}
        <section id="features" className="space-y-8 scroll-mt-24">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-black uppercase">
              <Zap className="w-3.5 h-3.5" />
              <span>Core Features</span>
            </div>
            <h2 className="text-3xl font-black text-[#1D1B20] dark:text-white">
              Platform Capabilities & Architecture
            </h2>
            <p className="text-xs sm:text-sm text-[#49454F] dark:text-[#CAC4D0]">
              Designed for performance, security, and developer convenience across modern mobile and web environments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#18191D] border border-black/5 dark:border-white/5 space-y-2">
              <div className="p-3 rounded-2xl bg-[#6750A4]/10 text-[#6750A4] dark:text-[#D0BCFF] w-fit">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-[#1D1B20] dark:text-white">Native Android Store Client</h3>
              <p className="text-xs text-[#49454F] dark:text-[#CAC4D0] leading-relaxed">
                Connect seamlessly with our native Android app client for background updates, automatic installation, and local storage management.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#18191D] border border-black/5 dark:border-white/5 space-y-2">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 w-fit">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-[#1D1B20] dark:text-white">Auto SEO & AI Search Grounding</h3>
              <p className="text-xs text-[#49454F] dark:text-[#CAC4D0] leading-relaxed">
                Dynamic generation of meta tags, canonical links, and SoftwareApplication JSON-LD schemas ensures instant indexing in AI search models.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#18191D] border border-black/5 dark:border-white/5 space-y-2">
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 w-fit">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-[#1D1B20] dark:text-white">AVANYX Identity (OAuth 2.0 / OIDC)</h3>
              <p className="text-xs text-[#49454F] dark:text-[#CAC4D0] leading-relaxed">
                Single sign-on framework supporting PKCE authorization tokens, developer profile verification, and RBAC permissions.
              </p>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 4. AI VERIFICATION PIPELINE */}
        {/* ───────────────────────────────────────────────────────────── */}
        <section id="ai-pipeline" className="rounded-3xl bg-gradient-to-br from-[#18191D] via-[#22242B] to-[#18191D] border border-[#6750A4]/30 p-8 sm:p-12 space-y-8 text-white scroll-mt-24 shadow-xl">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>CyberShield 4-Tier Security</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              AI Verification Pipeline & Security Scanner
            </h2>
            <p className="text-xs sm:text-sm text-[#CAC4D0] leading-relaxed">
              Every package uploaded to AVANYX Store is automatically analyzed by our multi-layered security engine before receiving public release status.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="text-xs font-black text-[#D0BCFF] uppercase">Tier 1</div>
              <h3 className="font-bold text-sm text-white">Bytecode Decompilation</h3>
              <p className="text-xs text-[#CAC4D0] leading-relaxed">
                Extracts DEX bytecode and manifest declarations to identify unlisted background services, hidden receivers, or unauthorized permissions.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="text-xs font-black text-emerald-400 uppercase">Tier 2</div>
              <h3 className="font-bold text-sm text-white">Sandbox Execution</h3>
              <p className="text-xs text-[#CAC4D0] leading-relaxed">
                Runs the binary in isolated Android runtime sandboxes to capture outgoing socket connections, dynamic code loading, and ad-fraud attempts.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="text-xs font-black text-amber-400 uppercase">Tier 3</div>
              <h3 className="font-bold text-sm text-white">SHA-256 Hash Verification</h3>
              <p className="text-xs text-[#CAC4D0] leading-relaxed">
                Generates immutable cryptographic SHA-256 signatures for every release to prevent binary tampering and unauthorized modifications.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="text-xs font-black text-purple-400 uppercase">Tier 4</div>
              <h3 className="font-bold text-sm text-white">AI Permission Scanner</h3>
              <p className="text-xs text-[#CAC4D0] leading-relaxed">
                Gemini-powered evaluation checks requested Android permissions against app descriptions to flag suspicious access patterns.
              </p>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 5. DEVELOPER CONSOLE & PUBLISHING HUB */}
        {/* ───────────────────────────────────────────────────────────── */}
        <section id="dev-console" className="space-y-8 scroll-mt-24">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6750A4]/15 text-[#6750A4] dark:text-[#D0BCFF] text-xs font-black uppercase">
              <Terminal className="w-3.5 h-3.5" />
              <span>Developer Ecosystem</span>
            </div>
            <h2 className="text-3xl font-black text-[#1D1B20] dark:text-white">
              AVANYX Developer Console & App Publishing
            </h2>
            <p className="text-sm text-[#49454F] dark:text-[#CAC4D0] leading-relaxed">
              Publish Android Apps, manage release tracks, upload APK packages, and reach users through the official Software Developer Marketplace.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-white dark:bg-[#18191D] border border-black/5 dark:border-white/5 space-y-6 shadow-sm">
              <h3 className="text-xl font-extrabold text-[#1D1B20] dark:text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#6750A4] dark:text-[#D0BCFF]" />
                <span>Indie Android Developers & Software Publishers</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#49454F] dark:text-[#CAC4D0] leading-relaxed">
                The AVANYX Developer Console provides indie Android developers with complete autonomy. Register your developer profile, upload compiled APK packages, set release notes, and monitor live user ratings and download numbers.
              </p>
              <ul className="space-y-2.5 text-xs text-[#1D1B20] dark:text-[#E6E1E5]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Instant Developer Registration & API Key generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Upload APK files with automatic SHA-256 checksum verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Automated SEO metadata generation for search engine indexing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>0% commission on free applications and open-source binaries</span>
                </li>
              </ul>
              <button
                onClick={() => {
                  setCurrentTab('DEV_CONSOLE');
                  onNavigate('/developer-console');
                }}
                className="px-6 py-3 rounded-2xl bg-[#6750A4] hover:bg-[#523e85] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <span>Access Developer Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Student Publishing Overview */}
            <div id="student-publishing" className="p-8 rounded-3xl bg-gradient-to-br from-indigo-900/20 via-[#18191D] to-purple-900/20 border border-indigo-500/30 text-white space-y-6 shadow-sm scroll-mt-24">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-black uppercase">
                <GraduationCap className="w-4 h-4" />
                <span>Student Developer Platform</span>
              </div>
              <h3 className="text-xl font-extrabold text-white">Student App Publishing Program</h3>
              <p className="text-xs sm:text-sm text-[#CAC4D0] leading-relaxed">
                Students enrolled in high schools, colleges, or universities can apply for the Student Developer Program. Enjoy 100% free app hosting, zero developer registration fees, verified academic profile badges, and access to campus hackathons.
              </p>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="text-xs font-bold text-indigo-400">Student Account Guidelines & Safeguards</div>
                <p className="text-[11px] text-[#CAC4D0] leading-relaxed">
                  Student accounts feature standard rate limits (up to 10 active app releases per student account) to ensure fair infrastructure usage while adhering to AVANYX Content Policies and security standards.
                </p>
              </div>
              <button
                onClick={() => {
                  setCurrentTab('STUDENT_APPLY');
                  onNavigate('/student/apply');
                }}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <span>Apply for Student Publishing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 6. LATEST & TRENDING APPS CATALOG PREVIEW */}
        {/* ───────────────────────────────────────────────────────────── */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-black uppercase">
                <Flame className="w-3.5 h-3.5" />
                <span>Live Marketplace Preview</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1D1B20] dark:text-white">
                Latest & Trending Applications
              </h2>
              <p className="text-xs sm:text-sm text-[#49454F] dark:text-[#CAC4D0]">
                Explore newly published Android apps, AI tools, and top-rated games on AVANYX Store.
              </p>
            </div>

            <button
              onClick={() => {
                setCurrentTab('HOME');
                onNavigate('/store');
              }}
              className="inline-flex items-center gap-2 text-xs font-black text-[#6750A4] dark:text-[#D0BCFF] hover:underline"
            >
              <span>View Full App Store</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestAppsPreview.map((app) => (
              <AppCard key={`latest-${app.id}`} app={app} />
            ))}
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 7. APP CATEGORIES DIRECTORY */}
        {/* ───────────────────────────────────────────────────────────── */}
        <section id="categories" className="space-y-6 scroll-mt-24">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-[#1D1B20] dark:text-white">
              Browse Software Categories
            </h2>
            <p className="text-xs sm:text-sm text-[#49454F] dark:text-[#CAC4D0]">
              Find applications optimized for your workflow or mobile gaming preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  setCurrentTab('HOME');
                  onNavigate('/store');
                }}
                className="p-5 rounded-2xl bg-white dark:bg-[#18191D] border border-black/5 dark:border-white/5 hover:border-[#6750A4]/40 cursor-pointer transition-all group shadow-sm flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="font-extrabold text-sm text-[#1D1B20] dark:text-white group-hover:text-[#6750A4] dark:group-hover:text-[#D0BCFF]">
                    {cat.name}
                  </div>
                  <div className="text-xs text-[#49454F] dark:text-[#CAC4D0]">{cat.desc}</div>
                </div>
                <div className="text-xs font-bold text-[#6750A4] dark:text-[#D0BCFF] shrink-0 ml-3">
                  {cat.count}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 8. ECOSYSTEM ROADMAP */}
        {/* ───────────────────────────────────────────────────────────── */}
        <section id="roadmap" className="space-y-8 scroll-mt-24">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 text-xs font-black uppercase">
              <Clock className="w-3.5 h-3.5" />
              <span>Future Outlook</span>
            </div>
            <h2 className="text-3xl font-black text-[#1D1B20] dark:text-white">
              AVANYX Store Development Roadmap (2026 - 2027)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#18191D] border border-black/5 dark:border-white/5 space-y-3">
              <div className="text-xs font-black text-[#6750A4] dark:text-[#D0BCFF] uppercase">Q3 - Q4 2026</div>
              <h3 className="font-bold text-base text-[#1D1B20] dark:text-white">Global Edge Mirror Expansion</h3>
              <p className="text-xs text-[#49454F] dark:text-[#CAC4D0] leading-relaxed">
                Deploying 50+ localized CDN edge mirrors across Asia, Europe, and Americas for sub-20ms latency on large APK package downloads.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#18191D] border border-black/5 dark:border-white/5 space-y-3">
              <div className="text-xs font-black text-emerald-500 uppercase">Q1 2027</div>
              <h3 className="font-bold text-base text-[#1D1B20] dark:text-white">Automated AI Code Auditor v2</h3>
              <p className="text-xs text-[#49454F] dark:text-[#CAC4D0] leading-relaxed">
                Upgrading CyberShield AI scanning engine with automated zero-day vulnerability detection and automated obfuscation parsing.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#18191D] border border-black/5 dark:border-white/5 space-y-3">
              <div className="text-xs font-black text-amber-500 uppercase">Q2 2027</div>
              <h3 className="font-bold text-base text-[#1D1B20] dark:text-white">Native Desktop SDKs</h3>
              <p className="text-xs text-[#49454F] dark:text-[#CAC4D0] leading-relaxed">
                Releasing official C++, Rust, and Flutter SDKs for native Windows, macOS, and Linux software distribution with auto-update hooks.
              </p>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 9. SECURITY, PRIVACY & TERMS POLICIES */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div id="security-privacy" className="grid grid-cols-1 lg:grid-cols-2 gap-8 scroll-mt-24">
          <div className="rounded-3xl bg-white dark:bg-[#18191D] border border-black/5 dark:border-white/5 p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-[#1D1B20] dark:text-[#E6E1E5]">Security & Privacy Policy</h3>
                <p className="text-xs text-[#49454F] dark:text-[#CAC4D0]">Zero behavioral tracking • GDPR & CCPA compliant</p>
              </div>
            </div>

            <div className="text-xs text-[#49454F] dark:text-[#CAC4D0] space-y-2.5 leading-relaxed">
              <p>
                AVANYX Store does not collect personal device identifiers, track physical locations, or share behavioral analytics with advertising networks.
              </p>
              <p>
                All APK file transfers are encrypted over TLS 1.3 and served directly without injecting telemetry or advertising layers into app downloads.
              </p>
              <div className="p-3 rounded-2xl bg-[#F8F9FA] dark:bg-[#25262B] border border-black/5 dark:border-white/5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                ✓ No Telemetry &bull; ✓ Cryptographic Signatures &bull; ✓ Complete Data Sovereignty
              </div>
            </div>
          </div>

          <div id="terms" className="rounded-3xl bg-white dark:bg-[#18191D] border border-black/5 dark:border-white/5 p-6 sm:p-8 space-y-4 shadow-sm scroll-mt-24">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#6750A4]/10 text-[#6750A4] dark:text-[#D0BCFF]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-[#1D1B20] dark:text-[#E6E1E5]">Terms & Conditions</h3>
                <p className="text-xs text-[#49454F] dark:text-[#CAC4D0]">Publisher guidelines and distribution rights</p>
              </div>
            </div>

            <div className="text-xs text-[#49454F] dark:text-[#CAC4D0] space-y-2.5 leading-relaxed">
              <p>
                Publishers agree to distribute software that is free of malicious payload code, spyware, or deceptive paywalls.
              </p>
              <p>
                AVANYX Store reserves the right to immediately quarantine any software package that fails post-release security re-audits or violates copyright laws.
              </p>
              <div className="p-3 rounded-2xl bg-[#F8F9FA] dark:bg-[#25262B] border border-black/5 dark:border-white/5 text-[11px] font-semibold text-[#6750A4] dark:text-[#D0BCFF]">
                ✓ Fair Creator Terms &bull; ✓ 0% Revenue Fee &bull; ✓ Takedown Protection
              </div>
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 10. 25 COMPREHENSIVE SEO & AI SEARCH FAQS */}
        {/* ───────────────────────────────────────────────────────────── */}
        <section id="faqs" className="rounded-3xl bg-white dark:bg-[#18191D] border border-black/5 dark:border-white/5 p-6 sm:p-10 space-y-6 shadow-sm scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2.5">
                <HelpCircle className="w-6 h-6 text-[#6750A4] dark:text-[#D0BCFF]" />
                <span>Frequently Asked Questions & Knowledge Base</span>
              </h3>
              <p className="text-xs text-[#49454F] dark:text-[#CAC4D0] mt-1">
                Everything you need to know about AVANYX Store, APK security, developer publishing, and student accounts.
              </p>
            </div>

            {/* Quick Search Input inside FAQs */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#49454F] dark:text-[#CAC4D0]" />
              <input
                type="text"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                placeholder="Search FAQs..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#F3EDF7] dark:bg-[#25262B] text-xs text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            {filteredFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#F8F9FA] dark:bg-[#25262B] border border-black/5 dark:border-white/5 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-5 py-4 text-left font-extrabold text-xs sm:text-sm text-[#1D1B20] dark:text-[#E6E1E5] flex items-center justify-between gap-4"
                >
                  <span className="leading-snug">{faq.q}</span>
                  <span className="text-sm font-black text-[#6750A4] dark:text-[#D0BCFF] shrink-0">
                    {activeFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-4 pt-1 text-xs text-[#49454F] dark:text-[#CAC4D0] leading-relaxed border-t border-black/5 dark:border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 11. INTERACTIVE CONTACT FORM */}
        {/* ───────────────────────────────────────────────────────────── */}
        <section id="contact" className="rounded-3xl bg-white dark:bg-[#18191D] border border-black/5 dark:border-white/5 p-6 sm:p-10 space-y-6 shadow-sm scroll-mt-24">
          <div className="max-w-2xl space-y-1">
            <h3 className="font-extrabold text-2xl text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2.5">
              <Mail className="w-6 h-6 text-[#6750A4] dark:text-[#D0BCFF]" />
              <span>Contact AVANYX Developer Relations & Support</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#49454F] dark:text-[#CAC4D0]">
              Have questions regarding developer registration, student publishing status, or security reports? Reach out to our engineering team.
            </p>
          </div>

          {contactSent ? (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Thank you! Your ticket has been routed to our team at support@avanyx.io. We will respond within 24 hours.</span>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4 max-w-2xl">
              {contactError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{contactError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5] mb-1.5">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] border border-transparent focus:border-[#6750A4] text-xs text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] border border-transparent focus:border-[#6750A4] text-xs text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5] mb-1.5">
                  Inquiry Topic
                </label>
                <select
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] border border-transparent focus:border-[#6750A4] text-xs text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="AVANYX Developer Console">AVANYX Developer Console</option>
                  <option value="Student Publishing Support">Student Publishing Support</option>
                  <option value="Security Report">Security & Vulnerability Audit Report</option>
                  <option value="DMCA Copyright">DMCA & Content Takedown</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5] mb-1.5">
                  Message Details
                </label>
                <textarea
                  rows={4}
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="How can we assist you with AVANYX Store today?"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] border border-transparent focus:border-[#6750A4] text-xs text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-[#6750A4] hover:bg-[#523e85] text-white text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Ticket</span>
              </button>
            </form>
          )}
        </section>
      </main>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 12. FOOTER */}
      {/* ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-black/5 dark:border-white/5 bg-white dark:bg-[#18191D] py-12 px-4 sm:px-8 mt-20">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <AvanyxLogo size={32} showText={false} />
                <span className="font-extrabold text-base text-[#1D1B20] dark:text-[#E6E1E5]">
                  AVANYX Store
                </span>
              </div>
              <p className="text-xs text-[#49454F] dark:text-[#CAC4D0] max-w-sm leading-relaxed">
                The official secure Android app marketplace, developer console, and student publishing platform.
              </p>
              <div className="text-[11px] text-[#49454F] dark:text-[#CAC4D0] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>All Systems Operational • 99.99% Uptime</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-[#1D1B20] dark:text-[#E6E1E5] uppercase tracking-wider">
                Marketplace
              </h4>
              <ul className="text-xs text-[#49454F] dark:text-[#CAC4D0] space-y-2">
                <li><button onClick={() => { setCurrentTab('HOME'); onNavigate('/store'); }} className="hover:underline text-left">App Store Home</button></li>
                <li><a href="#about" className="hover:underline">About AVANYX</a></li>
                <li><a href="#categories" className="hover:underline">Categories</a></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-[#1D1B20] dark:text-[#E6E1E5] uppercase tracking-wider">
                Developers
              </h4>
              <ul className="text-xs text-[#49454F] dark:text-[#CAC4D0] space-y-2">
                <li><a href="#dev-console" className="hover:underline">Developer Console</a></li>
                <li><a href="#student-publishing" className="hover:underline">Student Publishing</a></li>
                <li><a href="#ai-pipeline" className="hover:underline">CyberShield AI</a></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-[#1D1B20] dark:text-[#E6E1E5] uppercase tracking-wider">
                Legal & Security
              </h4>
              <ul className="text-xs text-[#49454F] dark:text-[#CAC4D0] space-y-2">
                <li><a href="#security-privacy" className="hover:underline">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:underline">Terms & Conditions</a></li>
                <li><a href="#faqs" className="hover:underline">Knowledge Base</a></li>
                <li><a href="#contact" className="hover:underline">Contact Support</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#49454F] dark:text-[#CAC4D0]">
            <span>© 2026 AVANYX Store Ecosystem Inc. All rights reserved.</span>
            <span>Zero Telemetry Guarantee • Cryptographically Signed Builds</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IntroWelcomePage;
