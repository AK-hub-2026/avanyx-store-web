import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { AppCategory, StoreApp, DeveloperProfile, AppVersionDoc } from '../types';
import {
  Terminal,
  UploadCloud,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Layers,
  Image as ImageIcon,
  Film,
  Lock,
  AlertCircle,
  FileCode,
  Github,
  Loader2,
  ExternalLink,
  Plus,
  Trash2,
  Eye,
  Building2,
  UserCheck,
  Tag,
  Globe,
  Instagram,
  Facebook,
  Youtube,
  MessageCircle,
  Link as LinkIcon,
  Check,
  RefreshCw,
  Clock,
  Send,
  Sliders,
  Copy,
  ChevronRight,
  ShieldAlert,
  Download,
  Info,
  X
} from 'lucide-react';
import { uploadMediaToSupabase, SUPABASE_BUCKETS, SupabaseBucketName } from '../services/supabaseStorage';
import {
  submitAppForReview,
  fetchDeveloperApps,
  isPrimaryAdminEmail,
  fetchPublicDeveloperProfile,
  savePublicDeveloperProfile,
  publishAppReleaseVersion,
  fetchAppVersions,
  updateDeveloperAppMetadata,
  resubmitAppForReview
} from '../services/firestoreService';

type DevConsoleTab =
  | 'DASHBOARD'
  | 'PROFILE'
  | 'APPLICATIONS'
  | 'RELEASES'
  | 'SUBMIT'
  | 'MEDIA'
  | 'MODERATION';

export const DeveloperConsoleScreen: React.FC = () => {
  const { user, isAuthenticated, firebaseUser, setCurrentTab, openAppDetails, openDeveloperProfile } = useStore();

  const [activeConsoleTab, setActiveConsoleTab] = useState<DevConsoleTab>('DASHBOARD');

  // --- Developer Profile State ---
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    displayName: user.name || '',
    organizationName: '',
    shortDescription: user.bio || '',
    country: '',
    officialWebsite: '',
    githubUrl: '',
    instagramUrl: '',
    facebookUrl: '',
    youtubeUrl: '',
    whatsappUrl: '',
    logoUrl: '',
    bannerUrl: '',
    otherPublicLinks: [] as Array<{ label: string; url: string }>
  });
  const [newCustomLink, setNewCustomLink] = useState({ label: '', url: '' });

  // --- Developer Apps List & Management State ---
  const [developerApps, setDeveloperApps] = useState<StoreApp[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [appsFilter, setAppsFilter] = useState<'ALL' | 'PUBLISHED' | 'PENDING' | 'DRAFT'>('ALL');

  // App Metadata Editor Modal State (Requirement 11)
  const [editingApp, setEditingApp] = useState<StoreApp | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: 'PRODUCTIVITY' as AppCategory,
    fullDescription: '',
    featuresText: '',
    tagsText: '',
    iconUrl: '',
    bannerUrl: '',
    downloadUrl: '',
    checksumSha256: '',
    sizeMb: '25.0',
    videoUrl: ''
  });
  const [isSavingMetadata, setIsSavingMetadata] = useState(false);
  const [metadataSuccess, setMetadataSuccess] = useState<string | null>(null);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  // Moderation Feedback Modal State
  const [moderationInfoApp, setModerationInfoApp] = useState<StoreApp | null>(null);

  // Resubmit Application State
  const [resubmittingAppId, setResubmittingAppId] = useState<string | null>(null);
  const [resubmitSuccessMsg, setResubmitSuccessMsg] = useState<string | null>(null);
  const [resubmitErrorMsg, setResubmitErrorMsg] = useState<string | null>(null);

  // --- App Releases State ---
  const [selectedReleaseAppId, setSelectedReleaseAppId] = useState<string>('');
  const [releaseVersion, setReleaseVersion] = useState('1.1.0');
  const [releaseVersionCode, setReleaseVersionCode] = useState('2');
  const [releaseDownloadUrl, setReleaseDownloadUrl] = useState('');
  const [releaseChecksum, setReleaseChecksum] = useState('');
  const [releaseSizeMb, setReleaseSizeMb] = useState('25.0');
  const [releaseChangelog, setReleaseChangelog] = useState('Stability improvements and performance optimizations.');
  const [releaseIsMandatory, setReleaseIsMandatory] = useState(false);
  const [isPublishingRelease, setIsPublishingRelease] = useState(false);
  const [releaseSuccessMsg, setReleaseSuccessMsg] = useState<string | null>(null);
  const [releaseErrorMsg, setReleaseErrorMsg] = useState<string | null>(null);
  const [appVersionsList, setAppVersionsList] = useState<AppVersionDoc[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  // --- App Submission Form State ---
  const [name, setName] = useState('');
  const [packageName, setPackageName] = useState('');
  const [developerName, setDeveloperName] = useState(user.name);
  const [category, setCategory] = useState<AppCategory>('PRODUCTIVITY');
  const [isGame, setIsGame] = useState(false);
  const [version, setVersion] = useState('1.0.0');
  const [versionCode, setVersionCode] = useState('1');
  const [sizeMb, setSizeMb] = useState('24.5');
  const [fullDescription, setFullDescription] = useState('');
  const [featuresText, setFeaturesText] = useState('Clean modern interface\nOptimized battery performance\nZero tracking privacy');
  const [changelog, setChangelog] = useState('Initial production release on Avanyx Store.');
  const [tagsText, setTagsText] = useState('Verified, High Performance, Android');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [checksumSha256, setChecksumSha256] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');

  // Uploading / Submission Feedback
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);

  // --- Media Assets Hub State ---
  const [selectedBucket, setSelectedBucket] = useState<SupabaseBucketName>(SUPABASE_BUCKETS.APP_ICONS);
  const [isUploadingMediaAsset, setIsUploadingMediaAsset] = useState(false);
  const [mediaAssetSuccessUrl, setMediaAssetSuccessUrl] = useState<string | null>(null);
  const [mediaAssetError, setMediaAssetError] = useState<string | null>(null);
  const [uploadedAssetsHistory, setUploadedAssetsHistory] = useState<Array<{ name: string; url: string; bucket: string }>>([]);

  const iconInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);
  const profileLogoInputRef = useRef<HTMLInputElement>(null);
  const profileBannerInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user.role === 'ADMIN' || user.realRole === 'ADMIN' || isPrimaryAdminEmail(user.email);
  const isAuthorized =
    isAuthenticated &&
    (isAdmin ||
      user.role === 'DEVELOPER' ||
      user.realRole === 'DEVELOPER' ||
      user.role === 'VERIFIED_DEVELOPER' ||
      user.developerStatus === 'VERIFIED');
  const activeUid = firebaseUser?.uid || user.id;

  // Load Developer Profile
  useEffect(() => {
    if (activeUid && isAuthorized) {
      setProfileLoading(true);
      fetchPublicDeveloperProfile(activeUid)
        .then((prof) => {
          if (prof) {
            setProfileForm({
              displayName: prof.displayName || user.name || '',
              organizationName: prof.organizationName || '',
              shortDescription: prof.shortDescription || prof.bio || user.bio || '',
              country: prof.country || '',
              officialWebsite: prof.officialWebsite || prof.websiteUrl || '',
              githubUrl: prof.githubUrl || '',
              instagramUrl: prof.instagramUrl || '',
              facebookUrl: prof.facebookUrl || '',
              youtubeUrl: prof.youtubeUrl || '',
              whatsappUrl: prof.whatsappUrl || '',
              logoUrl: prof.logoUrl || prof.avatarUrl || '',
              bannerUrl: prof.bannerUrl || '',
              otherPublicLinks: prof.otherPublicLinks || []
            });
          }
        })
        .catch((e) => console.warn('[DeveloperConsole] Profile fetch notice:', e))
        .finally(() => setProfileLoading(false));
    }
  }, [activeUid, isAuthorized, user.name, user.bio]);

  // Load developer's submitted apps
  const reloadApps = () => {
    if (activeUid && isAuthorized) {
      setLoadingApps(true);
      fetchDeveloperApps(activeUid)
        .then((apps) => {
          setDeveloperApps(apps);
          if (apps.length > 0 && !selectedReleaseAppId) {
            setSelectedReleaseAppId(apps[0].id);
          }
        })
        .finally(() => setLoadingApps(false));
    }
  };

  useEffect(() => {
    reloadApps();
  }, [activeUid, isAuthorized, submittedAppId]);

  // Load release versions when selected app changes
  useEffect(() => {
    if (selectedReleaseAppId) {
      setLoadingVersions(true);
      fetchAppVersions(selectedReleaseAppId)
        .then((vers) => setAppVersionsList(vers))
        .catch((err) => console.warn('[DeveloperConsole] Error loading app versions:', err))
        .finally(() => setLoadingVersions(false));
    } else {
      setAppVersionsList([]);
    }
  }, [selectedReleaseAppId]);

  // Calculate Profile Completion Score
  const calculateProfileCompletion = () => {
    let score = 0;
    if (profileForm.displayName.trim()) score += 20;
    if (profileForm.organizationName.trim()) score += 15;
    if (profileForm.shortDescription.trim()) score += 15;
    if (profileForm.logoUrl.trim()) score += 15;
    if (profileForm.bannerUrl.trim()) score += 15;
    if (profileForm.officialWebsite.trim() || profileForm.githubUrl.trim()) score += 10;
    if (profileForm.country.trim()) score += 10;
    return Math.min(100, score);
  };

  // --- Handlers: Developer Profile ---
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUid) return;
    setProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      await savePublicDeveloperProfile(activeUid, {
        displayName: profileForm.displayName,
        organizationName: profileForm.organizationName,
        shortDescription: profileForm.shortDescription,
        bio: profileForm.shortDescription,
        country: profileForm.country,
        officialWebsite: profileForm.officialWebsite,
        websiteUrl: profileForm.officialWebsite,
        githubUrl: profileForm.githubUrl,
        instagramUrl: profileForm.instagramUrl,
        facebookUrl: profileForm.facebookUrl,
        youtubeUrl: profileForm.youtubeUrl,
        whatsappUrl: profileForm.whatsappUrl,
        logoUrl: profileForm.logoUrl,
        avatarUrl: profileForm.logoUrl,
        bannerUrl: profileForm.bannerUrl,
        otherPublicLinks: profileForm.otherPublicLinks
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 4000);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to save developer profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddCustomLink = () => {
    if (!newCustomLink.label.trim() || !newCustomLink.url.trim()) return;
    setProfileForm((prev) => ({
      ...prev,
      otherPublicLinks: [...prev.otherPublicLinks, { label: newCustomLink.label.trim(), url: newCustomLink.url.trim() }]
    }));
    setNewCustomLink({ label: '', url: '' });
  };

  const handleRemoveCustomLink = (index: number) => {
    setProfileForm((prev) => ({
      ...prev,
      otherPublicLinks: prev.otherPublicLinks.filter((_, i) => i !== index)
    }));
  };

  // --- Handlers: File Uploads for Profile ---
  const handleProfileLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUid) return;
    try {
      const res = await uploadMediaToSupabase(SUPABASE_BUCKETS.DEVELOPER_PROFILE, file, activeUid);
      setProfileForm((prev) => ({ ...prev, logoUrl: res.publicUrl }));
    } catch (err: any) {
      setProfileError(err.message || 'Logo upload failed');
    }
  };

  const handleProfileBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUid) return;
    try {
      const res = await uploadMediaToSupabase(SUPABASE_BUCKETS.DEVELOPER_BANNER, file, activeUid);
      setProfileForm((prev) => ({ ...prev, bannerUrl: res.publicUrl }));
    } catch (err: any) {
      setProfileError(err.message || 'Banner upload failed');
    }
  };

  // --- Handlers: App Metadata Management (Requirement 11) ---
  const handleOpenEditModal = (app: StoreApp) => {
    setEditingApp(app);
    setEditForm({
      name: app.name || '',
      category: (app.category as AppCategory) || 'PRODUCTIVITY',
      fullDescription: app.fullDescription || app.description || '',
      featuresText: (app.features || []).join('\n'),
      tagsText: (app.tags || []).join(', '),
      iconUrl: app.iconUrl || '',
      bannerUrl: app.bannerUrl || '',
      downloadUrl: app.downloadUrl || '',
      checksumSha256: app.sha256Checksum || app.checksumSha256 || '',
      sizeMb: app.apkSize ? app.apkSize.replace(/[^0-9.]/g, '') : '25.0',
      videoUrl: app.videoUrl || ''
    });
    setMetadataSuccess(null);
    setMetadataError(null);
  };

  const handleSaveAppMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp || !activeUid) return;

    setIsSavingMetadata(true);
    setMetadataError(null);
    setMetadataSuccess(null);

    try {
      const features = editForm.featuresText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const tags = editForm.tagsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await updateDeveloperAppMetadata(editingApp.id, activeUid, {
        name: editForm.name,
        category: editForm.category,
        fullDescription: editForm.fullDescription,
        features,
        tags,
        iconUrl: editForm.iconUrl,
        bannerUrl: editForm.bannerUrl,
        downloadUrl: editForm.downloadUrl,
        checksumSha256: editForm.checksumSha256,
        sizeMb: parseFloat(editForm.sizeMb) || 25,
        videoUrl: editForm.videoUrl
      });

      setMetadataSuccess('App details updated successfully!');
      reloadApps();
      setTimeout(() => {
        setEditingApp(null);
        setMetadataSuccess(null);
      }, 1500);
    } catch (err: any) {
      setMetadataError(err.message || 'Failed to update app metadata.');
    } finally {
      setIsSavingMetadata(false);
    }
  };

  const handleResubmitApp = async (app: StoreApp) => {
    if (!activeUid) return;
    setResubmittingAppId(app.id);
    setResubmitErrorMsg(null);
    setResubmitSuccessMsg(null);

    try {
      await resubmitAppForReview(app.id, activeUid);
      setResubmitSuccessMsg(`"${app.name}" has been resubmitted for Admin review.`);
      reloadApps();
      setTimeout(() => setResubmitSuccessMsg(null), 4000);
    } catch (err: any) {
      setResubmitErrorMsg(err.message || 'Failed to resubmit application.');
      setTimeout(() => setResubmitErrorMsg(null), 4000);
    } finally {
      setResubmittingAppId(null);
    }
  };

  const handleOpenModerationModal = (app: StoreApp) => {
    setModerationInfoApp(app);
  };

  // --- Handlers: Releases ---
  const handlePublishRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReleaseAppId) {
      setReleaseErrorMsg('Please select an application to publish a release for.');
      return;
    }
    if (!releaseDownloadUrl.trim()) {
      setReleaseErrorMsg('Release APK download URL is required.');
      return;
    }

    setIsPublishingRelease(true);
    setReleaseErrorMsg(null);
    setReleaseSuccessMsg(null);

    try {
      await publishAppReleaseVersion({
        appId: selectedReleaseAppId,
        version: releaseVersion.trim(),
        versionCode: parseInt(releaseVersionCode, 10) || 1,
        downloadUrl: releaseDownloadUrl.trim(),
        checksumSha256: releaseChecksum.trim(),
        changelog: releaseChangelog.trim(),
        sizeMb: parseFloat(releaseSizeMb) || 25,
        isMandatory: releaseIsMandatory
      });

      setReleaseSuccessMsg(`Version ${releaseVersion} released successfully for ${selectedReleaseApp?.name || 'app'}!`);
      // Reload versions and apps
      const vers = await fetchAppVersions(selectedReleaseAppId);
      setAppVersionsList(vers);
      reloadApps();
    } catch (err: any) {
      setReleaseErrorMsg(err.message || 'Failed to publish release version.');
    } finally {
      setIsPublishingRelease(false);
    }
  };

  // --- Handlers: New App Submission ---
  const generateSampleSha = (target: 'SUBMIT' | 'RELEASE') => {
    const chars = '0123456789abcdef';
    let hex = '';
    for (let i = 0; i < 64; i++) {
      hex += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (target === 'SUBMIT') setChecksumSha256(hex);
    else setReleaseChecksum(hex);
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingIcon(true);
    setSubmissionError(null);
    try {
      const result = await uploadMediaToSupabase(SUPABASE_BUCKETS.APP_ICONS, file, activeUid);
      setIconUrl(result.publicUrl);
    } catch (err: any) {
      setSubmissionError(err.message || 'Icon upload failed');
    } finally {
      setIsUploadingIcon(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBanner(true);
    setSubmissionError(null);
    try {
      const result = await uploadMediaToSupabase(SUPABASE_BUCKETS.APP_BANNERS, file, activeUid);
      setBannerUrl(result.publicUrl);
    } catch (err: any) {
      setSubmissionError(err.message || 'Banner upload failed');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingScreenshot(true);
    setSubmissionError(null);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await uploadMediaToSupabase(SUPABASE_BUCKETS.APP_SCREENSHOTS, files[i], activeUid);
        newUrls.push(res.publicUrl);
      }
      setScreenshots((prev) => [...prev, ...newUrls].slice(0, 5));
    } catch (err: any) {
      setSubmissionError(err.message || 'Screenshot upload failed');
    } finally {
      setIsUploadingScreenshot(false);
    }
  };

  const handleSubmitApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    if (!activeUid) {
      setSubmissionError('You must be signed in with an authenticated developer account.');
      return;
    }
    if (!downloadUrl.trim()) {
      setSubmissionError('Please provide the GitHub Release APK URL.');
      return;
    }
    if (!packageName.trim() || !name.trim()) {
      setSubmissionError('Application name and package name are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const features = featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);
      const tags = tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const result = await submitAppForReview({
        name: name.trim(),
        packageName: packageName.trim().toLowerCase(),
        developer: developerName.trim() || user.name,
        developerUid: activeUid,
        category,
        iconUrl: iconUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
        bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
        screenshots: screenshots.length > 0
          ? screenshots
          : [
              iconUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
              bannerUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80'
            ],
        videoUrl: videoUrl || undefined,
        sizeMb: parseFloat(sizeMb) || 25.0,
        isGame: isGame || category === 'GAMES',
        downloadUrl: downloadUrl.trim(),
        checksumSha256: checksumSha256.trim() || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        version: version.trim() || '1.0.0',
        versionCode: parseInt(versionCode, 10) || 1,
        changelog: changelog.trim(),
        fullDescription: fullDescription.trim(),
        features,
        tags,
        directPublish: isAdmin
      });

      setSubmittedAppId(result.appId);
      setName('');
      setPackageName('');
      setDownloadUrl('');
      setFullDescription('');
      setIconUrl('');
      setBannerUrl('');
      setScreenshots([]);
      setChecksumSha256('');
      reloadApps();
    } catch (err: any) {
      setSubmissionError(err.message || 'Failed to submit application for review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handlers: Media Hub ---
  const handleDirectMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUid) return;
    setIsUploadingMediaAsset(true);
    setMediaAssetError(null);
    setMediaAssetSuccessUrl(null);
    try {
      const res = await uploadMediaToSupabase(selectedBucket, file, activeUid);
      setMediaAssetSuccessUrl(res.publicUrl);
      setUploadedAssetsHistory((prev) => [{ name: file.name, url: res.publicUrl, bucket: selectedBucket }, ...prev]);
    } catch (err: any) {
      setMediaAssetError(err.message || 'Media upload failed');
    } finally {
      setIsUploadingMediaAsset(false);
    }
  };

  // Gate Check
  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-[#1D1B20] dark:text-[#E6E1E5]">
            Developer Authorization Required
          </h1>
          <p className="text-xs text-[#49454F] dark:text-[#CAC4D0] max-w-md mx-auto leading-relaxed">
            Publishing APKs and managing store releases requires an authenticated account with verified{' '}
            <span className="font-bold text-[#6750A4] dark:text-[#D0BCFF]">DEVELOPER</span> or{' '}
            <span className="font-bold text-[#6750A4] dark:text-[#D0BCFF]">ADMIN</span> status.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 text-left space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#49454F] dark:text-[#CAC4D0]">Account:</span>
            <span className="font-bold text-[#1D1B20] dark:text-[#E6E1E5]">
              {isAuthenticated ? user.email || user.name : 'Unauthenticated'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#49454F] dark:text-[#CAC4D0]">Current Role:</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#6750A4]/10 text-[#6750A4] dark:text-[#D0BCFF]">
              {user.role}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#49454F] dark:text-[#CAC4D0]">Developer Status:</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-black/5 dark:bg-white/5 text-[#49454F] dark:text-[#CAC4D0]">
              {user.developerStatus === 'PENDING' ? '⏳ Application Under Review' : user.developerStatus}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setCurrentTab('PROFILE')}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> Apply for Developer Verification
          </button>
          <button
            onClick={() => setCurrentTab('HOME')}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] text-[#1D1B20] dark:text-[#E6E1E5] text-xs font-bold hover:bg-[#E8DEF8] dark:hover:bg-[#34323B] transition"
          >
            Browse Store
          </button>
        </div>
      </div>
    );
  }

  const selectedReleaseApp = developerApps.find((a) => a.id === selectedReleaseAppId);
  const profileScore = calculateProfileCompletion();

  const publishedCount = developerApps.filter((a) => a.status === 'PUBLISHED' || a.status === 'APPROVED' || !a.status).length;
  const pendingCount = developerApps.filter((a) => a.status === 'PENDING_REVIEW' || a.status === 'PENDING').length;
  const draftCount = developerApps.filter((a) => a.status === 'DRAFT').length;

  const filteredApps = developerApps.filter((app) => {
    if (appsFilter === 'PUBLISHED') return app.status === 'PUBLISHED' || app.status === 'APPROVED' || !app.status;
    if (appsFilter === 'PENDING') return app.status === 'PENDING_REVIEW' || app.status === 'PENDING';
    if (appsFilter === 'DRAFT') return app.status === 'DRAFT';
    return true;
  });

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto px-2 sm:px-4">
      {/* Console Header */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2.5">
            <Terminal className="w-7 h-7 text-[#6750A4] dark:text-[#D0BCFF]" />
            Developer Console
          </h1>
          <p className="text-xs text-[#49454F] dark:text-[#CAC4D0]">
            Manage public studio presence, APK releases, binary distributions, and live store submissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
              isAdmin
                ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            {isAdmin ? `Admin Publisher: ${user.name}` : `Verified Developer: ${user.name}`}
          </span>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-black/5 dark:border-white/5 scrollbar-none">
        {[
          { id: 'DASHBOARD', label: 'Dashboard', icon: BarChart3 },
          { id: 'PROFILE', label: 'Developer Profile', icon: Building2 },
          { id: 'APPLICATIONS', label: `Applications (${developerApps.length})`, icon: Layers },
          { id: 'RELEASES', label: 'Releases', icon: Tag },
          { id: 'SUBMIT', label: 'Submit New App', icon: Plus },
          { id: 'MEDIA', label: 'Media Assets', icon: ImageIcon },
          { id: 'MODERATION', label: 'Moderation Status', icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeConsoleTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveConsoleTab(tab.id as DevConsoleTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition ${
                isActive
                  ? 'bg-[#6750A4] text-white shadow-sm'
                  : 'bg-white dark:bg-[#1E1F23] text-[#49454F] dark:text-[#CAC4D0] hover:bg-[#F3EDF7] dark:hover:bg-[#2B2C30] border border-black/5 dark:border-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. DASHBOARD TAB */}
      {/* ========================================================================= */}
      {activeConsoleTab === 'DASHBOARD' && (
        <div className="space-y-6">
          {/* Profile Completion & Verification Banner */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#6750A4]/15 text-[#6750A4] dark:text-[#D0BCFF]">
                  Verified Developer Studio
                </span>
                <span className="text-xs text-[#49454F] dark:text-[#CAC4D0]">
                  Public ID: <code className="font-mono">{`dev_${user.name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 16)}`}</code>
                </span>
              </div>
              <h2 className="text-lg font-black text-[#1D1B20] dark:text-[#E6E1E5]">
                Welcome to your Publisher Workspace, {user.name}
              </h2>
              <p className="text-xs text-[#49454F] dark:text-[#CAC4D0] max-w-xl leading-relaxed">
                Publish secure Android binaries via GitHub CDN, upload high-resolution media to Supabase, and synchronize live metadata directly with Firestore.
              </p>
            </div>

            <div className="w-full md:w-64 p-4 rounded-2xl bg-[#F3EDF7] dark:bg-[#2B2C30] space-y-2 shrink-0">
              <div className="flex items-center justify-between text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5]">
                <span>Profile Completion</span>
                <span className="text-[#6750A4] dark:text-[#D0BCFF]">{profileScore}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${profileScore}%` }}
                />
              </div>
              <button
                onClick={() => setActiveConsoleTab('PROFILE')}
                className="text-[11px] font-bold text-[#6750A4] dark:text-[#D0BCFF] hover:underline flex items-center gap-1"
              >
                Complete profile details <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 space-y-1">
              <div className="flex items-center justify-between text-[#49454F] dark:text-[#CAC4D0]">
                <span className="text-xs font-bold">Total Apps</span>
                <Layers className="w-4 h-4 text-[#6750A4]" />
              </div>
              <p className="text-2xl font-black text-[#1D1B20] dark:text-[#E6E1E5]">{developerApps.length}</p>
              <span className="text-[10px] text-[#49454F] dark:text-[#CAC4D0]">In Developer Portfolio</span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 space-y-1">
              <div className="flex items-center justify-between text-[#49454F] dark:text-[#CAC4D0]">
                <span className="text-xs font-bold">Published & Live</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{publishedCount}</p>
              <span className="text-[10px] text-emerald-500 font-bold">Public on Store</span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 space-y-1">
              <div className="flex items-center justify-between text-[#49454F] dark:text-[#CAC4D0]">
                <span className="text-xs font-bold">Pending Review</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{pendingCount}</p>
              <span className="text-[10px] text-amber-500 font-bold">Moderation Queue</span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 space-y-1">
              <div className="flex items-center justify-between text-[#49454F] dark:text-[#CAC4D0]">
                <span className="text-xs font-bold">Binary CDN</span>
                <Github className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-[#1D1B20] dark:text-[#E6E1E5]">Active</p>
              <span className="text-[10px] text-blue-500 font-bold">Direct GitHub Releases</span>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#6750A4]" /> Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                onClick={() => setActiveConsoleTab('SUBMIT')}
                className="p-5 rounded-3xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 hover:border-[#6750A4]/40 transition cursor-pointer space-y-2 group shadow-xs"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#6750A4]/10 text-[#6750A4] dark:text-[#D0BCFF] flex items-center justify-center group-hover:scale-105 transition">
                  <Plus className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#1D1B20] dark:text-[#E6E1E5]">Submit New Application</h4>
                <p className="text-xs text-[#49454F] dark:text-[#CAC4D0]">
                  Publish APK binary link, metadata, categories, and Supabase media assets.
                </p>
              </div>

              <div
                onClick={() => setActiveConsoleTab('PROFILE')}
                className="p-5 rounded-3xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 hover:border-[#6750A4]/40 transition cursor-pointer space-y-2 group shadow-xs"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-105 transition">
                  <Building2 className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#1D1B20] dark:text-[#E6E1E5]">Manage Public Profile</h4>
                <p className="text-xs text-[#49454F] dark:text-[#CAC4D0]">
                  Update studio name, official website, GitHub, and verified social links.
                </p>
              </div>

              <div
                onClick={() => setActiveConsoleTab('RELEASES')}
                className="p-5 rounded-3xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 hover:border-[#6750A4]/40 transition cursor-pointer space-y-2 group shadow-xs"
              >
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-105 transition">
                  <Tag className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#1D1B20] dark:text-[#E6E1E5]">Manage App Releases</h4>
                <p className="text-xs text-[#49454F] dark:text-[#CAC4D0]">
                  Roll out new version codes, release notes, and update APK download URLs.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DEVELOPER PROFILE TAB */}
      {/* ========================================================================= */}
      {activeConsoleTab === 'PROFILE' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 dark:border-white/5 pb-4">
            <div>
              <h2 className="text-lg font-black text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#6750A4]" /> Developer Public Profile
              </h2>
              <p className="text-xs text-[#49454F] dark:text-[#CAC4D0]">
                Configure how your publisher studio appears across Avanyx Store. All social and community links are optional.
              </p>
            </div>

            <button
              onClick={() => openDeveloperProfile(activeUid)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#F3EDF7] dark:bg-[#2B2C30] hover:bg-[#E8DEF8] dark:hover:bg-[#34353A] text-[#1D1B20] dark:text-[#E6E1E5] text-xs font-bold transition shadow-xs self-start"
            >
              <Eye className="w-3.5 h-3.5 text-[#6750A4]" /> View Public Profile on Store
            </button>
          </div>

          {profileSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Public Developer Profile updated successfully in Firestore!
            </div>
          )}

          {profileError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {profileError}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
            {/* Identity & Studio Details */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 space-y-4">
              <h3 className="font-extrabold text-[#1D1B20] dark:text-[#E6E1E5] text-xs uppercase tracking-wider flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#6750A4]" /> 1. Studio Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">
                    Developer Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.displayName}
                    onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                    placeholder="e.g. Aetheria Systems"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                  />
                </div>

                <div>
                  <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">
                    Organization / Studio Legal Entity (Optional)
                  </label>
                  <input
                    type="text"
                    value={profileForm.organizationName}
                    onChange={(e) => setProfileForm({ ...profileForm, organizationName: e.target.value })}
                    placeholder="e.g. Aetheria Labs Inc."
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">
                    Country / Headquarters (Optional)
                  </label>
                  <input
                    type="text"
                    value={profileForm.country}
                    onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                    placeholder="e.g. United States, Germany, India"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                  />
                </div>

                <div>
                  <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">
                    Short Studio Bio / Description
                  </label>
                  <textarea
                    rows={2}
                    value={profileForm.shortDescription}
                    onChange={(e) => setProfileForm({ ...profileForm, shortDescription: e.target.value })}
                    placeholder="Describe your studio, focus areas, and development philosophy..."
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                  />
                </div>
              </div>
            </div>

            {/* Visual Branding Assets */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 space-y-4">
              <h3 className="font-extrabold text-[#1D1B20] dark:text-[#E6E1E5] text-xs uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#6750A4]" /> 2. Studio Visual Branding
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Logo */}
                <div className="space-y-2">
                  <label className="block text-[#49454F] dark:text-[#CAC4D0] font-bold">
                    Developer Logo (Square 1:1)
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#F3EDF7] dark:bg-[#121316] shrink-0 border border-black/5 dark:border-white/5">
                      <img
                        src={profileForm.logoUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(profileForm.displayName || 'Dev')}`}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="url"
                        value={profileForm.logoUrl}
                        onChange={(e) => setProfileForm({ ...profileForm, logoUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5] text-xs"
                      />
                      <input
                        type="file"
                        ref={profileLogoInputRef}
                        onChange={handleProfileLogoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => profileLogoInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-xs font-bold text-[#49454F] dark:text-[#CAC4D0]"
                      >
                        Upload to Supabase Storage
                      </button>
                    </div>
                  </div>
                </div>

                {/* Banner */}
                <div className="space-y-2">
                  <label className="block text-[#49454F] dark:text-[#CAC4D0] font-bold">
                    Developer Header Banner (16:9 or Wide)
                  </label>
                  <div className="space-y-1.5">
                    <input
                      type="url"
                      value={profileForm.bannerUrl}
                      onChange={(e) => setProfileForm({ ...profileForm, bannerUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5] text-xs"
                    />
                    <input
                      type="file"
                      ref={profileBannerInputRef}
                      onChange={handleProfileBannerUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => profileBannerInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-xs font-bold text-[#49454F] dark:text-[#CAC4D0]"
                    >
                      Upload to Supabase Storage
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Official Links */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 space-y-4">
              <h3 className="font-extrabold text-[#1D1B20] dark:text-[#E6E1E5] text-xs uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#6750A4]" /> 3. Official & Social Links (All Optional)
              </h3>
              <p className="text-[11px] text-[#49454F] dark:text-[#CAC4D0]">
                Only links with valid URLs will be displayed publicly on your store profile.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#6750A4]" /> Official Website
                  </label>
                  <input
                    type="url"
                    value={profileForm.officialWebsite}
                    onChange={(e) => setProfileForm({ ...profileForm, officialWebsite: e.target.value })}
                    placeholder="https://yourstudio.com"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5]"
                  />
                </div>

                <div>
                  <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5 text-[#1D1B20] dark:text-white" /> GitHub Profile / Organization
                  </label>
                  <input
                    type="url"
                    value={profileForm.githubUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, githubUrl: e.target.value })}
                    placeholder="https://github.com/your-org"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5]"
                  />
                </div>

                <div>
                  <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5 text-pink-500" /> Instagram URL
                  </label>
                  <input
                    type="url"
                    value={profileForm.instagramUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/your_handle"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5]"
                  />
                </div>

                <div>
                  <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold flex items-center gap-1.5">
                    <Facebook className="w-3.5 h-3.5 text-blue-600" /> Facebook Page
                  </label>
                  <input
                    type="url"
                    value={profileForm.facebookUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, facebookUrl: e.target.value })}
                    placeholder="https://facebook.com/your_page"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5]"
                  />
                </div>

                <div>
                  <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold flex items-center gap-1.5">
                    <Youtube className="w-3.5 h-3.5 text-red-500" /> YouTube Channel
                  </label>
                  <input
                    type="url"
                    value={profileForm.youtubeUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, youtubeUrl: e.target.value })}
                    placeholder="https://youtube.com/@yourchannel"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5]"
                  />
                </div>

                <div>
                  <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500" /> WhatsApp / Community Link
                  </label>
                  <input
                    type="url"
                    value={profileForm.whatsappUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, whatsappUrl: e.target.value })}
                    placeholder="https://chat.whatsapp.com/... or Discord"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5]"
                  />
                </div>
              </div>

              {/* Other Custom Links */}
              <div className="pt-3 border-t border-black/5 dark:border-white/5 space-y-3">
                <label className="block text-[#49454F] dark:text-[#CAC4D0] font-bold">
                  Additional Public Links
                </label>
                {profileForm.otherPublicLinks.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-[#F3EDF7] dark:bg-[#121316] text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5] w-32 truncate">
                      {link.label}
                    </span>
                    <span className="flex-1 px-3 py-1.5 rounded-xl bg-[#F3EDF7] dark:bg-[#121316] text-xs text-[#49454F] dark:text-[#CAC4D0] truncate">
                      {link.url}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomLink(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Link Label (e.g. Documentation)"
                    value={newCustomLink.label}
                    onChange={(e) => setNewCustomLink({ ...newCustomLink, label: e.target.value })}
                    className="w-full sm:w-44 px-3 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#121316] text-xs"
                  />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newCustomLink.url}
                    onChange={(e) => setNewCustomLink({ ...newCustomLink, url: e.target.value })}
                    className="w-full sm:flex-1 px-3 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#121316] text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomLink}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5]"
                  >
                    Add Link
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={profileSaving}
                className="px-6 py-3 rounded-2xl bg-[#6750A4] hover:bg-[#59448F] text-white font-bold text-xs shadow-md transition flex items-center gap-2"
              >
                {profileSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Save Developer Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. APPLICATIONS TAB (Requirement 11) */}
      {/* ========================================================================= */}
      {activeConsoleTab === 'APPLICATIONS' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 dark:border-white/5 pb-4">
            <div>
              <h2 className="text-lg font-black text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#6750A4]" /> My Applications ({developerApps.length})
              </h2>
              <p className="text-xs text-[#49454F] dark:text-[#CAC4D0]">
                Manage store listings, create releases, review moderation status, and update application metadata.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveConsoleTab('SUBMIT')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#6750A4] hover:bg-[#59448F] text-white text-xs font-bold shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" /> Submit New App
              </button>
            </div>
          </div>

          {resubmitSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {resubmitSuccessMsg}
            </div>
          )}

          {resubmitErrorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {resubmitErrorMsg}
            </div>
          )}

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            {(['ALL', 'PUBLISHED', 'PENDING', 'DRAFT'] as const).map((filt) => (
              <button
                key={filt}
                onClick={() => setAppsFilter(filt)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  appsFilter === filt
                    ? 'bg-[#6750A4]/15 text-[#6750A4] dark:text-[#D0BCFF] border border-[#6750A4]/30'
                    : 'bg-white dark:bg-[#1E1F23] text-[#49454F] dark:text-[#CAC4D0] border border-black/5 dark:border-white/5'
                }`}
              >
                {filt}
              </button>
            ))}
          </div>

          {loadingApps ? (
            <div className="py-12 text-center text-xs text-[#49454F] dark:text-[#CAC4D0]">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#6750A4]" />
              Loading applications...
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-[#1E1F23] rounded-3xl border border-black/5 dark:border-white/5 space-y-3">
              <Layers className="w-10 h-10 text-[#49454F] dark:text-[#CAC4D0] mx-auto opacity-50" />
              <h3 className="text-sm font-bold text-[#1D1B20] dark:text-[#E6E1E5]">No Applications Found</h3>
              <p className="text-xs text-[#49454F] dark:text-[#CAC4D0] max-w-sm mx-auto">
                You haven't submitted any apps matching this status yet.
              </p>
              <button
                onClick={() => setActiveConsoleTab('SUBMIT')}
                className="px-4 py-2 rounded-xl bg-[#6750A4] text-white text-xs font-bold"
              >
                Submit First App
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredApps.map((app) => {
                const isAppPublished = app.status === 'PUBLISHED' || app.status === 'APPROVED' || !app.status;
                const isPendingReview = app.status === 'PENDING_REVIEW';
                const isRejected = app.status === 'REJECTED';
                const isDraft = app.status === 'DRAFT';
                const isSuspended = app.status === 'SUSPENDED';

                return (
                  <div
                    key={app.id}
                    className="p-5 rounded-3xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 flex flex-col justify-between space-y-4 shadow-xs"
                  >
                    {/* Header: Icon, Name, Package, Badges */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#F3EDF7] dark:bg-[#2B2C30] shrink-0 border border-black/5 dark:border-white/5">
                            <img
                              src={app.iconUrl}
                              alt={app.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-[#1D1B20] dark:text-[#E6E1E5] truncate">
                              {app.name}
                            </h4>
                            <p className="text-[11px] font-mono text-[#49454F] dark:text-[#CAC4D0] truncate">
                              {app.packageName}
                            </p>
                            <div className="flex items-center gap-1.5 flex-wrap mt-1">
                              {/* Moderation Status */}
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isAppPublished
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : isPendingReview
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                    : isRejected
                                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                    : isSuspended
                                    ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                                    : 'bg-black/5 dark:bg-white/5 text-[#49454F] dark:text-[#CAC4D0]'
                                }`}
                              >
                                Moderation: {app.status || 'PUBLISHED'}
                              </span>

                              {/* Published / Unpublished state */}
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isAppPublished
                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                    : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400'
                                }`}
                              >
                                {isAppPublished ? 'Live in Store' : 'Unpublished'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Technical & Audit Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded-2xl bg-[#F3EDF7]/60 dark:bg-[#2B2C30]/60 text-[11px]">
                        <div>
                          <span className="text-[#49454F] dark:text-[#CAC4D0] block text-[10px]">Current Version</span>
                          <span className="font-bold text-[#1D1B20] dark:text-[#E6E1E5]">v{app.version}</span>
                        </div>
                        <div>
                          <span className="text-[#49454F] dark:text-[#CAC4D0] block text-[10px]">Release Status</span>
                          <span className="font-bold text-[#6750A4] dark:text-[#D0BCFF]">Active</span>
                        </div>
                        <div>
                          <span className="text-[#49454F] dark:text-[#CAC4D0] block text-[10px]">Category</span>
                          <span className="font-bold text-[#1D1B20] dark:text-[#E6E1E5] truncate block">{app.category}</span>
                        </div>
                        <div>
                          <span className="text-[#49454F] dark:text-[#CAC4D0] block text-[10px]">Rating & Downloads</span>
                          <span className="font-bold text-amber-500">{app.rating.toFixed(1)} ★ ({app.downloads})</span>
                        </div>
                      </div>

                      {/* Audit Timestamps */}
                      <div className="flex items-center justify-between text-[10px] text-[#49454F] dark:text-[#CAC4D0] px-1 font-mono">
                        <span>Submission: {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Active'}</span>
                        <span>Last Updated: {app.updatedAt ? new Date(app.updatedAt).toLocaleDateString() : 'Recent'}</span>
                      </div>
                    </div>

                    {/* Action Bar (Requirement 11 Actions) */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-black/5 dark:border-white/5">
                      {/* View Action */}
                      <button
                        onClick={() => openAppDetails(app.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#F3EDF7] dark:bg-[#2B2C30] hover:bg-[#E8DEF8] text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5] transition flex items-center gap-1"
                        title="View Store Listing"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>

                      {/* Manage Metadata Action */}
                      <button
                        onClick={() => handleOpenEditModal(app)}
                        className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5] transition flex items-center gap-1"
                        title="Manage App Details and Visuals"
                      >
                        <Sliders className="w-3.5 h-3.5" /> Manage
                      </button>

                      {/* Create Release Action */}
                      <button
                        onClick={() => {
                          setSelectedReleaseAppId(app.id);
                          setActiveConsoleTab('RELEASES');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#6750A4]/10 hover:bg-[#6750A4]/20 text-[#6750A4] dark:text-[#D0BCFF] text-xs font-bold transition flex items-center gap-1"
                        title="Create New App Release"
                      >
                        <Tag className="w-3.5 h-3.5" /> Create Release
                      </button>

                      {/* Submit for Review Action (Available for DRAFT or REJECTED apps) */}
                      {(isDraft || isRejected) && (
                        <button
                          onClick={() => handleResubmitApp(app)}
                          disabled={resubmittingAppId === app.id}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 text-white hover:bg-amber-600 text-xs font-bold transition flex items-center gap-1 disabled:opacity-50"
                          title="Submit for Administrative Moderation"
                        >
                          {resubmittingAppId === app.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          Submit for Review
                        </button>
                      )}

                      {/* View Moderation Result Action */}
                      {(isPendingReview || isRejected || isAppPublished || isSuspended) && (
                        <button
                          onClick={() => handleOpenModerationModal(app)}
                          className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-xs font-bold text-[#49454F] dark:text-[#CAC4D0] transition flex items-center gap-1"
                          title="View Moderation Status & Notes"
                        >
                          <Info className="w-3.5 h-3.5" /> Moderation Result
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================================================= */}
          {/* EDIT APP METADATA MODAL (Requirement 11) */}
          {/* ========================================================================= */}
          {editingApp && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white dark:bg-[#1E1F23] rounded-3xl max-w-2xl w-full p-6 space-y-4 border border-black/10 dark:border-white/10 shadow-2xl my-8">
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Sliders className="w-5 h-5 text-[#6750A4]" />
                    <h3 className="text-base font-bold text-[#1D1B20] dark:text-[#E6E1E5]">
                      Manage App Metadata: {editingApp.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setEditingApp(null)}
                    className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#49454F] dark:text-[#CAC4D0]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {metadataSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> {metadataSuccess}
                  </div>
                )}

                {metadataError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {metadataError}
                  </div>
                )}

                <form onSubmit={handleSaveAppMetadata} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">App Name</label>
                      <input
                        type="text"
                        required
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">Category</label>
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value as AppCategory })}
                        className="w-full px-3 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5]"
                      >
                        <option value="PRODUCTIVITY">PRODUCTIVITY</option>
                        <option value="DEVELOPER_TOOLS">DEVELOPER_TOOLS</option>
                        <option value="COMMUNICATION">COMMUNICATION</option>
                        <option value="ENTERTAINMENT">ENTERTAINMENT</option>
                        <option value="UTILITIES">UTILITIES</option>
                        <option value="GAMES">GAMES</option>
                        <option value="EDUCATION">EDUCATION</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">Full Description</label>
                    <textarea
                      rows={3}
                      value={editForm.fullDescription}
                      onChange={(e) => setEditForm({ ...editForm, fullDescription: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">Features (1 per line)</label>
                      <textarea
                        rows={3}
                        value={editForm.featuresText}
                        onChange={(e) => setEditForm({ ...editForm, featuresText: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">Search Tags (Comma separated)</label>
                      <textarea
                        rows={3}
                        value={editForm.tagsText}
                        onChange={(e) => setEditForm({ ...editForm, tagsText: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">Icon URL</label>
                      <input
                        type="url"
                        value={editForm.iconUrl}
                        onChange={(e) => setEditForm({ ...editForm, iconUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">Header Banner URL</label>
                      <input
                        type="url"
                        value={editForm.bannerUrl}
                        onChange={(e) => setEditForm({ ...editForm, bannerUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">APK Download URL</label>
                      <input
                        type="url"
                        value={editForm.downloadUrl}
                        onChange={(e) => setEditForm({ ...editForm, downloadUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">SHA-256 Checksum</label>
                      <input
                        type="text"
                        value={editForm.checksumSha256}
                        onChange={(e) => setEditForm({ ...editForm, checksumSha256: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5] font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setEditingApp(null)}
                      className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingMetadata}
                      className="px-5 py-2 rounded-xl bg-[#6750A4] hover:bg-[#59448F] text-white font-bold text-xs shadow-md transition flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSavingMetadata ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODERATION RESULT MODAL (Requirement 11 & 14) */}
          {/* ========================================================================= */}
          {moderationInfoApp && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#1E1F23] rounded-3xl max-w-lg w-full p-6 space-y-4 border border-black/10 dark:border-white/10 shadow-2xl">
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#6750A4]" />
                    <h3 className="text-base font-bold text-[#1D1B20] dark:text-[#E6E1E5]">
                      Moderation Result: {moderationInfoApp.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setModerationInfoApp(null)}
                    className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#49454F] dark:text-[#CAC4D0]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F3EDF7]/70 dark:bg-[#2B2C30]/70">
                    <span className="font-bold text-[#49454F] dark:text-[#CAC4D0]">Authoritative Status</span>
                    <span className="font-black text-[#6750A4] dark:text-[#D0BCFF]">
                      {moderationInfoApp.status || 'PUBLISHED'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] space-y-2 border border-black/5 dark:border-white/5">
                    <h4 className="font-bold text-[#1D1B20] dark:text-[#E6E1E5]">Moderation Review Notes</h4>
                    <p className="text-[#49454F] dark:text-[#CAC4D0] leading-relaxed">
                      {moderationInfoApp.status === 'PUBLISHED' || moderationInfoApp.status === 'APPROVED'
                        ? 'Application has successfully passed all security audits, SHA-256 integrity verifications, and Store policy requirements.'
                        : moderationInfoApp.status === 'PENDING_REVIEW'
                        ? 'Application is currently queued in the Administrator Moderation Pipeline. Security score calculations and binary validation are active.'
                        : moderationInfoApp.status === 'REJECTED'
                        ? 'Application submission did not meet publication criteria. Please update your metadata or binary releases using the Manage button and click Submit for Review.'
                        : 'Application is currently under administrative hold.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[#49454F] dark:text-[#CAC4D0] p-2 bg-[#F3EDF7]/40 dark:bg-[#121316]/40 rounded-xl">
                    <div>App ID: {moderationInfoApp.id.substring(0, 10)}...</div>
                    <div>Package: {moderationInfoApp.packageName}</div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setModerationInfoApp(null)}
                    className="px-5 py-2 rounded-xl bg-[#6750A4] text-white text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. RELEASES TAB */}
      {/* ========================================================================= */}
      {activeConsoleTab === 'RELEASES' && (
        <div className="space-y-6">
          <div className="border-b border-black/5 dark:border-white/5 pb-4">
            <h2 className="text-lg font-black text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#6750A4]" /> Version Releases & Binary Deployments
            </h2>
            <p className="text-xs text-[#49454F] dark:text-[#CAC4D0]">
              Deploy new APK versions, specify release changelogs, and update store binary endpoints.
            </p>
          </div>

          {releaseSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {releaseSuccessMsg}
            </div>
          )}

          {releaseErrorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {releaseErrorMsg}
            </div>
          )}

          {developerApps.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#1E1F23] rounded-3xl border border-black/5 dark:border-white/5 space-y-2">
              <Info className="w-8 h-8 text-[#6750A4] mx-auto" />
              <h3 className="text-sm font-bold text-[#1D1B20] dark:text-[#E6E1E5]">No Applications Available</h3>
              <p className="text-xs text-[#49454F] dark:text-[#CAC4D0]">
                Submit an application first before publishing version releases.
              </p>
              <button
                onClick={() => setActiveConsoleTab('SUBMIT')}
                className="px-4 py-2 rounded-xl bg-[#6750A4] text-white text-xs font-bold"
              >
                Submit New Application
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Release Creator Form */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 space-y-5">
                <h3 className="text-sm font-extrabold text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#6750A4]" /> Deploy New Release Version
                </h3>

                <form onSubmit={handlePublishRelease} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">
                      Select Target Application *
                    </label>
                    <select
                      value={selectedReleaseAppId}
                      onChange={(e) => setSelectedReleaseAppId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5] font-bold"
                    >
                      {developerApps.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.packageName}) — Current: v{a.version}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">
                        New Version String *
                      </label>
                      <input
                        type="text"
                        required
                        value={releaseVersion}
                        onChange={(e) => setReleaseVersion(e.target.value)}
                        placeholder="e.g. 1.2.0"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">
                        Version Code (Integer) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={releaseVersionCode}
                        onChange={(e) => setReleaseVersionCode(e.target.value)}
                        placeholder="e.g. 2"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">
                      GitHub Release APK Download URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={releaseDownloadUrl}
                      onChange={(e) => setReleaseDownloadUrl(e.target.value)}
                      placeholder="https://github.com/org/repo/releases/download/v1.2.0/app-release.apk"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[#49454F] dark:text-[#CAC4D0] font-bold">SHA256 Checksum</label>
                        <button
                          type="button"
                          onClick={() => generateSampleSha('RELEASE')}
                          className="text-[10px] text-[#6750A4] dark:text-[#D0BCFF] hover:underline"
                        >
                          Generate Checksum
                        </button>
                      </div>
                      <input
                        type="text"
                        value={releaseChecksum}
                        onChange={(e) => setReleaseChecksum(e.target.value)}
                        placeholder="64-char SHA256..."
                        className="w-full px-3.5 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#121316] font-mono text-[11px]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">
                        APK File Size (MB)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={releaseSizeMb}
                        onChange={(e) => setReleaseSizeMb(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#121316]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">
                      Release Changelog / Notes
                    </label>
                    <textarea
                      rows={3}
                      value={releaseChangelog}
                      onChange={(e) => setReleaseChangelog(e.target.value)}
                      placeholder="What is new in this release..."
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#121316]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={releaseIsMandatory}
                        onChange={(e) => setReleaseIsMandatory(e.target.checked)}
                        className="rounded text-[#6750A4] focus:ring-[#6750A4]"
                      />
                      <span className="font-bold text-[#1D1B20] dark:text-[#E6E1E5]">Mark as Mandatory Update</span>
                    </label>

                    <button
                      type="submit"
                      disabled={isPublishingRelease}
                      className="px-6 py-2.5 rounded-2xl bg-[#6750A4] hover:bg-[#59448F] text-white font-bold shadow-md transition flex items-center gap-2"
                    >
                      {isPublishingRelease ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Publish Release Version
                    </button>
                  </div>
                </form>
              </div>

              {/* Version History Sidebar */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 space-y-4">
                <h3 className="text-sm font-extrabold text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#6750A4]" /> Version History
                </h3>

                {loadingVersions ? (
                  <div className="py-8 text-center text-xs text-[#49454F] dark:text-[#CAC4D0]">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-[#6750A4]" />
                    Loading versions...
                  </div>
                ) : appVersionsList.length === 0 ? (
                  <p className="text-xs text-[#49454F] dark:text-[#CAC4D0] py-4 text-center">
                    No dedicated version documents found in app_versions.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {appVersionsList.map((ver) => (
                      <div
                        key={ver.id}
                        className="p-3.5 rounded-2xl bg-[#F3EDF7]/60 dark:bg-[#2B2C30]/60 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#1D1B20] dark:text-[#E6E1E5]">
                            v{ver.version || (ver as any).versionName}
                          </span>
                          <span className="text-[10px] text-[#49454F] dark:text-[#CAC4D0]">
                            Code: {ver.versionCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#49454F] dark:text-[#CAC4D0] line-clamp-2">
                          {ver.releaseNotes || (ver as any).changelog || 'No release notes'}
                        </p>
                        <span className="text-[10px] text-slate-400 block pt-1">
                          Released: {ver.releaseDate}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SUBMIT NEW APPLICATION TAB */}
      {/* ========================================================================= */}
      {activeConsoleTab === 'SUBMIT' && (
        <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 space-y-6">
          <div className="border-b border-black/5 dark:border-white/5 pb-4">
            <h2 className="text-lg font-black text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-[#6750A4]" />
              {isAdmin ? 'Administrator Application Publisher & Direct Release' : 'Submit Application for Review'}
            </h2>
            <p className="text-xs text-[#49454F] dark:text-[#CAC4D0]">
              {isAdmin
                ? 'Admins bypass moderation and publish directly to the live store with verified status.'
                : 'Complete all application metadata, attach Supabase media, and link the GitHub Release APK.'}
            </p>
          </div>

          {submittedAppId && (
            <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-5 h-5" />{' '}
                  {isAdmin
                    ? 'Application published directly to store catalog!'
                    : 'Application submitted successfully for review!'}
                </span>
                <button
                  onClick={() => setSubmittedAppId(null)}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                >
                  Dismiss
                </button>
              </div>
              <p className="text-[11px] text-[#49454F] dark:text-[#CAC4D0]">
                App Document ID: <code className="font-mono">{submittedAppId}</code>.
              </p>
            </div>
          )}

          {submissionError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {submissionError}
              </span>
              <button onClick={() => setSubmissionError(null)} className="underline text-xs">
                Dismiss
              </button>
            </div>
          )}

          <form onSubmit={handleSubmitApp} className="space-y-6 text-xs">
            {/* 1. App Identity */}
            <div className="space-y-4">
              <h3 className="font-bold text-[#1D1B20] dark:text-[#E6E1E5] text-xs uppercase tracking-wider flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#6750A4]" /> 1. App Identity & Category
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">
                    App Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Apex Hyperterminal"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5]"
                  />
                </div>

                <div>
                  <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">
                    Android Package Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    placeholder="io.avanyx.app.terminal"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5]"
                  />
                </div>

                <div>
                  <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">
                    Developer Studio Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={developerName}
                    onChange={(e) => setDeveloperName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5]"
                  />
                </div>

                <div>
                  <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">
                    Store Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AppCategory)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#121316] text-[#1D1B20] dark:text-[#E6E1E5] font-bold"
                  >
                    <option value="PRODUCTIVITY">Productivity</option>
                    <option value="TOOLS">Tools & Utilities</option>
                    <option value="SECURITY">Security & Privacy</option>
                    <option value="GAMES">Games & Entertainment</option>
                    <option value="AI_AGENTS">AI Agents</option>
                    <option value="SOCIAL">Social</option>
                    <option value="MEDIA">Media & Video</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Binary & Release Distribution */}
            <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
              <h3 className="font-bold text-[#1D1B20] dark:text-[#E6E1E5] text-xs uppercase tracking-wider flex items-center gap-2">
                <Github className="w-4 h-4 text-[#6750A4]" /> 2. APK Binary & Distribution (GitHub Releases)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">
                    Version (e.g. 1.0.0) *
                  </label>
                  <input
                    type="text"
                    required
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#121316]"
                  />
                </div>

                <div>
                  <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">
                    Version Code (e.g. 1) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={versionCode}
                    onChange={(e) => setVersionCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#121316]"
                  />
                </div>

                <div>
                  <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">
                    Size in MB (e.g. 24.5) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={sizeMb}
                    onChange={(e) => setSizeMb(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#121316]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">
                  Direct GitHub Release APK Download URL *
                </label>
                <input
                  type="url"
                  required
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  placeholder="https://github.com/org/repo/releases/download/v1.0.0/app-release.apk"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#121316] font-mono text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#49454F] dark:text-[#CAC4D0] font-bold">
                    Authoritative SHA-256 Checksum
                  </label>
                  <button
                    type="button"
                    onClick={() => generateSampleSha('SUBMIT')}
                    className="text-[11px] text-[#6750A4] dark:text-[#D0BCFF] hover:underline font-bold"
                  >
                    Generate Checksum
                  </button>
                </div>
                <input
                  type="text"
                  value={checksumSha256}
                  onChange={(e) => setChecksumSha256(e.target.value)}
                  placeholder="64-character hex string..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#121316] font-mono text-xs"
                />
              </div>
            </div>

            {/* 3. Media Assets */}
            <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
              <h3 className="font-bold text-[#1D1B20] dark:text-[#E6E1E5] text-xs uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#6750A4]" /> 3. Media Assets
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[#49454F] dark:text-[#CAC4D0] font-bold">
                    App Icon (512x512 PNG/WebP)
                  </label>
                  <input
                    type="url"
                    value={iconUrl}
                    onChange={(e) => setIconUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#121316]"
                  />
                  <input type="file" ref={iconInputRef} onChange={handleIconUpload} accept="image/*" className="hidden" />
                  <button
                    type="button"
                    onClick={() => iconInputRef.current?.click()}
                    disabled={isUploadingIcon}
                    className="px-3.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-xs font-bold"
                  >
                    {isUploadingIcon ? 'Uploading...' : 'Upload Icon to Supabase'}
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-[#49454F] dark:text-[#CAC4D0] font-bold">
                    Feature Banner (1024x500 Graphic)
                  </label>
                  <input
                    type="url"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#121316]"
                  />
                  <input type="file" ref={bannerInputRef} onChange={handleBannerUpload} accept="image/*" className="hidden" />
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={isUploadingBanner}
                    className="px-3.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-xs font-bold"
                  >
                    {isUploadingBanner ? 'Uploading...' : 'Upload Banner to Supabase'}
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Description & Details */}
            <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
              <h3 className="font-bold text-[#1D1B20] dark:text-[#E6E1E5] text-xs uppercase tracking-wider flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#6750A4]" /> 4. Store Listing Copy
              </h3>

              <div>
                <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">
                  Full Application Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  placeholder="Detailed description of features, compatibility, and core value..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#121316]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">
                    Key Features (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={featuresText}
                    onChange={(e) => setFeaturesText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#121316]"
                  />
                </div>

                <div>
                  <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold">
                    Release Changelog / What's New
                  </label>
                  <textarea
                    rows={3}
                    value={changelog}
                    onChange={(e) => setChangelog(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#121316]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 rounded-2xl bg-[#6750A4] hover:bg-[#59448F] text-white font-bold text-xs shadow-lg transition flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting App...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    {isAdmin ? 'Publish App to Store Immediately' : 'Submit App for Review'}
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 6. MEDIA ASSETS TAB */}
      {/* ========================================================================= */}
      {activeConsoleTab === 'MEDIA' && (
        <div className="space-y-6">
          <div className="border-b border-black/5 dark:border-white/5 pb-4">
            <h2 className="text-lg font-black text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#6750A4]" /> Supabase Media Storage Manager
            </h2>
            <p className="text-xs text-[#49454F] dark:text-[#CAC4D0]">
              Directly upload and manage assets across all connected Supabase Storage buckets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Uploader Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1D1B20] dark:text-[#E6E1E5]">
                Upload New Asset
              </h3>

              <div>
                <label className="block text-[#49454F] dark:text-[#CAC4D0] mb-1 font-bold text-xs">
                  Target Storage Bucket
                </label>
                <select
                  value={selectedBucket}
                  onChange={(e) => setSelectedBucket(e.target.value as SupabaseBucketName)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#121316] text-xs font-bold"
                >
                  <option value={SUPABASE_BUCKETS.APP_ICONS}>app-icons</option>
                  <option value={SUPABASE_BUCKETS.APP_BANNERS}>app-banners</option>
                  <option value={SUPABASE_BUCKETS.APP_SCREENSHOTS}>app-screenshots</option>
                  <option value={SUPABASE_BUCKETS.APP_VIDEOS}>app-videos</option>
                  <option value={SUPABASE_BUCKETS.DEVELOPER_PROFILE}>developer-profile</option>
                  <option value={SUPABASE_BUCKETS.DEVELOPER_BANNER}>developer-banner</option>
                </select>
              </div>

              <input
                type="file"
                ref={mediaFileInputRef}
                onChange={handleDirectMediaUpload}
                className="hidden"
              />

              <div
                onClick={() => mediaFileInputRef.current?.click()}
                className="border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl p-6 text-center cursor-pointer hover:border-[#6750A4] transition space-y-2"
              >
                <UploadCloud className="w-8 h-8 text-[#6750A4] mx-auto" />
                <p className="text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5]">Click to select media file</p>
                <p className="text-[10px] text-[#49454F] dark:text-[#CAC4D0]">PNG, JPG, WebP, SVG (Max 10MB)</p>
              </div>

              {isUploadingMediaAsset && (
                <div className="flex items-center justify-center gap-2 text-xs text-[#6750A4] font-bold">
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading to Supabase...
                </div>
              )}

              {mediaAssetSuccessUrl && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold block">Upload Success!</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={mediaAssetSuccessUrl}
                      className="w-full px-2 py-1 rounded bg-black/5 dark:bg-white/5 font-mono text-[10px]"
                    />
                    <button
                      onClick={() => navigator.clipboard?.writeText(mediaAssetSuccessUrl)}
                      className="p-1.5 rounded bg-[#6750A4] text-white"
                      title="Copy URL"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {mediaAssetError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-bold">
                  {mediaAssetError}
                </div>
              )}
            </div>

            {/* Upload History & Previews */}
            <div className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1D1B20] dark:text-[#E6E1E5]">
                Uploaded Assets Gallery ({uploadedAssetsHistory.length})
              </h3>

              {uploadedAssetsHistory.length === 0 ? (
                <p className="text-xs text-[#49454F] dark:text-[#CAC4D0] py-8 text-center">
                  Assets uploaded during this session will appear here with copyable public URLs.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
                  {uploadedAssetsHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-2xl bg-[#F3EDF7]/50 dark:bg-[#2B2C30]/50 space-y-2 border border-black/5 dark:border-white/5"
                    >
                      <div className="h-24 rounded-xl overflow-hidden bg-slate-800">
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[11px] font-bold text-[#1D1B20] dark:text-[#E6E1E5] truncate">{item.name}</p>
                      <button
                        onClick={() => navigator.clipboard?.writeText(item.url)}
                        className="w-full py-1 rounded-lg bg-[#6750A4]/10 hover:bg-[#6750A4]/20 text-[#6750A4] dark:text-[#D0BCFF] text-[10px] font-bold flex items-center justify-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copy URL
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODERATION / SUBMISSION STATUS TAB */}
      {/* ========================================================================= */}
      {activeConsoleTab === 'MODERATION' && (
        <div className="space-y-6">
          <div className="border-b border-black/5 dark:border-white/5 pb-4">
            <h2 className="text-lg font-black text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#6750A4]" /> Moderation & Submission Tracking
            </h2>
            <p className="text-xs text-[#49454F] dark:text-[#CAC4D0]">
              Real-time audit history of application reviews and verification status.
            </p>
          </div>

          <div className="space-y-4">
            {developerApps.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#1E1F23] rounded-3xl border border-black/5 dark:border-white/5 space-y-2">
                <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-[#1D1B20] dark:text-[#E6E1E5]">No Submissions Recorded</h3>
                <p className="text-xs text-[#49454F] dark:text-[#CAC4D0]">
                  Your submitted applications and reviewer notes will be tracked here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {developerApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 rounded-3xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#F3EDF7] dark:bg-[#2B2C30] shrink-0">
                        <img
                          src={app.iconUrl}
                          alt={app.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#1D1B20] dark:text-[#E6E1E5]">{app.name}</h4>
                        <p className="text-[11px] font-mono text-[#49454F] dark:text-[#CAC4D0]">{app.packageName}</p>
                        <span className="text-[10px] text-slate-400">Doc ID: {app.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            app.status === 'PUBLISHED' || app.status === 'APPROVED' || !app.status
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : app.status === 'PENDING_REVIEW'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {app.status || 'PUBLISHED'}
                        </span>
                        <span className="block text-[10px] text-[#49454F] dark:text-[#CAC4D0] mt-0.5">
                          {app.status === 'PUBLISHED' ? 'Live on Store' : 'In Review Pipeline'}
                        </span>
                      </div>

                      <button
                        onClick={() => openAppDetails(app.id)}
                        className="px-3.5 py-2 rounded-xl bg-[#F3EDF7] dark:bg-[#2B2C30] hover:bg-[#E8DEF8] text-xs font-bold"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperConsoleScreen;
