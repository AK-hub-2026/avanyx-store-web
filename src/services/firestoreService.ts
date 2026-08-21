import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  setDoc,
  addDoc,
  deleteDoc,
  serverTimestamp
} from '../firebase';
import {
  StoreApp,
  CategoryItem,
  DeveloperProfile,
  AppReview,
  AppRating,
  FeaturedBanner,
  AppVersionDoc,
  WishlistItem,
  StoreSettings,
  AppNotification,
  User,
  AppCategory,
  VerificationRequest,
  AuditLog
} from '../types';
import { INITIAL_APPS, INITIAL_NOTIFICATIONS } from '../data/mockData';

// Collection Constants
export const COLLECTIONS = {
  APPS: 'apps',
  CATEGORIES: 'categories',
  DEVELOPERS: 'developers',
  REVIEWS: 'reviews',
  RATINGS: 'ratings',
  WISHLIST: 'wishlist',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
  APP_VERSIONS: 'app_versions',
  FEATURED_BANNERS: 'featured_banners',
  USERS: 'users',
  DEVELOPER_APPLICATIONS: 'developer_applications',
  DEVELOPER_REQUESTS: 'developer_applications',
  STUDENT_VERIFICATION_REQUESTS: 'student_verification_requests',
  STUDENT_REQUESTS: 'student_verification_requests',
  VERIFICATION_REQUESTS: 'verification_requests',
  ADMINS: 'admins',
  AUDIT_LOGS: 'audit_logs',
  ADMIN_NOTIFICATIONS: 'admin_notifications'
} as const;

export const PRIMARY_ADMIN_EMAIL = 'alok8881864873@gmail.com';
export const PRIMARY_ADMIN_EMAILS = [
  'alok8881864873@gmail.com',
  'akshayakshay53122@gmail.com'
];

export function isPrimaryAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return PRIMARY_ADMIN_EMAILS.some((e) => e.toLowerCase() === clean);
}

/**
 * Maps raw Firestore application document data to the UI StoreApp model.
 */
export function mapFirestoreApp(docId: string, data: any): StoreApp {
  const sizeFormatted = data.sizeMb ? `${data.sizeMb} MB` : data.apkSize || '25.0 MB';
  
  return {
    id: docId,
    name: data.name || 'Untitled Application',
    packageName: data.packageName || `io.avanyx.app.${docId}`,
    developer: data.developer || 'Verified Publisher',
    developerUid: data.developerUid || '',
    category: (data.category as AppCategory) || (data.isGame ? 'GAMES' : 'TOOLS'),
    categoryId: data.categoryId || '',
    rating: typeof data.rating === 'number' ? data.rating : 4.8,
    reviewCount: typeof data.reviewCount === 'number' ? data.reviewCount : 0,
    downloads: data.downloads || (data.downloadCount ? `${data.downloadCount.toLocaleString()}+` : '100K+'),
    downloadCount: typeof data.downloadCount === 'number' ? data.downloadCount : 100000,
    iconUrl: data.iconUrl || `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80`,
    iconText: data.iconText || '',
    iconBgColorHex: data.iconBgColorHex || '#6750A4',
    bannerUrl: data.bannerUrl || `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80`,
    description: data.description || data.fullDescription || 'High-performance application verified for AVANYX Store.',
    fullDescription: data.fullDescription || data.description || '',
    features: Array.isArray(data.features) ? data.features : [],
    screenshots: Array.isArray(data.screenshots) && data.screenshots.length > 0
      ? data.screenshots
      : [
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80'
        ],
    version: data.version || '1.0.0',
    apkSize: sizeFormatted,
    sizeMb: typeof data.sizeMb === 'number' ? data.sizeMb : 25,
    downloadUrl: data.downloadUrl || '',
    isInstalled: !!data.isInstalled,
    isFeatured: !!data.isFeatured,
    isTrending: !!data.isTrending,
    isGame: !!data.isGame,
    price: typeof data.price === 'number' ? data.price : 0,
    tags: Array.isArray(data.tags) ? data.tags : ['Verified', 'Secure'],
    releaseDate: data.releaseDate || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString().split('T')[0] : '2026-08-14'),
    securityScore: typeof data.securityScore === 'number' ? data.securityScore : 99,
    sha256Checksum: data.checksumSha256 || data.sha256Checksum || 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
    checksumSha256: data.checksumSha256 || data.sha256Checksum || '',
    status: data.status || 'PUBLISHED'
  };
}

/**
 * 1. Fetch all PUBLISHED applications from Firestore.
 */
export async function fetchPublishedApps(): Promise<StoreApp[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.APPS),
      where('status', '==', 'PUBLISHED')
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((docSnap) => mapFirestoreApp(docSnap.id, docSnap.data()));
    }
    return INITIAL_APPS;
  } catch (error) {
    console.warn('[Firestore] Error fetching published apps, using fallback data:', error);
    return INITIAL_APPS;
  }
}

/**
 * Realtime listener for PUBLISHED applications.
 */
export function subscribeToPublishedApps(
  onData: (apps: StoreApp[]) => void,
  onError?: (error: Error) => void
): () => void {
  try {
    const q = query(
      collection(db, COLLECTIONS.APPS),
      where('status', '==', 'PUBLISHED')
    );
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const apps = snapshot.docs.map((d) => mapFirestoreApp(d.id, d.data()));
          onData(apps);
        } else {
          onData(INITIAL_APPS);
        }
      },
      (error) => {
        console.warn('[Firestore] Apps listener encountered notice, maintaining fallback state:', error);
        if (onError) onError(error);
        onData(INITIAL_APPS);
      }
    );
  } catch (err: any) {
    console.warn('[Firestore] Failed to initialize apps subscription:', err);
    onData(INITIAL_APPS);
    return () => {};
  }
}

/**
 * 2. Fetch categories from Firestore.
 */
export async function fetchCategories(): Promise<CategoryItem[]> {
  try {
    const q = query(collection(db, COLLECTIONS.CATEGORIES), orderBy('displayOrder', 'asc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CategoryItem));
    }
  } catch (error) {
    console.warn('[Firestore] Categories collection notice:', error);
  }
  return [];
}

/**
 * 3. Fetch Featured Banners from Firestore.
 */
export async function fetchFeaturedBanners(): Promise<FeaturedBanner[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.FEATURED_BANNERS),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FeaturedBanner));
    }
  } catch (error) {
    console.warn('[Firestore] Featured banners collection notice:', error);
  }
  return [];
}

/**
 * 4. Fetch App Reviews for a specific application.
 */
export async function fetchAppReviews(appId: string): Promise<AppReview[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.REVIEWS),
      where('appId', '==', appId),
      limit(50)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AppReview));
    }
  } catch (error) {
    console.warn('[Firestore] App reviews query notice:', error);
  }
  return [];
}

/**
 * 5. Fetch App Ratings for a specific application.
 */
export async function fetchAppRatings(appId: string): Promise<AppRating[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.RATINGS),
      where('appId', '==', appId)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AppRating));
    }
  } catch (error) {
    console.warn('[Firestore] App ratings query notice:', error);
  }
  return [];
}

/**
 * 6. Fetch App Versions history for a specific application.
 */
export async function fetchAppVersions(appId: string): Promise<AppVersionDoc[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.APP_VERSIONS),
      where('appId', '==', appId)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AppVersionDoc));
    }
  } catch (error) {
    console.warn('[Firestore] App versions query notice:', error);
  }
  return [];
}

/**
 * Generates an authoritative case tracking ID.
 */
export function generateCaseId(prefix: 'DEV' | 'STU' | 'APP'): string {
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let p1 = '';
  for (let i = 0; i < 6; i++) p1 += chars.charAt(Math.floor(Math.random() * chars.length));
  let p2 = '';
  for (let i = 0; i < 4; i++) p2 += chars.charAt(Math.floor(Math.random() * chars.length));
  return `${prefix}-${p1}-${p2}`;
}

/**
 * Sanitizes URLs to prevent unsafe schemes (e.g. javascript:, data:, vbscript:).
 */
export function sanitizeSafeUrl(rawUrl?: string): string | undefined {
  if (!rawUrl || typeof rawUrl !== 'string') return undefined;
  const trimmed = rawUrl.trim();
  if (!trimmed) return undefined;
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    return undefined;
  }
  if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

/**
 * 7. Fetch Developer Profile by developer ID, UID, or public slug.
 */
export async function fetchDeveloperProfile(developerIdOrUidOrSlug: string): Promise<DeveloperProfile | null> {
  return fetchPublicDeveloperProfile(developerIdOrUidOrSlug);
}

/**
 * Fetch Public Developer Profile (Safe, Public Non-Sensitive Fields only).
 * Resolves by document ID, publicDeveloperId, developerSlug, or displayName.
 */
export async function fetchPublicDeveloperProfile(developerIdOrUidOrName: string): Promise<DeveloperProfile | null> {
  if (!developerIdOrUidOrName) return null;
  const lookup = developerIdOrUidOrName.trim();
  
  try {
    // 1. Try direct document lookup in developers collection
    const docRef = doc(db, COLLECTIONS.DEVELOPERS, lookup);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const pubId = data.publicDeveloperId || `dev_${(data.displayName || docSnap.id).toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 16)}`;
      const slug = data.developerSlug || (data.displayName || docSnap.id).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return {
        id: docSnap.id,
        ownerUid: data.ownerUid || data.uid || data.developerUid || docSnap.id,
        uid: data.uid || docSnap.id,
        publicDeveloperId: pubId,
        developerSlug: slug,
        developerUid: data.developerUid || docSnap.id,
        displayName: data.displayName || data.developerName || lookup,
        organizationName: data.organizationName || '',
        shortDescription: data.shortDescription || data.bio || '',
        bio: data.bio || data.shortDescription || '',
        logoUrl: data.logoUrl || data.avatarUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(lookup)}`,
        avatarUrl: data.avatarUrl || data.logoUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(lookup)}`,
        bannerUrl: data.bannerUrl || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200',
        verified: !!(data.verified || data.verificationBadge === 'VERIFIED' || data.verificationBadge === 'VERIFIED_DEVELOPER'),
        verificationBadge: data.verificationBadge || (data.verified ? 'VERIFIED_DEVELOPER' : 'NONE'),
        publishedAppCount: data.publishedAppCount || 0,
        status: data.status || 'APPROVED',
        officialWebsite: sanitizeSafeUrl(data.officialWebsite || data.websiteUrl),
        websiteUrl: sanitizeSafeUrl(data.websiteUrl || data.officialWebsite),
        githubUrl: sanitizeSafeUrl(data.githubUrl),
        instagramUrl: sanitizeSafeUrl(data.instagramUrl),
        facebookUrl: sanitizeSafeUrl(data.facebookUrl),
        youtubeUrl: sanitizeSafeUrl(data.youtubeUrl),
        whatsappUrl: sanitizeSafeUrl(data.whatsappUrl),
        otherPublicLinks: Array.isArray(data.otherPublicLinks)
          ? data.otherPublicLinks.filter((l: any) => l && l.url && sanitizeSafeUrl(l.url)).map((l: any) => ({
              label: String(l.label || 'Link').trim(),
              url: sanitizeSafeUrl(l.url)!
            }))
          : [],
        country: data.country || '',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
      } as DeveloperProfile;
    }

    // 2. Try query by publicDeveloperId or developerSlug or displayName in developers collection
    const queries = [
      query(collection(db, COLLECTIONS.DEVELOPERS), where('developerSlug', '==', lookup.toLowerCase()), limit(1)),
      query(collection(db, COLLECTIONS.DEVELOPERS), where('publicDeveloperId', '==', lookup), limit(1)),
      query(collection(db, COLLECTIONS.DEVELOPERS), where('displayName', '==', lookup), limit(1))
    ];

    for (const q of queries) {
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        const data = d.data();
        const pubId = data.publicDeveloperId || `dev_${(data.displayName || d.id).toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 16)}`;
        const slug = data.developerSlug || (data.displayName || d.id).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return {
          id: d.id,
          ownerUid: data.ownerUid || data.uid || data.developerUid || d.id,
          uid: data.uid || d.id,
          publicDeveloperId: pubId,
          developerSlug: slug,
          developerUid: data.developerUid || d.id,
          displayName: data.displayName || lookup,
          organizationName: data.organizationName || '',
          shortDescription: data.shortDescription || data.bio || '',
          bio: data.bio || data.shortDescription || '',
          logoUrl: data.logoUrl || data.avatarUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(lookup)}`,
          avatarUrl: data.avatarUrl || data.logoUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(lookup)}`,
          bannerUrl: data.bannerUrl || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200',
          verified: !!(data.verified || data.verificationBadge === 'VERIFIED' || data.verificationBadge === 'VERIFIED_DEVELOPER'),
          verificationBadge: data.verificationBadge || (data.verified ? 'VERIFIED_DEVELOPER' : 'NONE'),
          publishedAppCount: data.publishedAppCount || 0,
          status: data.status || 'APPROVED',
          officialWebsite: sanitizeSafeUrl(data.officialWebsite || data.websiteUrl),
          websiteUrl: sanitizeSafeUrl(data.websiteUrl || data.officialWebsite),
          githubUrl: sanitizeSafeUrl(data.githubUrl),
          instagramUrl: sanitizeSafeUrl(data.instagramUrl),
          facebookUrl: sanitizeSafeUrl(data.facebookUrl),
          youtubeUrl: sanitizeSafeUrl(data.youtubeUrl),
          whatsappUrl: sanitizeSafeUrl(data.whatsappUrl),
          otherPublicLinks: Array.isArray(data.otherPublicLinks)
            ? data.otherPublicLinks.filter((l: any) => l && l.url && sanitizeSafeUrl(l.url)).map((l: any) => ({
                label: String(l.label || 'Link').trim(),
                url: sanitizeSafeUrl(l.url)!
              }))
            : [],
          country: data.country || '',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
        } as DeveloperProfile;
      }
    }
  } catch (error) {
    console.warn('[Firestore] Developer profile query notice:', error);
  }

  // 3. Fallback: Dynamic profile creation for demo apps & developers
  const pubFallbackId = `dev_${lookup.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 16)}`;
  const slugFallback = lookup.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return {
    id: lookup,
    ownerUid: lookup,
    uid: lookup,
    publicDeveloperId: pubFallbackId,
    developerSlug: slugFallback,
    developerUid: lookup,
    displayName: lookup,
    organizationName: lookup.includes('Lab') || lookup.includes('Systems') || lookup.includes('Interactive') ? lookup : 'Verified Publisher',
    shortDescription: `Verified software studio and creator of high-performance Android experiences on AVANYX Store.`,
    bio: `Verified software studio and creator of high-performance Android experiences on AVANYX Store.`,
    officialWebsite: 'https://avanyx.store',
    websiteUrl: 'https://avanyx.store',
    githubUrl: 'https://github.com/avanyx-org',
    country: 'Global',
    logoUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(lookup)}`,
    avatarUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(lookup)}`,
    bannerUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200',
    verified: true,
    verificationBadge: 'VERIFIED_DEVELOPER',
    publishedAppCount: 1,
    status: 'APPROVED',
    createdAt: new Date().toISOString()
  };
}

/**
 * Save / Update Public Developer Profile into /developers/{uid}.
 * Enforces ownership: only authenticated owner or root admin can modify their public profile.
 */
export async function savePublicDeveloperProfile(
  developerUid: string,
  profileData: Partial<DeveloperProfile>
): Promise<void> {
  if (!developerUid) throw new Error('Developer UID is required.');
  const devDocRef = doc(db, COLLECTIONS.DEVELOPERS, developerUid);
  
  const devName = (profileData.displayName || '').trim();
  const slug = devName
    ? devName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    : `dev-${developerUid.substring(0, 8)}`;
  const pubId = profileData.publicDeveloperId || `dev_${slug.replace(/-/g, '_').substring(0, 24)}`;

  const updates: any = {
    ownerUid: developerUid,
    uid: developerUid,
    developerUid: developerUid,
    publicDeveloperId: pubId,
    developerSlug: slug,
    updatedAt: serverTimestamp()
  };

  if (profileData.displayName) updates.displayName = profileData.displayName.trim();
  if (profileData.organizationName !== undefined) updates.organizationName = profileData.organizationName.trim();
  if (profileData.shortDescription !== undefined) updates.shortDescription = profileData.shortDescription.trim();
  if (profileData.bio !== undefined) updates.bio = profileData.bio.trim();
  
  // Safe URL fields (All optional)
  if (profileData.officialWebsite !== undefined || profileData.websiteUrl !== undefined) {
    const cleanWeb = sanitizeSafeUrl(profileData.officialWebsite || profileData.websiteUrl);
    updates.officialWebsite = cleanWeb || '';
    updates.websiteUrl = cleanWeb || '';
  }
  if (profileData.githubUrl !== undefined) {
    updates.githubUrl = sanitizeSafeUrl(profileData.githubUrl) || '';
  }
  if (profileData.instagramUrl !== undefined) {
    updates.instagramUrl = sanitizeSafeUrl(profileData.instagramUrl) || '';
  }
  if (profileData.facebookUrl !== undefined) {
    updates.facebookUrl = sanitizeSafeUrl(profileData.facebookUrl) || '';
  }
  if (profileData.youtubeUrl !== undefined) {
    updates.youtubeUrl = sanitizeSafeUrl(profileData.youtubeUrl) || '';
  }
  if (profileData.whatsappUrl !== undefined) {
    updates.whatsappUrl = sanitizeSafeUrl(profileData.whatsappUrl) || '';
  }
  if (profileData.otherPublicLinks !== undefined) {
    updates.otherPublicLinks = (profileData.otherPublicLinks || [])
      .filter((l) => l && l.url && sanitizeSafeUrl(l.url))
      .map((l) => ({
        label: String(l.label || 'Link').trim().substring(0, 32),
        url: sanitizeSafeUrl(l.url)!
      }));
  }

  if (profileData.country !== undefined) updates.country = profileData.country.trim();
  if (profileData.logoUrl !== undefined || profileData.avatarUrl !== undefined) {
    const cleanImg = sanitizeSafeUrl(profileData.logoUrl || profileData.avatarUrl);
    updates.logoUrl = cleanImg || '';
    updates.avatarUrl = cleanImg || '';
  }
  if (profileData.bannerUrl !== undefined) {
    updates.bannerUrl = sanitizeSafeUrl(profileData.bannerUrl) || '';
  }

  await setDoc(devDocRef, updates, { merge: true });
}

/**
 * Fetch all published apps by a specific developer name or UID.
 * Enforces that only published/approved apps are returned to public store visitors.
 */
export async function fetchAppsByDeveloper(developerUidOrName: string): Promise<StoreApp[]> {
  if (!developerUidOrName) return [];
  const lookup = developerUidOrName.trim().toLowerCase();

  try {
    // 1. Try UID query
    const qUid = query(
      collection(db, COLLECTIONS.APPS),
      where('developerUid', '==', developerUidOrName.trim())
    );
    const snapUid = await getDocs(qUid);
    if (!snapUid.empty) {
      return snapUid.docs
        .map((d) => mapFirestoreApp(d.id, d.data()))
        .filter((app) => app.status === 'PUBLISHED' || app.status === 'APPROVED' || !app.status);
    }

    // 2. Try developer name query
    const qName = query(
      collection(db, COLLECTIONS.APPS),
      where('developer', '==', developerUidOrName.trim())
    );
    const snapName = await getDocs(qName);
    if (!snapName.empty) {
      return snapName.docs
        .map((d) => mapFirestoreApp(d.id, d.data()))
        .filter((app) => app.status === 'PUBLISHED' || app.status === 'APPROVED' || !app.status);
    }
  } catch (e) {
    console.warn('[Firestore] Query apps by developer notice:', e);
  }

  // Fallback to searching in initial apps
  return INITIAL_APPS.filter(
    (app) =>
      app.developer.toLowerCase() === lookup ||
      (app.developerUid && app.developerUid.toLowerCase() === lookup)
  );
}

/**
 * 8. Fetch user's wishlist items.
 */
export async function fetchUserWishlist(userId: string): Promise<WishlistItem[]> {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, COLLECTIONS.WISHLIST),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as WishlistItem));
    }
  } catch (error) {
    console.warn('[Firestore] User wishlist query notice:', error);
  }
  return [];
}

/**
 * 9. Fetch user notifications.
 */
export async function fetchUserNotifications(userId?: string): Promise<AppNotification[]> {
  try {
    const q = userId
      ? query(collection(db, COLLECTIONS.NOTIFICATIONS), where('userId', '==', userId), limit(30))
      : query(collection(db, COLLECTIONS.NOTIFICATIONS), limit(30));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || 'Store Notification',
          message: data.message || '',
          timestamp: data.timestamp || 'Just now',
          isRead: !!data.isRead,
          type: data.type || 'SYSTEM',
          deepLinkAppId: data.deepLinkAppId,
          userId: data.userId
        };
      });
    }
  } catch (error) {
    console.warn('[Firestore] Notifications query notice:', error);
  }
  return INITIAL_NOTIFICATIONS;
}

/**
 * 10. Fetch Store Settings.
 */
export async function fetchStoreSettings(): Promise<StoreSettings | null> {
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, 'global');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as StoreSettings;
    }
  } catch (error) {
    console.warn('[Firestore] Store settings query notice:', error);
  }
  return null;
}

/**
 * 11. Fetch user record from Firestore users collection (authoritative permissions check).
 */
export async function fetchUserProfile(uid: string, emailHint?: string): Promise<User | null> {
  if (!uid) return null;
  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, uid);
    const snap = await getDoc(userDocRef);

    let isAdminDoc = false;
    try {
      const adminDocRef = doc(db, COLLECTIONS.ADMINS, uid);
      const adminSnap = await getDoc(adminDocRef);
      isAdminDoc = adminSnap.exists();
    } catch {
      // Non-fatal if admins collection read is restricted
    }

    let authoritativeRole: 'USER' | 'DEVELOPER' | 'STUDENT' | 'ADMIN' = 'USER';
    let data: any = {};

    if (snap.exists()) {
      data = snap.data();
      const rawRole = data.role as string;
      if (rawRole === 'ADMIN' || rawRole === 'DEVELOPER' || rawRole === 'STUDENT' || rawRole === 'USER') {
        authoritativeRole = rawRole;
      }
    }

    const email = data.email || emailHint || '';
    if (isAdminDoc || isPrimaryAdminEmail(email)) {
      authoritativeRole = 'ADMIN';
    }

    const devStatus = data.developerStatus || (authoritativeRole === 'ADMIN' || authoritativeRole === 'DEVELOPER' ? 'VERIFIED' : 'NONE');
    const stuStatus = data.studentStatus || (authoritativeRole === 'STUDENT' ? 'VERIFIED' : 'NONE');
    const admStatus = authoritativeRole === 'ADMIN' ? 'ACTIVE' : (data.adminStatus || 'NONE');
    const vBadge = data.verificationBadge || (authoritativeRole === 'ADMIN' || devStatus === 'VERIFIED' || stuStatus === 'VERIFIED' ? 'VERIFIED' : 'NONE');

    return {
      id: uid,
      name: data.displayName || data.name || (email ? email.split('@')[0] : 'Store User'),
      email,
      role: authoritativeRole,
      realRole: authoritativeRole,
      activeViewRole: authoritativeRole,
      avatarUrl: data.avatarUrl || data.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      bio: data.bio || '',
      verifiedDeveloper: authoritativeRole === 'DEVELOPER' || authoritativeRole === 'ADMIN' || devStatus === 'VERIFIED',
      developerStatus: devStatus,
      studentStatus: stuStatus,
      adminStatus: admStatus,
      verificationBadge: vBadge,
      developerDetails: data.developerDetails,
      studentDetails: data.studentDetails,
      developerKey: data.developerKey || `AVX-DEV-${uid.substring(0, 8).toUpperCase()}`,
      emailVerified: !!data.emailVerified,
      status: data.status || 'ACTIVE',
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : undefined,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : undefined
    };
  } catch (error) {
    console.warn('[Firestore] User profile query notice:', error);
  }
  return null;
}

/**
 * Synchronizes user profile into Firestore users/{uid} collection.
 * Creates default record if document does not exist yet.
 */
export async function syncUserProfile(
  uid: string,
  data: { email?: string; name?: string; avatarUrl?: string; bio?: string; role?: 'USER' | 'DEVELOPER' | 'STUDENT' | 'ADMIN' }
): Promise<void> {
  if (!uid) return;
  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, uid);
    const snap = await getDoc(userDocRef);

    const isPrimaryAdmin = data.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();

    if (!snap.exists()) {
      const initialRole = isPrimaryAdmin ? 'ADMIN' : (data.role && data.role !== 'ADMIN' ? data.role : 'USER');
      await setDoc(userDocRef, {
        id: uid,
        email: data.email || '',
        name: data.name || (data.email ? data.email.split('@')[0] : 'Store User'),
        displayName: data.name || (data.email ? data.email.split('@')[0] : 'Store User'),
        avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        bio: data.bio || '',
        role: initialRole,
        developerStatus: 'NONE',
        studentStatus: 'NONE',
        adminStatus: isPrimaryAdmin ? 'ACTIVE' : 'NONE',
        verificationBadge: isPrimaryAdmin ? 'VERIFIED' : 'NONE',
        developerKey: `AVX-DEV-${uid.substring(0, 8).toUpperCase()}`,
        status: 'ACTIVE',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // If primary admin, register in admins collection as well
      if (isPrimaryAdmin) {
        try {
          await setDoc(doc(db, COLLECTIONS.ADMINS, uid), {
            uid,
            email: data.email,
            createdAt: serverTimestamp()
          });
        } catch (adminErr) {
          console.warn('[Firestore] Notice syncing admins collection:', adminErr);
        }
      }
    } else {
      const existing = snap.data();
      const updates: any = {
        updatedAt: serverTimestamp()
      };
      if (data.name && (!existing.displayName || existing.displayName === 'Store User')) {
        updates.displayName = data.name;
        updates.name = data.name;
      }
      if (data.email && !existing.email) {
        updates.email = data.email;
      }
      if (data.avatarUrl && !existing.avatarUrl) {
        updates.avatarUrl = data.avatarUrl;
      }
      if (data.bio !== undefined) {
        updates.bio = data.bio;
      }
      // If user is primary admin, enforce ADMIN role
      if (isPrimaryAdmin && existing.role !== 'ADMIN') {
        updates.role = 'ADMIN';
        updates.adminStatus = 'ACTIVE';
        updates.verificationBadge = 'VERIFIED';
      }
      await setDoc(userDocRef, updates, { merge: true });
    }
  } catch (error) {
    console.warn('[Firestore] Sync user profile notice:', error);
  }
}

/**
 * Updates user editable profile details (safe client-side update).
 */
export async function updateUserProfile(
  uid: string,
  data: { name?: string; avatarUrl?: string; bio?: string; email?: string; websiteUrl?: string; country?: string }
): Promise<void> {
  if (!uid) return;
  const userDocRef = doc(db, COLLECTIONS.USERS, uid);
  const updates: any = {
    updatedAt: serverTimestamp()
  };
  if (data.name) {
    updates.name = data.name.trim();
    updates.displayName = data.name.trim();
  }
  if (data.email) {
    updates.email = data.email.trim();
  }
  if (data.avatarUrl) {
    updates.avatarUrl = data.avatarUrl.trim();
  }
  if (data.bio !== undefined) {
    updates.bio = data.bio.trim();
  }
  if (data.websiteUrl !== undefined) {
    updates.websiteUrl = data.websiteUrl.trim();
  }
  if (data.country !== undefined) {
    updates.country = data.country.trim();
  }
  await setDoc(userDocRef, updates, { merge: true });
}

/**
 * Submit a formal Developer Application (pending Admin review).
 */
/**
 * Submit a Developer Verification Request (pending Admin review).
 * Stores in developer_applications with standardized schema, creates admin notification, and logs audit trail.
 */
export async function submitDeveloperVerificationRequest(
  uid: string,
  details: {
    developerName?: string;
    displayName?: string;
    organizationName?: string;
    websiteUrl?: string;
    githubUrl?: string;
    description?: string;
    country?: string;
    contactEmail?: string;
    documentUrls?: string[];
    notes?: string;
  },
  userEmail: string,
  userName: string
): Promise<string> {
  if (!uid) throw new Error('Authentication required.');

  const devName = details.developerName || details.displayName || userName || 'Developer';
  const orgName = details.organizationName?.trim() || '';
  const webUrl = details.websiteUrl?.trim() || '';
  const ghUrl = details.githubUrl?.trim() || '';
  const desc = details.description?.trim() || '';
  const country = details.country?.trim() || 'Global';
  const contact = details.contactEmail?.trim() || userEmail || '';
  const notes = details.notes?.trim() || '';
  const docUrls = details.documentUrls || [];

  const caseId = generateCaseId('DEV');

  // 1. Create or update application document in developer_applications collection
  const appDocRef = doc(db, COLLECTIONS.DEVELOPER_APPLICATIONS, uid);
  await setDoc(
    appDocRef,
    {
      id: uid,
      caseId: caseId,
      applicationId: uid,
      applicantUid: uid,
      applicantEmail: userEmail || contact,
      displayName: devName,
      developerName: devName,
      requestedRole: 'VERIFIED_DEVELOPER',
      submittedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'PENDING_REVIEW',
      contactEmail: contact,
      organizationName: orgName,
      websiteUrl: webUrl,
      githubUrl: ghUrl,
      description: desc,
      country: country,
      documentUrls: docUrls,
      notes: notes,
      // Legacy compatibility aliases
      userId: uid,
      email: userEmail || contact,
      createdAt: serverTimestamp()
    },
    { merge: true }
  );

  // 2. Update user document with pending developer status (cannot publish until approved)
  const userDocRef = doc(db, COLLECTIONS.USERS, uid);
  await setDoc(
    userDocRef,
    {
      developerStatus: 'PENDING_REVIEW',
      developerDetails: {
        caseId: caseId,
        developerName: devName,
        organizationName: orgName,
        websiteUrl: webUrl,
        githubUrl: ghUrl,
        description: desc,
        country: country,
        contactEmail: contact,
        documentUrls: docUrls,
        requestedAt: new Date().toISOString(),
        notes: notes
      },
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  // 3. Create Admin Notification in Firestore
  try {
    const adminNotifRef = doc(collection(db, COLLECTIONS.ADMIN_NOTIFICATIONS));
    await setDoc(adminNotifRef, {
      id: adminNotifRef.id,
      title: 'New Developer Application',
      message: `${devName} (${contact}) submitted Developer Verification [${caseId}].`,
      type: 'DEVELOPER_VERIFICATION_REQUEST',
      caseId: caseId,
      targetId: uid,
      applicantUid: uid,
      userId: uid,
      applicantEmail: userEmail || contact,
      status: 'UNREAD',
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.warn('[Firestore] Admin notification creation notice:', e);
  }

  // 4. Record initial audit log
  await logAdminAction(
    uid,
    userEmail || contact,
    'SUBMIT_DEVELOPER_APPLICATION',
    uid,
    `Developer verification [${caseId}] submitted by ${devName}`
  );

  return caseId;
}

/**
 * Submit a Student Verification Request (pending Admin review).
 * Stores in student_verification_requests with standardized schema, creates admin notification, and logs audit trail.
 */
export async function submitStudentVerificationRequest(
  uid: string,
  details: {
    studentName?: string;
    institutionName?: string;
    institution?: string;
    studentIdNumber?: string;
    graduationYear?: string;
    documentUrl?: string;
    documentUrls?: string[];
    country?: string;
    contactEmail?: string;
    notes?: string;
  },
  userEmail: string,
  userName: string
): Promise<string> {
  if (!uid) throw new Error('Authentication required.');

  const sName = details.studentName || userName || 'Student';
  const inst = details.institution || details.institutionName || '';
  const sId = details.studentIdNumber?.trim() || '';
  const grad = details.graduationYear?.trim() || '2026';
  const docUrl = details.documentUrl || '';
  const docUrls = details.documentUrls || (docUrl ? [docUrl] : []);
  const notes = details.notes || '';
  const contact = details.contactEmail || userEmail || '';
  const country = details.country || '';

  const caseId = generateCaseId('STU');

  const reqDocRef = doc(db, COLLECTIONS.STUDENT_VERIFICATION_REQUESTS, uid);
  await setDoc(
    reqDocRef,
    {
      id: uid,
      caseId: caseId,
      requestId: uid,
      applicationId: uid,
      applicantUid: uid,
      applicantEmail: userEmail || contact,
      displayName: sName,
      studentName: sName,
      requestedRole: 'VERIFIED_STUDENT',
      submittedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'PENDING_REVIEW',
      institution: inst,
      institutionName: inst,
      studentIdNumber: sId,
      graduationYear: grad,
      documentUrl: docUrl,
      documentUrls: docUrls,
      contactEmail: contact,
      country: country,
      notes: notes,
      // Legacy compatibility aliases
      userId: uid,
      email: userEmail || contact,
      createdAt: serverTimestamp()
    },
    { merge: true }
  );

  const userDocRef = doc(db, COLLECTIONS.USERS, uid);
  await setDoc(
    userDocRef,
    {
      studentStatus: 'PENDING_REVIEW',
      studentDetails: {
        caseId: caseId,
        institutionName: inst,
        institution: inst,
        studentIdNumber: sId,
        graduationYear: grad,
        documentUrl: docUrl,
        documentUrls: docUrls,
        contactEmail: contact,
        country: country,
        requestedAt: new Date().toISOString(),
        notes: notes
      },
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  // Create Admin Notification
  try {
    const adminNotifRef = doc(collection(db, COLLECTIONS.ADMIN_NOTIFICATIONS));
    await setDoc(adminNotifRef, {
      id: adminNotifRef.id,
      title: 'New Student Verification Request',
      message: `${sName} (${inst}) submitted Student Verification [${caseId}].`,
      type: 'STUDENT_VERIFICATION_REQUEST',
      caseId: caseId,
      targetId: uid,
      applicantUid: uid,
      userId: uid,
      applicantEmail: userEmail || contact,
      status: 'UNREAD',
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.warn('[Firestore] Admin notification creation notice:', e);
  }

  // Record initial audit log
  await logAdminAction(
    uid,
    userEmail,
    'SUBMIT_STUDENT_VERIFICATION',
    uid,
    `Student verification [${caseId}] submitted by ${sName} (${inst})`
  );

  return caseId;
}

/**
 * Deletes user profile document from Firestore.
 * Prevents Admin accounts from self-deletion.
 */
export async function deleteUserAccountData(uid: string, role: string): Promise<void> {
  if (!uid) return;
  if (role === 'ADMIN') {
    throw new Error('Admin accounts cannot be deleted directly for security and continuity reasons. Please contact system management.');
  }

  const userDocRef = doc(db, COLLECTIONS.USERS, uid);
  await deleteDoc(userDocRef);

  // Clean up developer or student requests if any
  try {
    await deleteDoc(doc(db, COLLECTIONS.DEVELOPER_REQUESTS, uid));
    await deleteDoc(doc(db, COLLECTIONS.STUDENT_REQUESTS, uid));
  } catch (e) {
    console.warn('[Firestore] Cleanup notice:', e);
  }
}

/**
 * ADMIN FUNCTIONS
 */

export async function fetchAllUsers(): Promise<User[]> {
  try {
    const q = query(collection(db, COLLECTIONS.USERS), limit(100));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => {
        const data = d.data();
        const role = data.role || 'USER';
        return {
          id: d.id,
          name: data.displayName || data.name || 'Store User',
          email: data.email || '',
          role: role,
          realRole: role,
          activeViewRole: role,
          avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
          bio: data.bio || '',
          verifiedDeveloper: role === 'DEVELOPER' || role === 'ADMIN' || data.developerStatus === 'VERIFIED',
          developerStatus: data.developerStatus || 'NONE',
          studentStatus: data.studentStatus || 'NONE',
          adminStatus: data.adminStatus || (role === 'ADMIN' ? 'ACTIVE' : 'NONE'),
          verificationBadge: data.verificationBadge || (role === 'ADMIN' ? 'VERIFIED' : 'NONE'),
          developerDetails: data.developerDetails,
          studentDetails: data.studentDetails,
          developerKey: data.developerKey,
          emailVerified: !!data.emailVerified,
          status: data.status || 'ACTIVE',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : undefined,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : undefined
        };
      });
    }
  } catch (error) {
    console.warn('[Firestore] Error fetching all users:', error);
  }
  return [];
}

export async function adminUpdateUserRole(
  adminUid: string,
  adminEmail: string,
  targetUid: string,
  updates: {
    role?: 'USER' | 'DEVELOPER' | 'VERIFIED_DEVELOPER' | 'STUDENT' | 'VERIFIED_STUDENT' | 'ADMIN';
    developerStatus?: 'NONE' | 'PENDING' | 'PENDING_REVIEW' | 'UNDER_REVIEW' | 'VERIFIED' | 'APPROVED' | 'REJECTED' | 'REQUEST_INFO' | 'SUSPENDED';
    studentStatus?: 'NONE' | 'PENDING' | 'PENDING_REVIEW' | 'UNDER_REVIEW' | 'VERIFIED' | 'APPROVED' | 'REJECTED' | 'REQUEST_INFO';
    adminStatus?: 'NONE' | 'ACTIVE' | 'SUSPENDED';
    verificationBadge?: 'NONE' | 'VERIFIED' | 'VERIFIED_DEVELOPER' | 'VERIFIED_STUDENT' | 'OFFICIAL' | 'STUDENT_VERIFIED' | 'ADMIN';
    status?: 'ACTIVE' | 'SUSPENDED' | 'DISABLED';
  }
): Promise<void> {
  const userDocRef = doc(db, COLLECTIONS.USERS, targetUid);
  const payload: any = {
    ...updates,
    updatedAt: serverTimestamp()
  };

  if (updates.role) {
    payload.realRole = updates.role;
  }

  if (updates.role === 'ADMIN') {
    payload.adminStatus = 'ACTIVE';
    payload.verificationBadge = 'VERIFIED';
    await setDoc(doc(db, COLLECTIONS.ADMINS, targetUid), {
      uid: targetUid,
      grantedBy: adminUid,
      grantedAt: serverTimestamp()
    });
  }

  if (updates.role === 'DEVELOPER' || updates.role === 'VERIFIED_DEVELOPER') {
    payload.developerStatus = 'VERIFIED';
    payload.verifiedDeveloper = true;
  }

  if (updates.role === 'STUDENT' || updates.role === 'VERIFIED_STUDENT') {
    payload.studentStatus = 'VERIFIED';
  }

  await setDoc(userDocRef, payload, { merge: true });

  // Log to audit collection
  await logAdminAction(adminUid, adminEmail, 'UPDATE_USER_ROLE', targetUid, JSON.stringify(updates));
}

export async function adminUpdateUserRoleAndBadge(
  targetUid: string,
  updates: {
    role?: 'USER' | 'DEVELOPER' | 'VERIFIED_DEVELOPER' | 'STUDENT' | 'VERIFIED_STUDENT' | 'ADMIN';
    developerStatus?: 'NONE' | 'PENDING' | 'PENDING_REVIEW' | 'UNDER_REVIEW' | 'VERIFIED' | 'APPROVED' | 'REJECTED' | 'REQUEST_INFO' | 'SUSPENDED';
    studentStatus?: 'NONE' | 'PENDING' | 'PENDING_REVIEW' | 'UNDER_REVIEW' | 'VERIFIED' | 'APPROVED' | 'REJECTED' | 'REQUEST_INFO';
    verificationBadge?: 'NONE' | 'VERIFIED' | 'VERIFIED_DEVELOPER' | 'VERIFIED_STUDENT' | 'OFFICIAL' | 'STUDENT_VERIFIED' | 'ADMIN';
  },
  adminUid: string
): Promise<void> {
  await adminUpdateUserRole(adminUid, '', targetUid, updates as any);
}

export async function fetchDeveloperRequests(): Promise<any[]> {
  try {
    const q = query(collection(db, COLLECTIONS.DEVELOPER_REQUESTS), limit(50));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (error) {
    console.warn('[Firestore] Error fetching developer requests:', error);
  }
  return [];
}

export async function adminReviewDeveloperRequest(
  adminUid: string,
  adminEmail: string,
  targetUid: string,
  status: 'APPROVED' | 'REJECTED' | 'REQUEST_INFO' | 'SUSPENDED',
  reviewerNotes?: string
): Promise<void> {
  const reqRef = doc(db, COLLECTIONS.DEVELOPER_APPLICATIONS, targetUid);
  const nowIso = new Date().toISOString();
  
  await setDoc(
    reqRef,
    {
      status,
      reviewedAt: serverTimestamp(),
      reviewedBy: adminEmail || adminUid,
      reviewedByAdminUid: adminUid,
      reviewerNotes: reviewerNotes || '',
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  const userDocRef = doc(db, COLLECTIONS.USERS, targetUid);
  const isApproved = status === 'APPROVED';
  
  const userUpdates: any = {
    'developerDetails.reviewedAt': nowIso,
    'developerDetails.reviewedBy': adminEmail || adminUid,
    'developerDetails.reviewedByAdminUid': adminUid,
    'developerDetails.notes': reviewerNotes || '',
    updatedAt: serverTimestamp()
  };

  if (isApproved) {
    userUpdates.role = 'VERIFIED_DEVELOPER';
    userUpdates.realRole = 'VERIFIED_DEVELOPER';
    userUpdates.developerStatus = 'VERIFIED';
    userUpdates.verifiedDeveloper = true;
    userUpdates.verificationBadge = 'VERIFIED_DEVELOPER';
  } else if (status === 'REJECTED') {
    userUpdates.developerStatus = 'REJECTED';
    userUpdates.verifiedDeveloper = false;
  } else if (status === 'REQUEST_INFO') {
    userUpdates.developerStatus = 'REQUEST_INFO';
  } else if (status === 'SUSPENDED') {
    userUpdates.developerStatus = 'SUSPENDED';
    userUpdates.role = 'USER';
    userUpdates.realRole = 'USER';
    userUpdates.verifiedDeveloper = false;
    userUpdates.verificationBadge = 'NONE';
  }

  await setDoc(userDocRef, userUpdates, { merge: true });

  // Send Applicant Notification
  try {
    const userNotifRef = doc(collection(db, COLLECTIONS.NOTIFICATIONS));
    const title = isApproved
      ? 'Developer Application Approved!'
      : status === 'REQUEST_INFO'
      ? 'Action Required: Developer Application Information Requested'
      : 'Developer Application Update';
    const message = isApproved
      ? 'Congratulations! Your Developer account has been verified. You now have full access to publish apps on Avanyx Store.'
      : status === 'REQUEST_INFO'
      ? `The admin team has requested additional information: "${reviewerNotes || 'Please update your developer credentials.'}"`
      : `Your developer application status has been updated to: ${status}. ${reviewerNotes ? `Note: ${reviewerNotes}` : ''}`;

    await setDoc(userNotifRef, {
      id: userNotifRef.id,
      userId: targetUid,
      title,
      message,
      type: 'VERIFICATION_UPDATE',
      read: false,
      timestamp: nowIso,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.warn('[Firestore] Applicant notification error:', e);
  }

  await logAdminAction(
    adminUid,
    adminEmail,
    `DEVELOPER_APPLICATION_${status}`,
    targetUid,
    `Application set to ${status}. Notes: ${reviewerNotes || 'None'}`
  );
}

export async function adminReviewStudentRequest(
  adminUid: string,
  adminEmail: string,
  targetUid: string,
  status: 'APPROVED' | 'REJECTED' | 'REQUEST_INFO',
  reviewerNotes?: string
): Promise<void> {
  const reqRef = doc(db, COLLECTIONS.STUDENT_VERIFICATION_REQUESTS, targetUid);
  const nowIso = new Date().toISOString();

  await setDoc(
    reqRef,
    {
      status,
      reviewedAt: serverTimestamp(),
      reviewedBy: adminEmail || adminUid,
      reviewedByAdminUid: adminUid,
      reviewerNotes: reviewerNotes || '',
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  const userDocRef = doc(db, COLLECTIONS.USERS, targetUid);
  const isApproved = status === 'APPROVED';

  const userUpdates: any = {
    'studentDetails.reviewedAt': nowIso,
    'studentDetails.reviewedBy': adminEmail || adminUid,
    'studentDetails.reviewedByAdminUid': adminUid,
    'studentDetails.notes': reviewerNotes || '',
    updatedAt: serverTimestamp()
  };

  if (isApproved) {
    userUpdates.role = 'VERIFIED_STUDENT';
    userUpdates.realRole = 'VERIFIED_STUDENT';
    userUpdates.studentStatus = 'VERIFIED';
    userUpdates.verificationBadge = 'VERIFIED_STUDENT';
  } else if (status === 'REJECTED') {
    userUpdates.studentStatus = 'REJECTED';
  } else if (status === 'REQUEST_INFO') {
    userUpdates.studentStatus = 'REQUEST_INFO';
  }

  await setDoc(userDocRef, userUpdates, { merge: true });

  // Send Applicant Notification
  try {
    const userNotifRef = doc(collection(db, COLLECTIONS.NOTIFICATIONS));
    const title = isApproved
      ? 'Student Verification Approved!'
      : status === 'REQUEST_INFO'
      ? 'Action Required: Student Verification Information Requested'
      : 'Student Verification Update';
    const message = isApproved
      ? 'Congratulations! Your student identity has been verified. You now enjoy student benefits on Avanyx Store.'
      : status === 'REQUEST_INFO'
      ? `The admin team requested additional documentation: "${reviewerNotes || 'Please provide verified student ID.'}"`
      : `Your student verification was not approved. ${reviewerNotes ? `Reason: ${reviewerNotes}` : ''}`;

    await setDoc(userNotifRef, {
      id: userNotifRef.id,
      userId: targetUid,
      title,
      message,
      type: 'STUDENT_VERIFICATION_UPDATE',
      read: false,
      timestamp: nowIso,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.warn('[Firestore] Applicant notification error:', e);
  }

  await logAdminAction(
    adminUid,
    adminEmail,
    `STUDENT_REQUEST_${status}`,
    targetUid,
    `Student request set to ${status}. Notes: ${reviewerNotes || 'None'}`
  );
}

export async function fetchVerificationRequests(
  type?: 'DEVELOPER' | 'STUDENT',
  status?: string
): Promise<VerificationRequest[]> {
  const results: VerificationRequest[] = [];
  try {
    if (!type || type === 'DEVELOPER') {
      const devDocs = await getDocs(query(collection(db, COLLECTIONS.DEVELOPER_APPLICATIONS), limit(100)));
      devDocs.forEach((d) => {
        const data = d.data();
        const docStatus = data.status === 'PENDING' ? 'PENDING_REVIEW' : (data.status || 'PENDING_REVIEW');
        if (!status || docStatus === status || (status === 'PENDING_REVIEW' && (data.status === 'PENDING' || data.status === 'PENDING_REVIEW'))) {
          results.push({
            id: d.id,
            applicationId: data.applicationId || d.id,
            type: 'DEVELOPER',
            applicantUid: data.applicantUid || data.userId || d.id,
            applicantEmail: data.applicantEmail || data.email || data.contactEmail || '',
            displayName: data.displayName || data.developerName || data.userName || 'Developer',
            requestedRole: data.requestedRole || 'VERIFIED_DEVELOPER',
            status: docStatus,
            developerDetails: {
              developerName: data.developerName || data.displayName,
              organizationName: data.organizationName,
              websiteUrl: data.websiteUrl,
              githubUrl: data.githubUrl,
              description: data.description,
              country: data.country,
              contactEmail: data.contactEmail || data.applicantEmail || data.email,
              documentUrls: data.documentUrls || [],
              notes: data.notes,
              reviewedAt: data.reviewedAt?.toDate ? data.reviewedAt.toDate().toISOString() : data.reviewedAt,
              reviewedBy: data.reviewedBy,
              reviewedByAdminUid: data.reviewedByAdminUid,
              requestedAt: data.submittedAt?.toDate ? data.submittedAt.toDate().toISOString() : data.createdAt
            },
            documentUrls: data.documentUrls || [],
            notes: data.notes,
            submittedAt: data.submittedAt?.toDate ? data.submittedAt.toDate().toISOString() : (data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : undefined,
            reviewedAt: data.reviewedAt?.toDate ? data.reviewedAt.toDate().toISOString() : data.reviewedAt,
            reviewedBy: data.reviewedBy,
            reviewedByAdminUid: data.reviewedByAdminUid,
            reviewerNotes: data.reviewerNotes,
            moderationHistory: data.moderationHistory || [],
            // Legacy fields
            userId: data.applicantUid || data.userId || d.id,
            userEmail: data.applicantEmail || data.email || data.contactEmail || '',
            userName: data.displayName || data.developerName || 'Developer',
            createdAt: data.submittedAt?.toDate ? data.submittedAt.toDate().toISOString() : new Date().toISOString()
          });
        }
      });
    }

    if (!type || type === 'STUDENT') {
      const stuDocs = await getDocs(query(collection(db, COLLECTIONS.STUDENT_VERIFICATION_REQUESTS), limit(100)));
      stuDocs.forEach((d) => {
        const data = d.data();
        const docStatus = data.status === 'PENDING' ? 'PENDING_REVIEW' : (data.status || 'PENDING_REVIEW');
        if (!status || docStatus === status || (status === 'PENDING_REVIEW' && (data.status === 'PENDING' || data.status === 'PENDING_REVIEW'))) {
          results.push({
            id: d.id,
            applicationId: data.requestId || data.applicationId || d.id,
            requestId: data.requestId || d.id,
            type: 'STUDENT',
            applicantUid: data.applicantUid || data.userId || d.id,
            applicantEmail: data.applicantEmail || data.email || '',
            displayName: data.displayName || data.studentName || data.userName || 'Student',
            requestedRole: data.requestedRole || 'VERIFIED_STUDENT',
            status: docStatus,
            studentDetails: {
              institutionName: data.institution || data.institutionName,
              institution: data.institution || data.institutionName,
              studentIdNumber: data.studentIdNumber,
              graduationYear: data.graduationYear,
              documentUrl: data.documentUrl,
              documentUrls: data.documentUrls || (data.documentUrl ? [data.documentUrl] : []),
              country: data.country,
              contactEmail: data.contactEmail || data.applicantEmail || data.email,
              notes: data.notes,
              reviewedAt: data.reviewedAt?.toDate ? data.reviewedAt.toDate().toISOString() : data.reviewedAt,
              reviewedBy: data.reviewedBy,
              reviewedByAdminUid: data.reviewedByAdminUid,
              requestedAt: data.submittedAt?.toDate ? data.submittedAt.toDate().toISOString() : data.createdAt
            },
            documentUrls: data.documentUrls || (data.documentUrl ? [data.documentUrl] : []),
            notes: data.notes,
            submittedAt: data.submittedAt?.toDate ? data.submittedAt.toDate().toISOString() : (data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : undefined,
            reviewedAt: data.reviewedAt?.toDate ? data.reviewedAt.toDate().toISOString() : data.reviewedAt,
            reviewedBy: data.reviewedBy,
            reviewedByAdminUid: data.reviewedByAdminUid,
            reviewerNotes: data.reviewerNotes,
            moderationHistory: data.moderationHistory || [],
            // Legacy fields
            userId: data.applicantUid || data.userId || d.id,
            userEmail: data.applicantEmail || data.email || '',
            userName: data.displayName || data.studentName || 'Student',
            createdAt: data.submittedAt?.toDate ? data.submittedAt.toDate().toISOString() : new Date().toISOString()
          });
        }
      });
    }
  } catch (error) {
    console.warn('[Firestore] Error fetching verification requests:', error);
  }

  // Sort newest first
  return results.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

/**
 * Realtime subscription to Developer Applications and Student Requests for live Admin Panel queue.
 */
export function subscribeToVerificationRequests(
  onData: (requests: VerificationRequest[]) => void,
  onError?: (error: Error) => void
): () => void {
  let devList: VerificationRequest[] = [];
  let stuList: VerificationRequest[] = [];

  const emit = () => {
    const merged = [...devList, ...stuList].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
    onData(merged);
  };

  try {
    const unsubDev = onSnapshot(
      query(collection(db, COLLECTIONS.DEVELOPER_APPLICATIONS), limit(100)),
      (snapshot) => {
        devList = snapshot.docs.map((d) => {
          const data = d.data();
          const docStatus = data.status === 'PENDING' ? 'PENDING_REVIEW' : (data.status || 'PENDING_REVIEW');
          return {
            id: d.id,
            applicationId: data.applicationId || d.id,
            type: 'DEVELOPER',
            applicantUid: data.applicantUid || data.userId || d.id,
            applicantEmail: data.applicantEmail || data.email || data.contactEmail || '',
            displayName: data.displayName || data.developerName || data.userName || 'Developer',
            requestedRole: data.requestedRole || 'VERIFIED_DEVELOPER',
            status: docStatus,
            developerDetails: {
              developerName: data.developerName || data.displayName,
              organizationName: data.organizationName,
              websiteUrl: data.websiteUrl,
              githubUrl: data.githubUrl,
              description: data.description,
              country: data.country,
              contactEmail: data.contactEmail || data.applicantEmail || data.email,
              documentUrls: data.documentUrls || [],
              notes: data.notes,
              reviewedAt: data.reviewedAt?.toDate ? data.reviewedAt.toDate().toISOString() : data.reviewedAt,
              reviewedBy: data.reviewedBy,
              reviewedByAdminUid: data.reviewedByAdminUid,
              requestedAt: data.submittedAt?.toDate ? data.submittedAt.toDate().toISOString() : data.createdAt
            },
            documentUrls: data.documentUrls || [],
            notes: data.notes,
            submittedAt: data.submittedAt?.toDate ? data.submittedAt.toDate().toISOString() : (data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : undefined,
            reviewedAt: data.reviewedAt?.toDate ? data.reviewedAt.toDate().toISOString() : data.reviewedAt,
            reviewedBy: data.reviewedBy,
            reviewedByAdminUid: data.reviewedByAdminUid,
            reviewerNotes: data.reviewerNotes,
            moderationHistory: data.moderationHistory || [],
            // Legacy fields
            userId: data.applicantUid || data.userId || d.id,
            userEmail: data.applicantEmail || data.email || data.contactEmail || '',
            userName: data.displayName || data.developerName || 'Developer',
            createdAt: data.submittedAt?.toDate ? data.submittedAt.toDate().toISOString() : new Date().toISOString()
          };
        });
        emit();
      },
      (err) => {
        console.warn('[Firestore] Dev applications subscription notice:', err);
        if (onError) onError(err);
      }
    );

    const unsubStu = onSnapshot(
      query(collection(db, COLLECTIONS.STUDENT_VERIFICATION_REQUESTS), limit(100)),
      (snapshot) => {
        stuList = snapshot.docs.map((d) => {
          const data = d.data();
          const docStatus = data.status === 'PENDING' ? 'PENDING_REVIEW' : (data.status || 'PENDING_REVIEW');
          return {
            id: d.id,
            applicationId: data.requestId || data.applicationId || d.id,
            requestId: data.requestId || d.id,
            type: 'STUDENT',
            applicantUid: data.applicantUid || data.userId || d.id,
            applicantEmail: data.applicantEmail || data.email || '',
            displayName: data.displayName || data.studentName || data.userName || 'Student',
            requestedRole: data.requestedRole || 'VERIFIED_STUDENT',
            status: docStatus,
            studentDetails: {
              institutionName: data.institution || data.institutionName,
              institution: data.institution || data.institutionName,
              studentIdNumber: data.studentIdNumber,
              graduationYear: data.graduationYear,
              documentUrl: data.documentUrl,
              documentUrls: data.documentUrls || (data.documentUrl ? [data.documentUrl] : []),
              country: data.country,
              contactEmail: data.contactEmail || data.applicantEmail || data.email,
              notes: data.notes,
              reviewedAt: data.reviewedAt?.toDate ? data.reviewedAt.toDate().toISOString() : data.reviewedAt,
              reviewedBy: data.reviewedBy,
              reviewedByAdminUid: data.reviewedByAdminUid,
              requestedAt: data.submittedAt?.toDate ? data.submittedAt.toDate().toISOString() : data.createdAt
            },
            documentUrls: data.documentUrls || (data.documentUrl ? [data.documentUrl] : []),
            notes: data.notes,
            submittedAt: data.submittedAt?.toDate ? data.submittedAt.toDate().toISOString() : (data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : undefined,
            reviewedAt: data.reviewedAt?.toDate ? data.reviewedAt.toDate().toISOString() : data.reviewedAt,
            reviewedBy: data.reviewedBy,
            reviewedByAdminUid: data.reviewedByAdminUid,
            reviewerNotes: data.reviewerNotes,
            moderationHistory: data.moderationHistory || [],
            // Legacy fields
            userId: data.applicantUid || data.userId || d.id,
            userEmail: data.applicantEmail || data.email || '',
            userName: data.displayName || data.studentName || 'Student',
            createdAt: data.submittedAt?.toDate ? data.submittedAt.toDate().toISOString() : new Date().toISOString()
          };
        });
        emit();
      },
      (err) => {
        console.warn('[Firestore] Student requests subscription notice:', err);
        if (onError) onError(err);
      }
    );

    return () => {
      unsubDev();
      unsubStu();
    };
  } catch (err: any) {
    console.warn('[Firestore] Failed to initialize verification requests listener:', err);
    return () => {};
  }
}

export async function reviewVerificationRequest(
  requestId: string,
  status: 'APPROVED' | 'REJECTED' | 'REQUEST_INFO' | 'SUSPENDED',
  adminUid: string,
  reason?: string
): Promise<void> {
  // Check if developer application exists
  const devDoc = await getDoc(doc(db, COLLECTIONS.DEVELOPER_APPLICATIONS, requestId));
  if (devDoc.exists()) {
    await adminReviewDeveloperRequest(adminUid, '', requestId, status, reason);
    return;
  }

  // Check if student request exists
  const stuDoc = await getDoc(doc(db, COLLECTIONS.STUDENT_VERIFICATION_REQUESTS, requestId));
  if (stuDoc.exists()) {
    await adminReviewStudentRequest(adminUid, '', requestId, status as 'APPROVED' | 'REJECTED' | 'REQUEST_INFO', reason);
    return;
  }

  // Fallback: check legacy collections
  const legacyDevDoc = await getDoc(doc(db, 'developer_requests', requestId));
  if (legacyDevDoc.exists()) {
    await adminReviewDeveloperRequest(adminUid, '', requestId, status, reason);
    return;
  }

  const legacyStuDoc = await getDoc(doc(db, 'student_requests', requestId));
  if (legacyStuDoc.exists()) {
    await adminReviewStudentRequest(adminUid, '', requestId, status as 'APPROVED' | 'REJECTED' | 'REQUEST_INFO', reason);
    return;
  }
}

export function subscribeToAdminNotifications(
  onData: (notifications: any[]) => void
): () => void {
  try {
    return onSnapshot(
      query(collection(db, COLLECTIONS.ADMIN_NOTIFICATIONS), limit(50)),
      (snapshot) => {
        const notifs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate().toISOString() : new Date().toISOString()
        }));
        onData(notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      },
      (err) => {
        console.warn('[Firestore] Admin notifications listener notice:', err);
      }
    );
  } catch (e) {
    return () => {};
  }
}

export async function fetchAllApps(): Promise<StoreApp[]> {
  try {
    const q = query(collection(db, COLLECTIONS.APPS), limit(100));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => mapFirestoreApp(d.id, d.data()));
    }
  } catch (error) {
    console.warn('[Firestore] Error fetching all apps:', error);
  }
  return INITIAL_APPS;
}

export async function fetchPendingApps(): Promise<StoreApp[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.APPS),
      where('status', '==', 'PENDING_REVIEW')
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => mapFirestoreApp(d.id, d.data()));
    }
  } catch (error) {
    console.warn('[Firestore] Error fetching pending apps:', error);
  }
  return [];
}

export async function adminReviewApp(
  adminUid: string,
  adminEmail: string,
  appId: string,
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED' | 'SUSPENDED' | 'BANNED',
  reviewNotes?: string,
  previousStatus?: string,
  developerId?: string
): Promise<void> {
  const appRef = doc(db, COLLECTIONS.APPS, appId);
  await setDoc(
    appRef,
    {
      status,
      reviewedBy: adminEmail || adminUid,
      reviewedByAdminUid: adminUid,
      reviewedAt: serverTimestamp(),
      reviewNotes: reviewNotes || '',
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  const caseId = generateCaseId('APP');
  await logAdminAction(
    adminUid,
    adminEmail,
    `APP_MODERATION_${status}`,
    appId,
    reviewNotes || `App status set to ${status}`,
    {
      caseId,
      applicationId: appId,
      developerId: developerId || '',
      previousStatus: previousStatus || 'UNKNOWN',
      newStatus: status,
      reviewerRole: 'ADMIN'
    }
  );
}

export async function logAdminAction(
  adminUid: string,
  adminEmail: string,
  action: string,
  targetId: string,
  details: string,
  meta?: {
    caseId?: string;
    applicationId?: string;
    developerId?: string;
    previousStatus?: string;
    newStatus?: string;
    reviewerRole?: string;
  }
): Promise<void> {
  try {
    const logRef = doc(collection(db, COLLECTIONS.AUDIT_LOGS));
    await setDoc(logRef, {
      id: logRef.id,
      timestamp: serverTimestamp(),
      adminUid: adminUid || 'admin',
      actorUid: adminUid || 'admin',
      adminEmail: adminEmail || 'admin@avanyx.store',
      action,
      targetId,
      details,
      caseId: meta?.caseId || '',
      applicationId: meta?.applicationId || targetId,
      developerId: meta?.developerId || '',
      previousStatus: meta?.previousStatus || '',
      newStatus: meta?.newStatus || '',
      reviewerRole: meta?.reviewerRole || 'ADMIN'
    });
  } catch (e) {
    console.warn('[Firestore] Audit log record notice:', e);
  }
}

export async function fetchAuditLogs(): Promise<any[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.AUDIT_LOGS),
      limit(50)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toLocaleString() : new Date().toLocaleString(),
          adminUid: data.adminUid,
          adminEmail: data.adminEmail,
          action: data.action,
          targetId: data.targetId,
          details: data.details,
          caseId: data.caseId,
          applicationId: data.applicationId,
          developerId: data.developerId,
          previousStatus: data.previousStatus,
          newStatus: data.newStatus
        };
      });
    }
  } catch (error) {
    console.warn('[Firestore] Error fetching audit logs:', error);
  }
  return [];
}

export interface AppSubmissionPayload {
  name: string;
  packageName: string;
  developer: string;
  developerUid: string;
  category: AppCategory;
  categoryId?: string;
  iconUrl: string;
  iconText?: string;
  iconBgColorHex?: string;
  bannerUrl: string;
  screenshots: string[];
  videoUrl?: string;
  sizeMb: number;
  isGame: boolean;
  downloadUrl: string; // GitHub Release APK URL
  checksumSha256: string;
  version: string;
  versionCode: number;
  changelog?: string;
  fullDescription: string;
  features: string[];
  tags: string[];
  directPublish?: boolean;
}

/**
 * 12. Submit new application into Firestore.
 * For standard developers: Sets status strictly to "PENDING_REVIEW".
 * For Admin direct publish: Sets status to "PUBLISHED" immediately.
 * Creates the initial app_versions document.
 */
export async function submitAppForReview(payload: AppSubmissionPayload): Promise<{ appId: string; versionId: string }> {
  if (!payload.developerUid) {
    throw new Error('Developer UID is required for app submission.');
  }

  const isDirectPublish = !!payload.directPublish;
  const initialStatus = isDirectPublish ? 'PUBLISHED' : 'PENDING_REVIEW';

  // Create a unique document ID for the app
  const appRef = doc(collection(db, COLLECTIONS.APPS));
  const appId = appRef.id;

  const appData = {
    id: appId,
    name: payload.name.trim(),
    developer: payload.developer.trim(),
    developerUid: payload.developerUid,
    category: payload.category,
    categoryId: payload.categoryId || payload.category.toLowerCase(),
    iconUrl: payload.iconUrl,
    iconText: payload.iconText || payload.name.substring(0, 2).toUpperCase(),
    iconBgColorHex: payload.iconBgColorHex || '#6750A4',
    bannerUrl: payload.bannerUrl,
    screenshots: payload.screenshots,
    videoUrl: payload.videoUrl || '',
    sizeMb: Number(payload.sizeMb) || 25,
    rating: 0,
    reviewCount: 0,
    downloads: '0',
    downloadCount: 0,
    isGame: payload.isGame || payload.category === 'GAMES',
    isFeatured: false,
    packageName: payload.packageName.trim(),
    downloadUrl: payload.downloadUrl.trim(), // GitHub Release APK URL
    checksumSha256: payload.checksumSha256.trim(),
    version: payload.version.trim(),
    fullDescription: payload.fullDescription.trim(),
    description: payload.fullDescription.trim(),
    features: payload.features || [],
    tags: payload.tags || ['Verified'],
    status: initialStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(appRef, appData);

  // Create corresponding app_versions document
  const versionRef = doc(collection(db, COLLECTIONS.APP_VERSIONS));
  const versionId = versionRef.id;

  const versionData = {
    id: versionId,
    appId: appId,
    versionName: payload.version.trim(),
    versionCode: Number(payload.versionCode) || 1,
    downloadUrl: payload.downloadUrl.trim(),
    changelog: payload.changelog || 'Initial release submission.',
    releaseDate: new Date().toISOString().split('T')[0],
    isMandatory: false,
    createdAt: serverTimestamp()
  };

  await setDoc(versionRef, versionData);

  if (isDirectPublish) {
    await logAdminAction(
      payload.developerUid,
      '',
      'ADMIN_DIRECT_PUBLISH_APP',
      appId,
      `App ${payload.name} (${payload.packageName}) published directly by Administrator`,
      {
        caseId: generateCaseId('APP'),
        applicationId: appId,
        developerId: payload.developerUid,
        previousStatus: 'DRAFT',
        newStatus: 'PUBLISHED',
        reviewerRole: 'ADMIN'
      }
    );
  }

  return { appId, versionId };
}

/**
 * 13. Fetch all apps submitted by a specific developer (all statuses).
 */
export async function fetchDeveloperApps(developerUid: string): Promise<StoreApp[]> {
  if (!developerUid) return [];
  try {
    const q = query(
      collection(db, COLLECTIONS.APPS),
      where('developerUid', '==', developerUid)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((docSnap) => mapFirestoreApp(docSnap.id, docSnap.data()));
    }
  } catch (error) {
    console.warn('[Firestore] Error fetching developer apps:', error);
  }
  return [];
}

/**
 * 14. Publish a new App Release Version document and update app version in apps collection.
 */
export async function publishAppReleaseVersion(params: {
  appId: string;
  version: string;
  versionCode: number;
  downloadUrl: string;
  checksumSha256?: string;
  changelog?: string;
  sizeMb?: number;
  isMandatory?: boolean;
}): Promise<string> {
  if (!params.appId) throw new Error('App ID is required.');
  if (!params.downloadUrl) throw new Error('Download URL is required.');
  
  const versionRef = doc(collection(db, COLLECTIONS.APP_VERSIONS));
  const versionData = {
    id: versionRef.id,
    appId: params.appId,
    version: params.version.trim(),
    versionName: params.version.trim(),
    versionCode: Number(params.versionCode) || 1,
    downloadUrl: params.downloadUrl.trim(),
    checksumSha256: (params.checksumSha256 || '').trim(),
    changelog: (params.changelog || 'Release update').trim(),
    releaseNotes: (params.changelog || 'Release update').trim(),
    sizeMb: Number(params.sizeMb) || 25,
    releaseDate: new Date().toISOString().split('T')[0],
    isMandatory: !!params.isMandatory,
    createdAt: serverTimestamp()
  };

  await setDoc(versionRef, versionData);

  // Update target app document with latest version
  const appRef = doc(db, COLLECTIONS.APPS, params.appId);
  await setDoc(
    appRef,
    {
      version: params.version.trim(),
      downloadUrl: params.downloadUrl.trim(),
      checksumSha256: (params.checksumSha256 || '').trim(),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  return versionRef.id;
}

/**
 * 15. Update metadata for an app owned by developer (safe fields only).
 */
export async function updateDeveloperAppMetadata(
  appId: string,
  developerUid: string,
  updates: {
    name?: string;
    category?: AppCategory;
    fullDescription?: string;
    features?: string[];
    tags?: string[];
    iconUrl?: string;
    bannerUrl?: string;
    screenshots?: string[];
    videoUrl?: string;
    downloadUrl?: string;
    checksumSha256?: string;
    sizeMb?: number;
  }
): Promise<void> {
  if (!appId || !developerUid) throw new Error('App ID and Developer UID are required.');

  const appRef = doc(db, COLLECTIONS.APPS, appId);
  const cleanUpdates: Record<string, any> = {
    updatedAt: serverTimestamp()
  };

  if (updates.name) cleanUpdates.name = updates.name.trim();
  if (updates.category) {
    cleanUpdates.category = updates.category;
    cleanUpdates.categoryId = updates.category.toLowerCase();
  }
  if (updates.fullDescription) {
    cleanUpdates.fullDescription = updates.fullDescription.trim();
    cleanUpdates.description = updates.fullDescription.trim();
  }
  if (updates.features) cleanUpdates.features = updates.features;
  if (updates.tags) cleanUpdates.tags = updates.tags;
  if (updates.iconUrl) cleanUpdates.iconUrl = updates.iconUrl.trim();
  if (updates.bannerUrl) cleanUpdates.bannerUrl = updates.bannerUrl.trim();
  if (updates.screenshots) cleanUpdates.screenshots = updates.screenshots;
  if (updates.videoUrl !== undefined) cleanUpdates.videoUrl = updates.videoUrl.trim();
  if (updates.downloadUrl) cleanUpdates.downloadUrl = updates.downloadUrl.trim();
  if (updates.checksumSha256 !== undefined) cleanUpdates.checksumSha256 = updates.checksumSha256.trim();
  if (updates.sizeMb !== undefined) cleanUpdates.sizeMb = Number(updates.sizeMb);

  await setDoc(appRef, cleanUpdates, { merge: true });
}

/**
 * 16. Resubmit a DRAFT or REJECTED application for administrative review.
 */
export async function resubmitAppForReview(
  appId: string,
  developerUid: string
): Promise<void> {
  if (!appId || !developerUid) throw new Error('App ID and Developer UID are required.');

  const appRef = doc(db, COLLECTIONS.APPS, appId);
  await setDoc(
    appRef,
    {
      status: 'PENDING_REVIEW',
      submittedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  await logAdminAction(
    developerUid,
    '',
    'RESUBMIT_APP_FOR_REVIEW',
    appId,
    `Application ${appId} was resubmitted for review by developer ${developerUid}`,
    {
      applicationId: appId,
      developerId: developerUid,
      newStatus: 'PENDING_REVIEW'
    }
  );
}

/**
 * 17. Fetch all registered developers for admin moderation.
 */
export async function fetchAllDevelopers(): Promise<DeveloperProfile[]> {
  try {
    const q = query(collection(db, COLLECTIONS.DEVELOPERS), limit(100));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          developerUid: data.developerUid || data.ownerUid || data.uid || d.id,
          displayName: data.displayName || data.developerName || 'Developer',
          organizationName: data.organizationName || '',
          shortDescription: data.shortDescription || data.description || '',
          bio: data.bio || '',
          logoUrl: data.logoUrl || data.avatarUrl || '',
          avatarUrl: data.avatarUrl || data.logoUrl || '',
          bannerUrl: data.bannerUrl || '',
          officialWebsite: data.officialWebsite || data.websiteUrl || '',
          websiteUrl: data.websiteUrl || data.officialWebsite || '',
          githubUrl: data.githubUrl || '',
          instagramUrl: data.instagramUrl || '',
          facebookUrl: data.facebookUrl || '',
          youtubeUrl: data.youtubeUrl || '',
          whatsappUrl: data.whatsappUrl || '',
          otherPublicLinks: data.otherPublicLinks || [],
          country: data.country || 'Global',
          verified: !!data.verified,
          developerStatus: data.developerStatus || (data.verified ? 'VERIFIED' : 'NONE'),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : undefined,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : undefined
        };
      });
    }
  } catch (error) {
    console.warn('[Firestore] Error fetching all developers:', error);
  }
  return [];
}

/**
 * 18. Admin action to Moderate a Developer Profile (Verify, Suspend, Restore).
 */
export async function adminModerateDeveloper(
  adminUid: string,
  adminEmail: string,
  developerId: string,
  action: 'VERIFY' | 'SUSPEND' | 'RESTORE',
  notes?: string
): Promise<void> {
  const devDocRef = doc(db, COLLECTIONS.DEVELOPERS, developerId);
  const userDocRef = doc(db, COLLECTIONS.USERS, developerId);

  let developerStatus: 'VERIFIED' | 'SUSPENDED' | 'NONE' = 'VERIFIED';
  let role: 'VERIFIED_DEVELOPER' | 'USER' = 'VERIFIED_DEVELOPER';
  let verified = true;

  if (action === 'SUSPEND') {
    developerStatus = 'SUSPENDED';
    role = 'USER';
    verified = false;
  } else if (action === 'RESTORE' || action === 'VERIFY') {
    developerStatus = 'VERIFIED';
    role = 'VERIFIED_DEVELOPER';
    verified = true;
  }

  await setDoc(
    devDocRef,
    {
      verified,
      developerStatus,
      reviewedBy: adminEmail || adminUid,
      reviewedByAdminUid: adminUid,
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  await setDoc(
    userDocRef,
    {
      role,
      realRole: role,
      developerStatus,
      verifiedDeveloper: verified,
      verificationBadge: verified ? 'VERIFIED_DEVELOPER' : 'NONE',
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  await logAdminAction(
    adminUid,
    adminEmail,
    `DEVELOPER_MODERATION_${action}`,
    developerId,
    notes || `Developer ${developerId} set to ${action}`,
    {
      developerId,
      newStatus: developerStatus,
      reviewerRole: 'ADMIN'
    }
  );
}


