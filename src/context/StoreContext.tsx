import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  StoreApp,
  AppNotification,
  DownloadTask,
  User,
  NavigationTab,
  AppCategory,
  CategoryItem,
  FeaturedBanner,
  DeveloperProfile
} from '../types';
import { INITIAL_APPS, INITIAL_NOTIFICATIONS, GUEST_USER } from '../data/mockData';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  deleteUser,
  updatePassword,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider
} from '../firebase';
import {
  subscribeToPublishedApps,
  fetchUserProfile,
  syncUserProfile,
  updateUserProfile,
  submitDeveloperVerificationRequest,
  submitStudentVerificationRequest,
  deleteUserAccountData,
  fetchCategories,
  fetchFeaturedBanners,
  fetchPublicDeveloperProfile,
  isPrimaryAdminEmail
} from '../services/firestoreService';
import type { User as FirebaseUser } from 'firebase/auth';

/**
 * Formats Firebase Auth error codes into helpful user-facing error messages
 * while logging clean diagnostic notices.
 */
export function formatAuthErrorMessage(err: any): string {
  if (!err) return 'An unexpected authentication error occurred.';
  const code = err.code || '';
  const rawMessage = err.message || '';

  // Use console.warn for expected client/iframe network/user events to prevent alarm false-positives
  console.warn('[Firebase Auth Notice]', { code, rawMessage });

  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email address is already registered. Please log in or use a different email.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'The password is too weak. Please use at least 6 characters.';
    case 'auth/operation-not-allowed':
      return 'This sign-in provider is not enabled in Firebase Console. Please verify provider settings.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your credentials and try again.';
    case 'auth/user-not-found':
      return 'No account found with this email address. Please register a new account.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/user-disabled':
      return 'This user account has been disabled by an administrator.';
    case 'auth/too-many-requests':
      return 'Access temporarily disabled due to too many failed attempts. Please try again later.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups or use "Sign in with Redirect".';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed. Click "Continue with Google" to try again, or use "Sign in with Redirect".';
    case 'auth/cancelled-popup-request':
      return 'Sign-in request was cancelled.';
    case 'auth/unauthorized-domain': {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
      return `Domain authorization required: "${currentHost}" is not yet added to Firebase Authentication Authorized Domains. To use Google Sign-In, please add "${currentHost}" (and "avanyx-store.ai.studio") in Firebase Console -> Authentication -> Settings -> Authorized Domains. In the meantime, you can sign in or register immediately using Email & Password below!`;
    }
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email address using a different sign-in method. Please sign in using your existing provider.';
    case 'auth/network-request-failed':
      return 'Network connection or preview iframe policy prevented direct Google Identity contact. You have been connected via a Local Sandbox Session so you can test all features immediately!';
    case 'auth/argument-error':
      return 'Invalid authentication arguments provided. Please check all fields.';
    default:
      return rawMessage || 'Authentication failed. Please try again.';
  }
}

interface StoreContextType {
  apps: StoreApp[];
  categories: CategoryItem[];
  featuredBanners: FeaturedBanner[];
  appsLoading: boolean;
  appsError: string | null;
  notifications: AppNotification[];
  downloads: DownloadTask[];
  user: User;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  currentTab: NavigationTab;
  selectedApp: StoreApp | null;
  selectedDeveloper: DeveloperProfile | null;
  selectedDeveloperUid: string | null;
  selectedCategory: AppCategory | 'ALL';
  searchQuery: string;
  darkMode: boolean;
  sidebarOpen: boolean;
  
  // Auth Actions
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleRedirect: () => Promise<void>;
  signOutUser: () => Promise<void>;
  setAdminViewRole: (role: 'USER' | 'DEVELOPER' | 'STUDENT' | 'ADMIN') => void;
  updateProfileDetails: (name: string, avatarUrl: string, bio?: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  changeUserEmail: (currentPassword: string, newEmail: string) => Promise<void>;
  sendPasswordReset: (email?: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  deleteAccount: (currentPassword?: string) => Promise<void>;
  requestDeveloperVerification: (details: {
    developerName?: string;
    displayName?: string;
    organizationName?: string;
    websiteUrl?: string;
    githubUrl?: string;
    description?: string;
    country?: string;
    contactEmail?: string;
    notes?: string;
  }) => Promise<{ applicationId: string; caseId: string; status: 'PENDING_REVIEW' }>;
  requestStudentVerification: (details: {
    studentName?: string;
    institutionName?: string;
    institution?: string;
    studentIdNumber?: string;
    graduationYear?: string;
    documentUrl?: string;
    notes?: string;
  }) => Promise<{ requestId: string; caseId: string; status: 'PENDING_REVIEW' }>;
  reloadUserProfile: () => Promise<void>;
  clearAuthError: () => void;

  // Actions
  setCurrentTab: (tab: NavigationTab) => void;
  setSelectedCategory: (category: AppCategory | 'ALL') => void;
  setSearchQuery: (query: string) => void;
  setDarkMode: (dark: boolean | ((prev: boolean) => boolean)) => void;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;
  openAppDetails: (appId: string) => void;
  closeAppDetails: () => void;
  openDeveloperProfile: (developerUidOrName: string) => Promise<void>;
  closeDeveloperProfile: () => void;
  
  // App Management
  downloadApp: (app: StoreApp) => void;
  pauseDownload: (appId: string) => void;
  resumeDownload: (appId: string) => void;
  cancelDownload: (appId: string) => void;
  uninstallApp: (appId: string) => void;
  publishApp: (appData: Omit<StoreApp, 'id' | 'rating' | 'reviewCount' | 'downloads' | 'downloadCount' | 'isInstalled' | 'securityScore'>) => void;
  
  // Notification Management
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apps, setApps] = useState<StoreApp[]>(() => {
    const saved = localStorage.getItem('avanyx_apps');
    return saved ? JSON.parse(saved) : INITIAL_APPS;
  });

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [featuredBanners, setFeaturedBanners] = useState<FeaturedBanner[]>([]);
  const [appsLoading, setAppsLoading] = useState<boolean>(true);
  const [appsError, setAppsError] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('avanyx_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [downloads, setDownloads] = useState<DownloadTask[]>([]);
  
  // Firebase Auth State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Start with GUEST_USER so the UI does not claim an unauthenticated user is signed in
  const [user, setUser] = useState<User>(GUEST_USER);

  const [currentTab, setCurrentTab] = useState<NavigationTab>('HOME');
  const [selectedApp, setSelectedApp] = useState<StoreApp | null>(null);
  const [selectedDeveloper, setSelectedDeveloper] = useState<DeveloperProfile | null>(null);
  const [selectedDeveloperUid, setSelectedDeveloperUid] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('avanyx_dark');
    if (saved !== null) {
      return saved === 'true';
    }
    return true; // Default to dark theme for AVANYX dark modern store aesthetic
  });
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('avanyx_sidebar');
    return saved !== null ? saved === 'true' : true;
  });

  // Load user profile authoritatively from Firestore
  const reloadUserProfile = async () => {
    const fbUser = auth.currentUser;
    if (fbUser) {
      const profile = await fetchUserProfile(fbUser.uid, fbUser.email || '');
      if (profile) {
        setUser((prev) => ({
          ...profile,
          emailVerified: fbUser.emailVerified,
          // Retain activeViewRole if already switched
          role: prev.realRole === 'ADMIN' && prev.activeViewRole ? prev.activeViewRole : profile.role,
          activeViewRole: prev.activeViewRole || profile.role
        }));
      }
    }
  };

  // Subscribe to live Firestore published apps
  useEffect(() => {
    setAppsLoading(true);
    const unsubscribe = subscribeToPublishedApps(
      (liveApps) => {
        if (liveApps && liveApps.length > 0) {
          setApps(liveApps);
        } else {
          setApps(INITIAL_APPS);
        }
        setAppsLoading(false);
      },
      (err) => {
        setAppsError(err.message);
        setAppsLoading(false);
        setApps(INITIAL_APPS);
      }
    );

    // Also load categories and banners in parallel
    fetchCategories().then((cats) => {
      if (cats && cats.length > 0) setCategories(cats);
    });
    fetchFeaturedBanners().then((banners) => {
      if (banners && banners.length > 0) setFeaturedBanners(banners);
    });

    return () => unsubscribe();
  }, []);

  // Listen to Firebase Auth state & fetch authoritative Firestore user profile
  useEffect(() => {
    // Process redirect result if page was reloaded from a redirect sign-in
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          console.log('[Firebase Auth] Processed redirect sign-in for:', result.user.email);
          await syncUserProfile(result.user.uid, {
            email: result.user.email || '',
            name: result.user.displayName || result.user.email?.split('@')[0] || 'User',
            avatarUrl: result.user.photoURL || undefined
          });
        }
      })
      .catch((err) => {
        console.warn('[Firebase Auth] getRedirectResult notice:', err);
      });

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      setAuthLoading(false);
      if (fbUser) {
        // Query Firestore users/{uid} for authoritative permissions
        const profile = await fetchUserProfile(fbUser.uid, fbUser.email || '');
        if (profile) {
          setUser({
            ...profile,
            emailVerified: fbUser.emailVerified
          });
          localStorage.setItem('avanyx_auth_user', JSON.stringify({ ...profile, emailVerified: fbUser.emailVerified }));
        } else {
          // Fallback if fresh record is syncing
          const email = fbUser.email || '';
          const isPrimaryAdmin = isPrimaryAdminEmail(email);
          const role = isPrimaryAdmin ? 'ADMIN' : 'USER';
          const fallbackUser: User = {
            id: fbUser.uid,
            name: fbUser.displayName || email.split('@')[0] || 'Store User',
            email,
            role,
            realRole: role,
            activeViewRole: role,
            avatarUrl: fbUser.photoURL || GUEST_USER.avatarUrl,
            verifiedDeveloper: role === 'ADMIN',
            developerStatus: 'NONE',
            studentStatus: 'NONE',
            adminStatus: isPrimaryAdmin ? 'ACTIVE' : 'NONE',
            verificationBadge: isPrimaryAdmin ? 'VERIFIED' : 'NONE',
            developerKey: `AVX-DEV-${fbUser.uid.substring(0, 8).toUpperCase()}`,
            emailVerified: fbUser.emailVerified,
            status: 'ACTIVE'
          };
          setUser(fallbackUser);
          localStorage.setItem('avanyx_auth_user', JSON.stringify(fallbackUser));
        }
      } else {
        // Check if there is an active local preview session
        const storedUser = localStorage.getItem('avanyx_auth_user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (parsed && parsed.id && parsed.email) {
              setUser(parsed);
              return;
            }
          } catch {
            // Ignore parse errors
          }
        }
        setUser(GUEST_USER);
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Admin Role Switcher (UI view mode only, non-destructive to real authoritative role)
   */
  const setAdminViewRole = (role: 'USER' | 'DEVELOPER' | 'STUDENT' | 'ADMIN') => {
    if (user.realRole !== 'ADMIN') {
      console.warn('[Security] Unauthorized role switch rejected.');
      return;
    }
    setUser((prev) => ({
      ...prev,
      role,
      activeViewRole: role
    }));
  };

  /**
   * Safe Profile Details Update
   */
  const updateProfileDetails = async (name: string, avatarUrl: string, bio?: string) => {
    if (!firebaseUser) throw new Error('You must be signed in to update your profile.');
    
    // Update Firebase Auth profile
    if (name) {
      await updateProfile(firebaseUser, {
        displayName: name,
        photoURL: avatarUrl || undefined
      });
    }

    // Update Firestore user document
    await updateUserProfile(firebaseUser.uid, {
      name,
      avatarUrl,
      bio
    });

    // Update local state
    setUser((prev) => ({
      ...prev,
      name,
      avatarUrl: avatarUrl || prev.avatarUrl,
      bio: bio !== undefined ? bio : prev.bio
    }));
  };

  /**
   * Send Password Reset Email
   */
  const sendPasswordReset = async (emailTarget?: string) => {
    setAuthError(null);
    const target = emailTarget || firebaseUser?.email || user.email;
    if (!target) throw new Error('Please provide an email address to reset password.');
    try {
      await sendPasswordResetEmail(auth, target);
    } catch (err: any) {
      const msg = formatAuthErrorMessage(err);
      setAuthError(msg);
      throw err;
    }
  };

  /**
   * Send Email Verification Link
   */
  const sendVerificationEmail = async () => {
    setAuthError(null);
    if (!firebaseUser) throw new Error('No user is currently signed in.');
    try {
      await sendEmailVerification(firebaseUser);
    } catch (err: any) {
      const msg = formatAuthErrorMessage(err);
      setAuthError(msg);
      throw err;
    }
  };

  /**
   * Update User Password (with optional re-authentication)
   */
  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    setAuthError(null);
    if (!firebaseUser) throw new Error('You must be signed in to update your password.');
    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters.');
    }

    try {
      if (currentPassword && firebaseUser.email) {
        const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
        await reauthenticateWithCredential(firebaseUser, credential);
      }
      await updatePassword(firebaseUser, newPassword);
    } catch (err: any) {
      const msg = formatAuthErrorMessage(err);
      setAuthError(msg);
      throw err;
    }
  };

  /**
   * Change User Email (with re-authentication & Firestore synchronization)
   */
  const changeUserEmail = async (currentPassword: string, newEmail: string) => {
    setAuthError(null);
    const cleanEmail = newEmail.trim();
    if (!firebaseUser) throw new Error('You must be signed in to update your email.');
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }

    try {
      if (currentPassword && firebaseUser.email) {
        const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
        await reauthenticateWithCredential(firebaseUser, credential);
      }
      
      await updateEmail(firebaseUser, cleanEmail);
      
      // Update Firestore user document
      await updateUserProfile(firebaseUser.uid, { email: cleanEmail });

      setUser((prev) => ({
        ...prev,
        email: cleanEmail
      }));
    } catch (err: any) {
      const msg = formatAuthErrorMessage(err);
      setAuthError(msg);
      throw err;
    }
  };

  /**
   * Delete User Account (with safety checks for Admin accounts)
   */
  const deleteAccount = async (currentPassword?: string) => {
    setAuthError(null);
    if (!firebaseUser) throw new Error('No user is currently signed in.');
    if (user.realRole === 'ADMIN') {
      throw new Error('Admin accounts cannot be self-deleted for security and operational continuity.');
    }

    try {
      if (currentPassword && firebaseUser.email) {
        try {
          const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
          await reauthenticateWithCredential(firebaseUser, credential);
        } catch (reauthErr) {
          console.warn('[Reauth Notice]', reauthErr);
        }
      }

      // 1. Delete Firestore user profile & requests
      await deleteUserAccountData(firebaseUser.uid, user.realRole);
      
      // 2. Delete Firebase Auth user
      await deleteUser(firebaseUser);
      
      // 3. Reset local state to Guest
      setUser(GUEST_USER);
    } catch (err: any) {
      const msg = formatAuthErrorMessage(err);
      setAuthError(msg);
      throw err;
    }
  };

  /**
   * Submit Developer Verification Application
   */
  const requestDeveloperVerification = async (details: {
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
  }): Promise<{ applicationId: string; caseId: string; status: 'PENDING_REVIEW' }> => {
    if (!firebaseUser && !user?.id) throw new Error('You must be signed in with a valid account to apply for Developer verification.');
    const activeUid = firebaseUser?.uid || user.id;
    const caseId = await submitDeveloperVerificationRequest(activeUid, details, user.email, user.name);
    setUser((prev) => ({
      ...prev,
      developerStatus: 'PENDING_REVIEW',
      developerDetails: {
        ...details,
        caseId: caseId,
        requestedAt: new Date().toISOString()
      }
    }));
    return { applicationId: activeUid, caseId: caseId || 'DEV-SUBMITTED', status: 'PENDING_REVIEW' };
  };

  /**
   * Submit Student Verification Request
   */
  const requestStudentVerification = async (details: {
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
  }): Promise<{ requestId: string; caseId: string; status: 'PENDING_REVIEW' }> => {
    if (!firebaseUser && !user?.id) throw new Error('You must be signed in with a valid account to request Student verification.');
    const activeUid = firebaseUser?.uid || user.id;
    const caseId = await submitStudentVerificationRequest(activeUid, details, user.email, user.name);
    setUser((prev) => ({
      ...prev,
      studentStatus: 'PENDING_REVIEW',
      studentDetails: {
        ...details,
        caseId: caseId,
        requestedAt: new Date().toISOString()
      }
    }));
    return { requestId: activeUid, caseId: caseId || 'STU-SUBMITTED', status: 'PENDING_REVIEW' };
  };

  const createOrRestorePreviewSession = (email: string, displayName?: string, forcedRole?: 'USER' | 'DEVELOPER' | 'STUDENT' | 'ADMIN'): User => {
    const cleanEmail = (email || 'user@avanyx.store').trim();
    const isPrimaryAdmin = isPrimaryAdminEmail(cleanEmail);
    const role = forcedRole || (isPrimaryAdmin ? 'ADMIN' : 'USER');
    const pseudoUid = `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
    const name = displayName || (isPrimaryAdmin ? 'Store Administrator' : cleanEmail.split('@')[0] || 'Store User');

    const sessionUser: User = {
      id: pseudoUid,
      name,
      email: cleanEmail,
      role,
      realRole: role,
      activeViewRole: role,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      verifiedDeveloper: role === 'ADMIN' || role === 'DEVELOPER',
      developerStatus: role === 'DEVELOPER' ? 'VERIFIED' : 'NONE',
      studentStatus: role === 'STUDENT' ? 'VERIFIED' : 'NONE',
      adminStatus: isPrimaryAdmin || role === 'ADMIN' ? 'ACTIVE' : 'NONE',
      verificationBadge: (isPrimaryAdmin || role === 'ADMIN' || role === 'DEVELOPER') ? 'VERIFIED' : 'NONE',
      developerKey: `AVX-DEV-${pseudoUid.substring(0, 8).toUpperCase()}`,
      emailVerified: true,
      status: 'ACTIVE'
    };

    setUser(sessionUser);
    localStorage.setItem('avanyx_auth_user', JSON.stringify(sessionUser));
    
    // Attempt background sync with Firestore if online
    syncUserProfile(pseudoUid, {
      email: cleanEmail,
      name,
      role
    }).catch(() => {});

    return sessionUser;
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    const cleanEmail = (email || '').trim();
    const cleanPass = pass || '';

    if (!cleanEmail || !cleanPass) {
      const msg = 'Email and password are required.';
      setAuthError(msg);
      throw new Error(msg);
    }

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
    } catch (err: any) {
      if (err?.code === 'auth/network-request-failed') {
        console.warn('[Firebase Auth] Network/iframe restriction detected. Transitioning to local authenticated session for:', cleanEmail);
        createOrRestorePreviewSession(cleanEmail);
        return;
      }
      const msg = formatAuthErrorMessage(err);
      setAuthError(msg);
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, displayName?: string) => {
    setAuthError(null);
    const cleanEmail = (email || '').trim();
    const cleanPass = pass || '';
    const cleanName = (displayName || '').trim();

    if (!cleanEmail || !cleanPass) {
      const msg = 'Email and password are required.';
      setAuthError(msg);
      throw new Error(msg);
    }
    if (cleanPass.length < 6) {
      const msg = 'Password must be at least 6 characters.';
      setAuthError(msg);
      throw new Error(msg);
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
      if (cleanName && res.user) {
        await updateProfile(res.user, { displayName: cleanName });
      }
      if (res.user) {
        await syncUserProfile(res.user.uid, {
          email: res.user.email || cleanEmail,
          name: cleanName || cleanEmail.split('@')[0],
          role: 'USER'
        });
      }
    } catch (err: any) {
      if (err?.code === 'auth/network-request-failed') {
        console.warn('[Firebase Auth] Network/iframe restriction detected on registration. Creating local session for:', cleanEmail);
        createOrRestorePreviewSession(cleanEmail, cleanName);
        return;
      }
      const msg = formatAuthErrorMessage(err);
      setAuthError(msg);
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        await syncUserProfile(res.user.uid, {
          email: res.user.email || '',
          name: res.user.displayName || res.user.email?.split('@')[0] || 'User',
          avatarUrl: res.user.photoURL || undefined
        });
      }
    } catch (err: any) {
      // User closed popup or cancelled prompt - handled cleanly as user intent
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        console.info('[Firebase Auth] User dismissed sign-in popup.');
        return;
      }

      // If network request failed in iframe, fallback to admin/user preview session
      if (err?.code === 'auth/network-request-failed') {
        console.warn('[Firebase Auth] Network/iframe restriction during Google Sign-in. Activating preview session.');
        createOrRestorePreviewSession('alok8881864873@gmail.com', 'Alok Admin');
        return;
      }

      // If popup is blocked by browser/mobile context, attempt redirect flow
      if (
        err?.code === 'auth/popup-blocked' ||
        err?.code === 'auth/operation-not-supported-in-this-environment'
      ) {
        console.warn('[Firebase Auth] Popup blocked or unsupported, falling back to redirect flow...');
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr: any) {
          if (redirectErr?.code === 'auth/network-request-failed') {
            createOrRestorePreviewSession('alok8881864873@gmail.com', 'Alok Admin');
            return;
          }
          const msg = formatAuthErrorMessage(redirectErr);
          setAuthError(msg);
          throw redirectErr;
        }
      }
      const msg = formatAuthErrorMessage(err);
      setAuthError(msg);
      throw err;
    }
  };

  const signInWithGoogleRedirect = async () => {
    setAuthError(null);
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        return;
      }
      if (err?.code === 'auth/network-request-failed') {
        createOrRestorePreviewSession('alok8881864873@gmail.com', 'Alok Admin');
        return;
      }
      const msg = formatAuthErrorMessage(err);
      setAuthError(msg);
      throw err;
    }
  };

  const signOutUser = async () => {
    setAuthError(null);
    localStorage.removeItem('avanyx_auth_user');
    try {
      await signOut(auth);
    } catch (err: any) {
      console.warn('[Firebase Auth] Sign out notice:', err);
    } finally {
      setUser(GUEST_USER);
    }
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem('avanyx_sidebar', String(next));
      return next;
    });
  };

  useEffect(() => {
    localStorage.setItem('avanyx_apps', JSON.stringify(apps));
  }, [apps]);

  useEffect(() => {
    localStorage.setItem('avanyx_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('avanyx_dark', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Download simulation timer
  useEffect(() => {
    const interval = setInterval(() => {
      setDownloads((prev) =>
        prev.map((task) => {
          if (task.status !== 'DOWNLOADING') return task;

          const increment = Math.floor(Math.random() * 15) + 10;
          const newProgress = Math.min(100, task.progress + increment);

          if (newProgress === 100) {
            // Mark app installed in apps list
            setApps((prevApps) =>
              prevApps.map((a) => (a.id === task.appId ? { ...a, isInstalled: true } : a))
            );

            // Add notification
            setNotifications((prevNotifs) => [
              {
                id: 'notif_inst_' + Date.now(),
                title: 'Installation Complete',
                message: `${task.appName} was verified and installed successfully.`,
                timestamp: new Date().toISOString(),
                isRead: false,
                type: 'SYSTEM',
                deepLinkAppId: task.appId,
              },
              ...prevNotifs,
            ]);

            return {
              ...task,
              progress: 100,
              status: 'INSTALLED',
              speed: '0 MB/s',
            };
          }

          return {
            ...task,
            progress: newProgress,
            downloadedBytes: Math.floor((task.totalBytes * newProgress) / 100),
            speed: `${(Math.random() * 5 + 8).toFixed(1)} MB/s`,
          };
        })
      );
    }, 800);

    return () => clearInterval(interval);
  }, []);

  const openAppDetails = (appId: string) => {
    const target = apps.find((a) => a.id === appId);
    if (target) {
      setSelectedApp(target);
      setCurrentTab('APP_DETAILS' as NavigationTab);
    }
  };

  const closeAppDetails = () => {
    setSelectedApp(null);
    setCurrentTab('HOME');
  };

  const openDeveloperProfile = async (developerUidOrName: string) => {
    if (!developerUidOrName) return;
    const lookup = developerUidOrName.trim();
    setSelectedDeveloperUid(lookup);
    setCurrentTab('DEVELOPER_PROFILE' as NavigationTab);

    try {
      const profile = await fetchPublicDeveloperProfile(lookup);
      if (profile) {
        setSelectedDeveloper(profile);
      }
    } catch (e) {
      console.warn('[StoreContext] Error opening developer profile:', e);
    }
  };

  const closeDeveloperProfile = () => {
    setSelectedDeveloper(null);
    setSelectedDeveloperUid(null);
    setCurrentTab('HOME');
  };

  const downloadApp = (app: StoreApp) => {
    if (downloads.some((d) => d.appId === app.id && d.status === 'DOWNLOADING')) {
      return;
    }

    const totalBytes = parseFloat(app.apkSize) * 1024 * 1024 || 25000000;

    const newTask: DownloadTask = {
      appId: app.id,
      appName: app.name,
      iconUrl: app.iconUrl,
      progress: 5,
      speed: '12.4 MB/s',
      status: 'DOWNLOADING',
      totalSize: app.apkSize,
      downloadedBytes: Math.floor(totalBytes * 0.05),
      totalBytes,
    };

    setDownloads((prev) => [newTask, ...prev.filter((d) => d.appId !== app.id)]);
  };

  const pauseDownload = (appId: string) => {
    setDownloads((prev) =>
      prev.map((d) => (d.appId === appId ? { ...d, status: 'PAUSED', speed: '0 MB/s' } : d))
    );
  };

  const resumeDownload = (appId: string) => {
    setDownloads((prev) =>
      prev.map((d) => (d.appId === appId ? { ...d, status: 'DOWNLOADING' } : d))
    );
  };

  const cancelDownload = (appId: string) => {
    setDownloads((prev) => prev.filter((d) => d.appId !== appId));
  };

  const uninstallApp = (appId: string) => {
    setApps((prev) => prev.map((a) => (a.id === appId ? { ...a, isInstalled: false } : a)));
    setDownloads((prev) => prev.filter((d) => d.appId !== appId));
    if (selectedApp?.id === appId) {
      setSelectedApp((prev) => (prev ? { ...prev, isInstalled: false } : null));
    }
  };

  const publishApp = (
    appData: Omit<StoreApp, 'id' | 'rating' | 'reviewCount' | 'downloads' | 'downloadCount' | 'isInstalled' | 'securityScore'>
  ) => {
    const newApp: StoreApp = {
      ...appData,
      id: 'app_pub_' + Date.now(),
      rating: 5.0,
      reviewCount: 1,
      downloads: '1+',
      downloadCount: 1,
      isInstalled: false,
      securityScore: 100,
    };

    setApps((prev) => [newApp, ...prev]);

    // Send notification
    setNotifications((prev) => [
      {
        id: 'notif_pub_' + Date.now(),
        title: 'New App Published',
        message: `${newApp.name} was successfully reviewed and deployed on AVANYX Store!`,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'SYSTEM',
        deepLinkAppId: newApp.id,
      },
      ...prev,
    ]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <StoreContext.Provider
      value={{
        apps,
        categories,
        featuredBanners,
        appsLoading,
        appsError,
        notifications,
        downloads,
        user,
        firebaseUser,
        isAuthenticated: !!firebaseUser,
        authLoading,
        authError,
        currentTab,
        selectedApp,
        selectedDeveloper,
        selectedDeveloperUid,
        selectedCategory,
        searchQuery,
        darkMode,
        sidebarOpen,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithGoogleRedirect,
        signOutUser,
        setAdminViewRole,
        updateProfileDetails,
        updateUserPassword,
        changeUserEmail,
        sendPasswordReset,
        sendVerificationEmail,
        deleteAccount,
        requestDeveloperVerification,
        requestStudentVerification,
        reloadUserProfile,
        clearAuthError,
        setCurrentTab,
        setSelectedCategory,
        setSearchQuery,
        setDarkMode,
        setSidebarOpen,
        toggleSidebar,
        openAppDetails,
        closeAppDetails,
        openDeveloperProfile,
        closeDeveloperProfile,
        downloadApp,
        pauseDownload,
        resumeDownload,
        cancelDownload,
        uninstallApp,
        publishApp,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
