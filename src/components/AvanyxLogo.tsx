import React, { useState } from 'react';

interface AvanyxLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  compact?: boolean;
  src?: string;
}

export const AvanyxLogo: React.FC<AvanyxLogoProps> = ({
  className = '',
  size = 36,
  showText = true,
  compact = false,
  src = '/avanyx-logo.svg',
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Icon Logo Squircle */}
      <div
        className="relative shrink-0 flex items-center justify-center overflow-hidden rounded-2xl shadow-md transition-transform duration-200 group-hover:scale-105"
        style={{
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
      >
        {!imgError ? (
          <img
            src={src}
            alt="AVANYX"
            className="w-full h-full object-contain rounded-2xl"
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
          />
        ) : (
          <svg
            viewBox="0 0 512 512"
            fill="none"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="avxGradFallback" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9333EA" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
            </defs>
            <rect width="512" height="512" rx="128" fill="url(#avxGradFallback)" />
            <path
              d="M 256 128 L 388 384 L 324 384 L 298 330 L 214 330 L 188 384 L 124 384 Z M 256 220 L 228 280 L 284 280 Z"
              fill="#FFFFFF"
              fillRule="evenodd"
            />
          </svg>
        )}
      </div>

      {/* Typography Badge (shown when not compact and showText is true) */}
      {showText && !compact && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-base font-black tracking-tight text-[#1D1B20] dark:text-[#E6E1E5]">
              AVANYX
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#6750A4]/15 dark:bg-[#D0BCFF]/20 text-[#6750A4] dark:text-[#D0BCFF] font-bold tracking-wider uppercase">
              STORE
            </span>
          </div>
          <span className="text-[9px] text-[#49454F] dark:text-[#CAC4D0] font-semibold tracking-wider mt-1 uppercase truncate">
            Verified APK Marketplace
          </span>
        </div>
      )}
    </div>
  );
};
