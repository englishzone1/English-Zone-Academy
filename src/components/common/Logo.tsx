import React, { useState } from 'react';

export const OFFICIAL_LOGO_IMAGE_PATH = '/assets/aistudio/20260723_182408_0000_018fe01c.png';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'footer' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSlogan?: boolean;
  onClick?: () => void;
}

/**
 * Official English Zone Emblem
 * Renders the official 3D metallic medallion asset uploaded by the user:
 * - Brushed navy dial with polished silver/chrome bevel
 * - Open Book representing "LEARN"
 * - Speech Bubble with 5-pointed star representing "SPEAK"
 * - Upward rising growth arrow representing "GROW"
 * - "ENGLISH ZONE" and "LEARN. SPEAK. GROW."
 */
export const EnglishZoneEmblem: React.FC<{
  sizeClass?: string;
  glow?: boolean;
  className?: string;
  showBevelBorder?: boolean;
}> = ({
  sizeClass = 'w-11 h-11',
  glow = true,
  className = '',
  showBevelBorder = true,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`relative ${sizeClass} flex-shrink-0 flex items-center justify-center ${className}`}>
      {/* Outer ambient gold glow */}
      {glow && (
        <div className="absolute inset-0 rounded-full bg-[#D4AF37]/25 blur-md scale-110 pointer-events-none" />
      )}

      {/* Official 3D Medallion Image */}
      <div
        className={`w-full h-full rounded-full overflow-hidden shadow-lg ${
          showBevelBorder ? 'border border-[#D4AF37]/50 ring-1 ring-white/20' : ''
        } bg-[#0A192F] relative flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}
      >
        {!imageError ? (
          <img
            src={OFFICIAL_LOGO_IMAGE_PATH}
            alt="English Zone Official Logo"
            className="w-full h-full object-cover scale-[1.17] select-none pointer-events-none"
            loading="eager"
            onError={() => setImageError(true)}
          />
        ) : (
          /* High-fidelity Vector Fallback if image fails to load */
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
            <circle cx="50" cy="50" r="47.5" fill="#D4AF37" />
            <circle cx="50" cy="50" r="44" fill="#0A192F" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#D4AF37" strokeWidth="1" strokeDasharray="2 1" />
            <path d="M 23 71.5 L 23 74.5 C 33 78 43 78.5 50 75.5 C 57 78.5 67 78 77 74.5 L 77 71.5 Z" fill="#D4AF37" />
            <path d="M 50 60 C 42 63.5 32 62.5 22 57.5 L 22 69 C 32 74 42 75 50 71.5 Z" fill="#FAF8F5" />
            <path d="M 50 60 C 58 63.5 68 62.5 78 57.5 L 78 69 C 68 74 58 75 50 71.5 Z" fill="#E8E4DA" />
            <path d="M 50 59.5 L 50 72.5" stroke="#D4AF37" strokeWidth="1.8" />
            <path d="M 37.5 19 C 46.5 19 54 26 54 34.5 C 54 38.6 52.3 42.4 49.3 45.2 L 51.5 53.5 L 43.6 49.5 C 41.7 50.1 39.6 50.5 37.5 50.5 C 28.5 50.5 21 43.5 21 34.5 C 21 26 28.5 19 37.5 19 Z" fill="#D4AF37" />
            <polygon points="37.5,27.2 39.6,31.7 44.5,32.4 40.9,35.9 41.8,40.8 37.5,38.5 33.2,40.8 34.1,35.9 30.5,32.4 35.4,31.7" fill="#FFF" />
            <path d="M 47 62.5 L 56 50.5 L 61 53.5 L 72.5 35.5" stroke="#FFF" strokeWidth="3" strokeLinecap="round" />
            <polygon points="79,26.5 67,29.5 70.8,33.5 66.5,39.5 71,42.5 75.2,36.5 79,40.5" fill="#FFF" />
          </svg>
        )}
      </div>
    </div>
  );
};

export const Logo: React.FC<LogoProps> = ({
  className = '',
  variant = 'light',
  size = 'md',
  showSlogan = true,
  onClick,
}) => {
  const isDarkBg = variant === 'dark' || variant === 'footer';

  // Sizing definitions
  const sizeMap = {
    sm: {
      emblem: 'w-8 h-8',
      title: 'text-lg',
      slogan: 'text-[8.5px]',
      gap: 'gap-2.5',
    },
    md: {
      emblem: 'w-10 h-10 sm:w-11 sm:h-11',
      title: 'text-xl',
      slogan: 'text-[9.5px]',
      gap: 'gap-3',
    },
    lg: {
      emblem: 'w-14 h-14',
      title: 'text-2xl',
      slogan: 'text-[11px]',
      gap: 'gap-3.5',
    },
    xl: {
      emblem: 'w-20 h-20',
      title: 'text-3xl',
      slogan: 'text-xs',
      gap: 'gap-4',
    },
  }[size];

  // If badge variant is requested, return the full standalone circular medallion
  if (variant === 'badge') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex flex-col items-center text-center select-none group ${
          onClick ? 'cursor-pointer' : ''
        } ${className}`}
      >
        <div className="transform group-hover:scale-105 transition-all duration-300">
          <EnglishZoneEmblem sizeClass={sizeMap.emblem} glow={true} />
        </div>
        <div className="mt-2 flex flex-col items-center">
          <span className="font-serif-luxury font-bold tracking-widest text-[#0A192F] group-hover:text-[#AA820A] transition-colors">
            ENGLISH ZONE
          </span>
          <span className="text-[9px] uppercase tracking-[0.28em] font-semibold text-[#D4AF37]">
            LEARN • SPEAK • GROW
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center ${sizeMap.gap} select-none group ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Official English Zone 3D Medallion Emblem */}
      <div className="transform group-hover:scale-105 transition-transform duration-300">
        <EnglishZoneEmblem sizeClass={sizeMap.emblem} glow={isDarkBg} />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center">
          <span
            className={`font-serif-luxury font-bold tracking-wider ${sizeMap.title} leading-none transition-colors duration-200 ${
              isDarkBg
                ? 'text-white group-hover:text-[#F3E5AB]'
                : 'text-[#0A192F] group-hover:text-[#AA820A]'
            }`}
          >
            ENGLISH ZONE
          </span>
        </div>

        {/* Official Academy Motto from the Brand Asset: "LEARN. SPEAK. GROW." */}
        {showSlogan && (
          <div className="flex items-center gap-1.5 mt-1 leading-none">
            <span
              className={`${sizeMap.slogan} uppercase tracking-[0.24em] font-semibold text-[#D4AF37] transition-colors group-hover:text-[#F5D77F]`}
            >
              LEARN. SPEAK. GROW.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
