export type AppCategory =
  | 'GAMES'
  | 'PRODUCTIVITY'
  | 'TOOLS'
  | 'SECURITY'
  | 'SOCIAL'
  | 'MEDIA'
  | 'AI_AGENTS';

export interface StoreApp {
  id: string;
  name: string;
  packageName: string;
  developer: string;
  developerUid?: string;
  developerProfileId?: string;
  category: AppCategory;
  categoryId?: string;
  rating: number;
  reviewCount: number;
  downloads: string;
  downloadCount: number;
  iconUrl: string;
  iconText?: string;
  iconBgColorHex?: string;
  bannerUrl: string;
  description: string;
  fullDescription?: string;
  features?: string[];
  screenshots: string[];
  version: string;
  apkSize: string;
  sizeMb?: number;
  downloadUrl?: string;
  isInstalled: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  isGame?: boolean;
  price: number;
  tags: string[];
  releaseDate: string;
  securityScore: number; // e.g. 98% clean
  sha256Checksum: string;
  checksumSha256?: string;
  status?: 'PUBLISHED' | 'DRAFT' | 'PENDING' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'BANNED' | 'ARCHIVED';
  videoUrl?: string;
  createdAt?: string | any;
  updatedAt?: string | any;
  submittedAt?: string | any;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  iconName?: string;
  description?: string;
  displayOrder?: number;
}

export interface DeveloperProfile {
  id: string;
  ownerUid?: string;
  uid?: string;
  developerUid?: string;
  publicDeveloperId?: string;
  developerSlug?: string;
  displayName: string;
  organizationName?: string;
  shortDescription?: string;
  bio?: string;
  logoUrl?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  verified: boolean;
  verificationBadge?: VerificationBadge;
  publishedAppCount?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  developerStatus?: DeveloperStatus;
  officialWebsite?: string;
  websiteUrl?: string;
  githubUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  whatsappUrl?: string;
  otherPublicLinks?: Array<{ label: string; url: string }>;
  country?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppReview {
  id: string;
  appId: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpfulCount?: number;
}

export interface AppRating {
  id: string;
  appId: string;
  userId: string;
  rating: number;
  updatedAt: string;
}

export interface FeaturedBanner {
  id: string;
  title: string;
  subtitle?: string;
  bannerImageUrl: string;
  targetAppId?: string;
  targetUrl?: string;
  isActive: boolean;
  order?: number;
}

export interface AppVersionDoc {
  id: string;
  appId: string;
  version: string;
  versionCode: number;
  downloadUrl: string;
  sizeMb: number;
  checksumSha256: string;
  releaseNotes: string;
  releaseDate: string;
  isMinimumSupported?: boolean;
}

export interface WishlistItem {
  id: string;
  userId: string;
  appId: string;
  addedAt: string;
}

export interface StoreSettings {
  id: string;
  maintenanceMode: boolean;
  featuredAppIds: string[];
  trendingAppIds: string[];
  bannerNotice?: string;
  minSupportedAppVersion?: string;
}

export type NotificationType = 'SECURITY' | 'PROMOTION' | 'SYSTEM' | 'UPDATE';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: NotificationType;
  deepLinkAppId?: string;
  userId?: string;
}

export type DownloadStatus = 'DOWNLOADING' | 'PAUSED' | 'VERIFYING' | 'INSTALLED' | 'FAILED';

export interface DownloadTask {
  appId: string;
  appName: string;
  iconUrl: string;
  progress: number; // 0 to 100
  speed: string; // e.g., '12.4 MB/s'
  status: DownloadStatus;
  totalSize: string;
  downloadedBytes: number;
  totalBytes: number;
}

export type UserRole = 'USER' | 'DEVELOPER' | 'VERIFIED_DEVELOPER' | 'STUDENT' | 'VERIFIED_STUDENT' | 'ADMIN';
export type VerificationStatus = 'PENDING_REVIEW' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'REQUEST_INFO' | 'SUSPENDED';
export type DeveloperStatus = 'NONE' | 'PENDING' | 'PENDING_REVIEW' | 'UNDER_REVIEW' | 'VERIFIED' | 'APPROVED' | 'REJECTED' | 'REQUEST_INFO' | 'SUSPENDED';
export type StudentStatus = 'NONE' | 'PENDING' | 'PENDING_REVIEW' | 'UNDER_REVIEW' | 'VERIFIED' | 'APPROVED' | 'REJECTED' | 'REQUEST_INFO';
export type AdminStatus = 'NONE' | 'ACTIVE' | 'SUSPENDED';
export type VerificationBadge = 'NONE' | 'VERIFIED' | 'VERIFIED_DEVELOPER' | 'VERIFIED_STUDENT' | 'ADMIN' | 'OFFICIAL';

export interface DeveloperDetails {
  caseId?: string;
  developerName?: string;
  organizationName?: string;
  country?: string;
  contactEmail?: string;
  websiteUrl?: string;
  githubUrl?: string;
  description?: string;
  documentUrls?: string[];
  requestedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewedByAdminUid?: string;
  notes?: string;
}

export interface StudentDetails {
  caseId?: string;
  institutionName?: string;
  institution?: string;
  studentIdNumber?: string;
  graduationYear?: string;
  documentUrl?: string;
  documentUrls?: string[];
  country?: string;
  contactEmail?: string;
  requestedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewedByAdminUid?: string;
  notes?: string;
}

export interface DeveloperApplication {
  id: string;
  caseId?: string;
  applicationId: string;
  applicantUid: string;
  applicantEmail: string;
  displayName: string;
  requestedRole: UserRole;
  submittedAt: string;
  updatedAt: string;
  status: VerificationStatus;
  developerName: string;
  description: string;
  country: string;
  contactEmail: string;
  websiteUrl?: string;
  githubUrl?: string;
  organizationName?: string;
  documentUrls?: string[];
  notes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewedByAdminUid?: string;
  reviewerNotes?: string;
  moderationHistory?: Array<{
    action: string;
    adminUid: string;
    timestamp: string;
    note?: string;
    previousStatus?: string;
    newStatus?: string;
  }>;
  // Legacy aliases
  userId?: string;
  email?: string;
  createdAt?: string;
}

export interface StudentVerificationRequest {
  id: string;
  caseId?: string;
  requestId: string;
  applicantUid: string;
  applicantEmail: string;
  displayName: string;
  requestedRole: UserRole;
  submittedAt: string;
  updatedAt: string;
  status: VerificationStatus;
  studentName: string;
  institution: string;
  studentIdNumber?: string;
  graduationYear?: string;
  documentUrl?: string;
  documentUrls?: string[];
  contactEmail?: string;
  country?: string;
  notes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewedByAdminUid?: string;
  reviewerNotes?: string;
  moderationHistory?: Array<{
    action: string;
    adminUid: string;
    timestamp: string;
    note?: string;
    previousStatus?: string;
    newStatus?: string;
  }>;
  // Legacy aliases
  userId?: string;
  email?: string;
  createdAt?: string;
}

export interface DeveloperRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  organizationName: string;
  websiteUrl: string;
  githubUrl: string;
  status: VerificationStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerNotes?: string;
}

export interface StudentRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  institutionName: string;
  studentIdNumber: string;
  graduationYear: string;
  status: VerificationStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerNotes?: string;
}

export interface VerificationRequest {
  id: string;
  caseId?: string;
  applicationId: string;
  requestId?: string;
  type: 'DEVELOPER' | 'STUDENT';
  applicantUid: string;
  applicantEmail: string;
  displayName: string;
  requestedRole: UserRole;
  status: VerificationStatus;
  submittedAt: string;
  updatedAt?: string;
  developerDetails?: DeveloperDetails;
  studentDetails?: StudentDetails;
  documentUrls?: string[];
  notes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewedByAdminUid?: string;
  reviewerNotes?: string;
  moderationHistory?: Array<{
    action: string;
    adminUid: string;
    timestamp: string;
    note?: string;
    previousStatus?: string;
    newStatus?: string;
  }>;
  // Legacy compatibility fields
  userId: string;
  userEmail: string;
  userName: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  adminUid?: string;
  adminEmail?: string;
  performedBy?: string;
  action: string;
  targetId?: string;
  targetUserId?: string;
  details: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  realRole: UserRole; // Authoritative role verified by backend / Firestore
  activeViewRole?: UserRole; // Role view mode for Admin view-switching
  avatarUrl: string;
  bio?: string;
  websiteUrl?: string;
  country?: string;
  verifiedDeveloper: boolean;
  developerStatus: DeveloperStatus;
  studentStatus: StudentStatus;
  adminStatus: AdminStatus;
  verificationBadge: VerificationBadge;
  developerDetails?: DeveloperDetails;
  studentDetails?: StudentDetails;
  developerKey?: string;
  emailVerified?: boolean;
  authProvider?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type NavigationTab =
  | 'HOME'
  | 'GAMES'
  | 'APPS'
  | 'DOWNLOADS'
  | 'SECURITY_ALERTS'
  | 'DEV_CONSOLE'
  | 'ADMIN_CONSOLE'
  | 'GMAIL'
  | 'SETTINGS'
  | 'ACCOUNT_SETTINGS'
  | 'NOTIFICATIONS'
  | 'PROFILE'
  | 'APP_DETAILS'
  | 'DEVELOPER_PROFILE';

