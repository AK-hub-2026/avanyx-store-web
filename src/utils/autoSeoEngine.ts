import { StoreApp, NavigationTab, DeveloperProfile } from '../types';

export const PRIMARY_SEO_KEYWORDS = [
  'AVANYX Store',
  'AVANYX App Store',
  'Secure App Marketplace',
  'Android App Store',
  'AI Verified APK',
  'APK Download',
  'Bomb Rush 3D',
  'AVANYX AutoPDF',
  'Developer Console',
  'Student Publishing',
  'AVANYX Developer Console',
  'Android App Publishing',
  'Student App Publishing',
  'Publish Android Apps',
  'Upload APK',
  'Software Developer Marketplace',
  'Developer Registration',
  'Student Developer Platform',
  'Indie Android Developers',
  'AI Verified Developer Apps',
  'Malware Free APK',
  'Android Apps',
  'Android Games',
  'AVANYX Identity'
];

export const SITE_ORIGIN = 'https://avanyxstore.org';

/**
 * Extracts auto-generated keywords for any published app
 */
export function generateAppKeywords(app: StoreApp): string {
  const dynamicWords: string[] = [
    app.name,
    `${app.name} APK`,
    `${app.name} Download`,
    `${app.name} Android`,
    app.category,
    app.developer || 'AVANYX Developer',
    app.packageName
  ];

  if (app.tags && Array.isArray(app.tags)) {
    dynamicWords.push(...app.tags);
  }

  // Deduplicate and combine with primary keywords
  const combined = Array.from(new Set([...dynamicWords, ...PRIMARY_SEO_KEYWORDS]));
  return combined.slice(0, 30).join(', ');
}

/**
 * Generates full SEO metadata package for a given app
 */
export interface SeoMetadataPackage {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogImage: string;
  ogType: string;
  jsonLdSchema: Record<string, any>;
}

export function generateAppSeoData(app: StoreApp, origin: string = SITE_ORIGIN): SeoMetadataPackage {
  const title = `${app.name} APK Download (v${app.version || '1.0.0'}) - AVANYX Store`;
  const rawDesc = (app as any).tagline || app.description || app.fullDescription || 'AI-verified secure Android application.';
  const cleanDesc = rawDesc.replace(/(<([^>]+)>)/gi, '').slice(0, 155);
  const description = `Download ${app.name} APK v${app.version || '1.0.0'} on AVANYX Store. ${cleanDesc} Direct, AI-verified, malware-scanned APK download.`;
  const keywords = generateAppKeywords(app);
  const canonicalUrl = `${origin}/app/${app.id}`;
  const ogImage = app.iconUrl || app.bannerUrl || `${origin}/avanyx-logo.svg`;

  const catStr = (app.category || '').toString().toUpperCase();
  const isGame = catStr === 'GAME' || catStr === 'GAMES' || catStr === 'ACTION' || catStr === 'ARCADE' || catStr === 'CASUAL' || catStr === 'RACING';

  const jsonLdSchema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': isGame ? 'SoftwareApplication' : 'SoftwareApplication',
    'name': app.name,
    'operatingSystem': 'Android',
    'applicationCategory': isGame ? 'GameApplication' : `${app.category || 'Mobile'}Application`,
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
      'availability': 'https://schema.org/InStock'
    },
    'softwareVersion': app.version || '1.0.0',
    'fileSize': app.apkSize || '15 MB',
    'downloadUrl': app.downloadUrl || canonicalUrl,
    'author': {
      '@type': 'Organization',
      'name': app.developer || 'AVANYX Verified Developer'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'AVANYX Store',
      'url': origin,
      'logo': `${origin}/avanyx-logo.svg`
    },
    'image': app.iconUrl,
    'description': cleanDesc,
    'mainEntityOfPage': canonicalUrl
  };

  if (app.rating) {
    jsonLdSchema['aggregateRating'] = {
      '@type': 'AggregateRating',
      'ratingValue': app.rating.toString(),
      'reviewCount': (app.reviewCount || 12).toString(),
      'bestRating': '5',
      'worstRating': '1'
    };
  }

  return {
    title,
    description,
    keywords,
    canonicalUrl,
    ogImage,
    ogType: 'mobile_application',
    jsonLdSchema
  };
}

/**
 * Generates SEO metadata package for primary store tabs
 */
export function generateTabSeoData(
  tab: NavigationTab,
  options?: {
    searchQuery?: string;
    developer?: DeveloperProfile | null;
    origin?: string;
  }
): SeoMetadataPackage {
  const origin = options?.origin || SITE_ORIGIN;
  const q = options?.searchQuery ? options.searchQuery.trim() : '';

  if (q) {
    return {
      title: `Search "${q}" - AVANYX App Store`,
      description: `Browse AI-verified APK download search results for "${q}" on AVANYX Store. Secure Android apps and games marketplace.`,
      keywords: `${q}, search ${q}, ${PRIMARY_SEO_KEYWORDS.join(', ')}`,
      canonicalUrl: `${origin}/store?q=${encodeURIComponent(q)}`,
      ogImage: `${origin}/avanyx-logo.svg`,
      ogType: 'website',
      jsonLdSchema: {
        '@context': 'https://schema.org',
        '@type': 'SearchResultsPage',
        'name': `Search results for "${q}" on AVANYX Store`,
        'url': `${origin}/store?q=${encodeURIComponent(q)}`
      }
    };
  }

  switch (tab) {
    case 'INTRO':
      return {
        title: 'AVANYX Store - Official Secure App Marketplace & AI Publishing Platform',
        description: 'Official AVANYX App Store featuring native Android client, Store Profile, Developer Console, Student Publishing, AI verification pipeline, and verified APK downloads.',
        keywords: PRIMARY_SEO_KEYWORDS.join(', '),
        canonicalUrl: `${origin}/`,
        ogImage: `${origin}/avanyx-logo.svg`,
        ogType: 'website',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          'name': 'AVANYX Store',
          'url': origin,
          'logo': `${origin}/avanyx-logo.svg`,
          'description': 'Official secure app marketplace with native Android client, Developer Console, and Student Publishing.',
          'sameAs': [
            'https://twitter.com/avanyxstore',
            'https://github.com/avanyxstore'
          ]
        }
      };

    case 'GAMES':
      return {
        title: 'Android Games APK Downloads - Bomb Rush 3D & Action Games | AVANYX Store',
        description: 'Explore and download top AI-verified Android games on AVANYX Store. Featuring Bomb Rush 3D, high FPS arcade titles, and malware-scanned APKs.',
        keywords: `Android Games, Bomb Rush 3D, Game APK, ${PRIMARY_SEO_KEYWORDS.join(', ')}`,
        canonicalUrl: `${origin}/games`,
        ogImage: `${origin}/avanyx-logo.svg`,
        ogType: 'website',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          'name': 'Android Games - AVANYX Store',
          'description': 'Verified Android games APK directory on AVANYX Store.',
          'url': `${origin}/games`
        }
      };

    case 'APPS':
      return {
        title: 'Android Apps Directory - AVANYX AutoPDF & Utilities | AVANYX Store',
        description: 'Discover AI-verified productivity, utility, and student apps on AVANYX Store. Download AVANYX AutoPDF and secure utility APKs directly.',
        keywords: `Android Apps, AVANYX AutoPDF, PDF Tools, Utility APK, ${PRIMARY_SEO_KEYWORDS.join(', ')}`,
        canonicalUrl: `${origin}/apps`,
        ogImage: `${origin}/avanyx-logo.svg`,
        ogType: 'website',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          'name': 'Android Apps Directory - AVANYX Store',
          'description': 'Verified Android utility and productivity apps on AVANYX Store.',
          'url': `${origin}/apps`
        }
      };

    case 'DEVELOPER_PROFILE':
      if (options?.developer) {
        const devName = options.developer.displayName || options.developer.organizationName || 'Developer';
        return {
          title: `${devName} Developer Profile - Published Apps | AVANYX Store`,
          description: `View published Android applications and verified developer portfolio for ${devName} on AVANYX Store.`,
          keywords: `${devName}, ${devName} apps, developer portfolio, ${PRIMARY_SEO_KEYWORDS.join(', ')}`,
          canonicalUrl: `${origin}/developer-profile/${options.developer.uid}`,
          ogImage: options.developer.avatarUrl || `${origin}/avanyx-logo.svg`,
          ogType: 'profile',
          jsonLdSchema: {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            'name': devName,
            'description': options.developer.bio || `Developer profile for ${devName} on AVANYX Store.`,
            'url': `${origin}/developer-profile/${options.developer.uid}`
          }
        };
      }
      break;

    case 'DEVELOPER_APPLY':
      return {
        title: 'Apply for Developer Console - Publish Android Apps | AVANYX Store',
        description: 'Join AVANYX Store Developer Program. Upload APKs, access security scan analytics, manage releases, and publish to thousands of users.',
        keywords: `Developer Console, Publish Android App, Developer Verification, ${PRIMARY_SEO_KEYWORDS.join(', ')}`,
        canonicalUrl: `${origin}/developer/apply`,
        ogImage: `${origin}/avanyx-logo.svg`,
        ogType: 'website',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          'name': 'Developer Program Application - AVANYX Store',
          'url': `${origin}/developer/apply`
        }
      };

    case 'STUDENT_APPLY':
      return {
        title: 'Student Publishing Program - 100% Free App Publishing | AVANYX Store',
        description: 'Publish your student software projects and Android apps completely free on AVANYX Store with verified student status and zero developer fees.',
        keywords: `Student Publishing, Free App Hosting, Student Developers, ${PRIMARY_SEO_KEYWORDS.join(', ')}`,
        canonicalUrl: `${origin}/student/apply`,
        ogImage: `${origin}/avanyx-logo.svg`,
        ogType: 'website',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          'name': 'Student Publishing Program - AVANYX Store',
          'url': `${origin}/student/apply`
        }
      };

    case 'HOME':
    default:
      return {
        title: 'AVANYX Store - Secure App Marketplace & APK Downloads',
        description: 'Official AVANYX Store app marketplace. Direct APK downloads for Android apps and games, malware-scanned with AI security verification.',
        keywords: PRIMARY_SEO_KEYWORDS.join(', '),
        canonicalUrl: `${origin}/store`,
        ogImage: `${origin}/avanyx-logo.svg`,
        ogType: 'website',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          'name': 'AVANYX Store',
          'url': `${origin}/store`,
          'potentialAction': {
            '@type': 'SearchAction',
            'target': `${origin}/store?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
          }
        }
      };
  }

  return {
    title: 'AVANYX Store - Secure App Marketplace',
    description: 'Official AVANYX Store app marketplace with native Android client, Developer Console, Student Publishing, and AI verified APK downloads.',
    keywords: PRIMARY_SEO_KEYWORDS.join(', '),
    canonicalUrl: `${origin}/store`,
    ogImage: `${origin}/avanyx-logo.svg`,
    ogType: 'website',
    jsonLdSchema: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'AVANYX Store',
      'url': `${origin}/store`
    }
  };
}

/**
 * Dynamically updates document head tags for instant SEO sync
 */
export function applySeoMetadataToDOM(seo: SeoMetadataPackage) {
  if (typeof document === 'undefined') return;

  // 1. Page Title
  document.title = seo.title;

  // Helper for setting meta tags
  const setMetaTag = (selector: string, attrName: string, attrVal: string, content: string) => {
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrVal);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Helper for setting link tags
  const setLinkTag = (rel: string, href: string) => {
    let el = document.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      document.head.appendChild(el);
    }
    el.setAttribute('href', href);
  };

  // 2. Standard Meta Tags
  setMetaTag('meta[name="description"]', 'name', 'description', seo.description);
  setMetaTag('meta[name="keywords"]', 'name', 'keywords', seo.keywords);

  // 3. Open Graph Tags
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', seo.title);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', seo.description);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', seo.canonicalUrl);
  setMetaTag('meta[property="og:image"]', 'property', 'og:image', seo.ogImage);
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', seo.ogType);
  setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'AVANYX Store');

  // 4. Twitter Tags
  setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', seo.title);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', seo.description);
  setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', seo.ogImage);

  // 5. Canonical Link
  setLinkTag('canonical', seo.canonicalUrl);

  // 6. Dynamic JSON-LD Script Injection
  let jsonLdScript = document.querySelector('script#dynamic-seo-jsonld');
  if (!jsonLdScript) {
    jsonLdScript = document.createElement('script');
    jsonLdScript.setAttribute('type', 'application/ld+json');
    jsonLdScript.setAttribute('id', 'dynamic-seo-jsonld');
    document.head.appendChild(jsonLdScript);
  }
  jsonLdScript.textContent = JSON.stringify(seo.jsonLdSchema, null, 2);
}

interface SitemapItem {
  loc: string;
  priority: string;
  changefreq: string;
  lastmod?: string;
}

/**
 * Builds dynamic XML sitemap string from live published apps array
 */
export function generateDynamicSitemapXml(apps: StoreApp[], origin: string = SITE_ORIGIN): string {
  const staticUrls: SitemapItem[] = [
    { loc: `${origin}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${origin}/store`, priority: '0.9', changefreq: 'hourly' },
    { loc: `${origin}/apps`, priority: '0.8', changefreq: 'daily' },
    { loc: `${origin}/games`, priority: '0.8', changefreq: 'daily' },
    { loc: `${origin}/developer/apply`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${origin}/student/apply`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${origin}/login`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${origin}/signup`, priority: '0.5', changefreq: 'monthly' }
  ];

  const appUrls: SitemapItem[] = apps.map((app) => ({
    loc: `${origin}/app/${app.id}`,
    priority: app.isFeatured ? '0.9' : '0.8',
    changefreq: 'weekly',
    lastmod: new Date().toISOString().split('T')[0]
  }));

  const allUrls = [...staticUrls, ...appUrls];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  allUrls.forEach((u) => {
    xml += `  <url>\n`;
    xml += `    <loc>${u.loc}</loc>\n`;
    if (u.lastmod) xml += `    <lastmod>${u.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${u.changefreq}</changefreq>\n`;
    xml += `    <priority>${u.priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;
  return xml;
}
