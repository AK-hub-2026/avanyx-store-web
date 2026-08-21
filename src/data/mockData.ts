import { StoreApp, AppNotification, User } from '../types';

export const GUEST_USER: User = {
  id: '',
  name: 'Guest User',
  email: '',
  role: 'USER',
  realRole: 'USER',
  activeViewRole: 'USER',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
  verifiedDeveloper: false,
  developerStatus: 'NONE',
  studentStatus: 'NONE',
  adminStatus: 'NONE',
  verificationBadge: 'NONE',
  emailVerified: false,
  status: 'ACTIVE'
};

export const INITIAL_USER: User = GUEST_USER;

export const INITIAL_APPS: StoreApp[] = [
  {
    id: 'app_cyber_shield',
    name: 'Avanyx CyberShield Pro',
    packageName: 'com.avanyx.security.cybershield',
    developer: 'Avanyx Security Lab',
    category: 'SECURITY',
    rating: 4.9,
    reviewCount: 48200,
    downloads: '1M+',
    downloadCount: 1250000,
    iconUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=150',
    bannerUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
    description: 'Next-generation mobile endpoint security. Real-time threat detection, AI malware scanning, encrypted vault, and Wi-Fi protection.',
    screenshots: [
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400'
    ],
    version: '3.4.1',
    apkSize: '24.8 MB',
    downloadUrl: 'https://github.com/avanyx-org/cybershield/releases/download/v3.4.1/cybershield-v3.4.1.apk',
    isInstalled: true,
    isFeatured: true,
    isTrending: true,
    price: 0,
    tags: ['Security', 'Antivirus', 'VPN', 'Privacy'],
    releaseDate: '2026-01-15',
    securityScore: 100,
    sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    id: 'app_nova_launcher',
    name: 'Nova Workspace OS',
    packageName: 'com.avanyx.nova.workspace',
    developer: 'Aetheria Systems',
    category: 'PRODUCTIVITY',
    rating: 4.8,
    reviewCount: 32100,
    downloads: '500K+',
    downloadCount: 520000,
    iconUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150',
    bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    description: 'Transform your device into a cloud desktop workstation with seamless multi-window multitasking and instant cloud document sync.',
    screenshots: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400'
    ],
    version: '2.1.0',
    apkSize: '42.1 MB',
    downloadUrl: 'https://github.com/aetheria-sys/nova-workspace/releases/download/v2.1.0/nova-workspace-v2.1.0.apk',
    isInstalled: false,
    isFeatured: true,
    isTrending: true,
    price: 0,
    tags: ['Desktop', 'Productivity', 'Multitasking'],
    releaseDate: '2026-02-01',
    securityScore: 99,
    sha256Checksum: '8f4a132e4d0b11f92e59a4c118742b0c3d9a1f2b3c4d5e6f7a8b9c0d1e2f3a4b'
  },
  {
    id: 'app_quantum_racer',
    name: 'Quantum Horizon 2099',
    packageName: 'com.avanyx.games.quantumhorizon',
    developer: 'Vortex Interactive',
    category: 'GAMES',
    rating: 4.9,
    reviewCount: 95400,
    downloads: '2M+',
    downloadCount: 2400000,
    iconUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=150',
    bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800',
    description: 'High-octane cyberpunk anti-gravity racer powered by Vulkan ray-tracing graphics and dynamic multiplayer leagues.',
    screenshots: [
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=400'
    ],
    version: '1.8.4',
    apkSize: '1480 MB',
    downloadUrl: 'https://github.com/vortex-games/quantum-horizon/releases/download/v1.8.4/quantum-horizon-v1.8.4.apk',
    isInstalled: false,
    isFeatured: true,
    isTrending: true,
    price: 0,
    tags: ['Racing', 'Cyberpunk', 'Action', '3D Graphics'],
    releaseDate: '2025-11-20',
    securityScore: 98,
    sha256Checksum: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b'
  },
  {
    id: 'app_gemini_companion',
    name: 'OmniAI Assistant Pro',
    packageName: 'com.avanyx.ai.omni',
    developer: 'DeepMind Labs',
    category: 'AI_AGENTS',
    rating: 4.9,
    reviewCount: 112000,
    downloads: '5M+',
    downloadCount: 5100000,
    iconUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=150',
    bannerUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=800',
    description: 'Real-time multimodal AI assistant with voice synthesis, document analysis, automated workflow execution, and offline neural mode.',
    screenshots: [
      'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=400'
    ],
    version: '4.0.2',
    apkSize: '68.5 MB',
    downloadUrl: 'https://github.com/deepmind-labs/omniai-assistant/releases/download/v4.0.2/omniai-assistant-v4.0.2.apk',
    isInstalled: true,
    isFeatured: true,
    isTrending: true,
    price: 0,
    tags: ['AI', 'Voice', 'Assistant', 'Automation'],
    releaseDate: '2026-02-10',
    securityScore: 100,
    sha256Checksum: '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e'
  },
  {
    id: 'app_sound_wave',
    name: 'SoundWave Hi-Res Studio',
    packageName: 'com.avanyx.media.soundwave',
    developer: 'Acoustic Audio Labs',
    category: 'MEDIA',
    rating: 4.7,
    reviewCount: 18400,
    downloads: '250K+',
    downloadCount: 260000,
    iconUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=150',
    bannerUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800',
    description: 'Lossless FLAC audio playback, 32-band parametric equalizer, spatial audio rendering, and cloud music streaming integration.',
    screenshots: [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400'
    ],
    version: '1.5.0',
    apkSize: '18.3 MB',
    downloadUrl: 'https://github.com/acoustic-audio/soundwave-studio/releases/download/v1.5.0/soundwave-v1.5.0.apk',
    isInstalled: false,
    isFeatured: false,
    isTrending: false,
    price: 0,
    tags: ['Audio', 'Music', 'Equalizer', 'Hi-Res'],
    releaseDate: '2026-01-08',
    securityScore: 97,
    sha256Checksum: '2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c'
  },
  {
    id: 'app_connect_pulse',
    name: 'Pulse Messenger Encrypted',
    packageName: 'com.avanyx.social.pulse',
    developer: 'Cipher Network',
    category: 'SOCIAL',
    rating: 4.8,
    reviewCount: 64000,
    downloads: '1M+',
    downloadCount: 1100000,
    iconUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=150',
    bannerUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=800',
    description: 'Zero-knowledge end-to-end encrypted messaging, group video calls, self-destructing channels, and decentralized file sharing.',
    screenshots: [
      'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=400'
    ],
    version: '5.2.1',
    apkSize: '35.4 MB',
    downloadUrl: 'https://github.com/cipher-network/pulse-messenger/releases/download/v5.2.1/pulse-v5.2.1.apk',
    isInstalled: false,
    isFeatured: false,
    isTrending: true,
    price: 0,
    tags: ['Social', 'Encryption', 'Messaging', 'Privacy'],
    releaseDate: '2026-02-05',
    securityScore: 100,
    sha256Checksum: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_sec_01',
    title: 'Security Scan Completed',
    message: 'Avanyx Security engine scanned 6 installed apps. No malware or suspicious permissions detected.',
    timestamp: new Date().toISOString(),
    isRead: false,
    type: 'SECURITY'
  },
  {
    id: 'notif_promo_01',
    title: 'Spotlight: OmniAI Assistant 4.0',
    message: 'Discover the latest release of OmniAI Assistant with real-time offline neural models.',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    isRead: false,
    type: 'PROMOTION',
    deepLinkAppId: 'app_gemini_companion'
  },
  {
    id: 'notif_sys_01',
    title: 'AVANYX Store Updated',
    message: 'Store engine updated to v2.4 with faster APK verification and instant downloading.',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    isRead: true,
    type: 'SYSTEM'
  }
];
