import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'footer';
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ className = '', variant = 'light', onClick }) => {
  const isDarkBg = variant === 'dark' || variant === 'footer';

  return (
    <div 
      onClick={onClick} 
      className={`inline-flex items-center gap-3 cursor-pointer select-none group ${className}`}
    >
      {/* Luxury Crest Icon */}
      <div className="relative w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#0A192F] via-[#102445] to-[#060D1A] border border-[#D4AF37]/50 shadow-md group-hover:border-[#D4AF37] transition-all duration-300">
        <svg 
          viewBox="0 0 48 48" 
          fill="none" 
          className="w-7 h-7 transform group-hover:scale-105 transition-transform"
        >
          {/* Shield outline */}
          <path 
            d="M24 4L38 9V22C38 31.5 32 39.5 24 44C16 39.5 10 31.5 10 22V9L24 4Z" 
            stroke="#D4AF37" 
            strokeWidth="2" 
            fill="#0A192F"
          />
          {/* Inner Laurel / Star */}
          <path 
            d="M24 10L27 18H35L28.5 23L31 31L24 26.5L17 31L19.5 23L13 18H21L24 10Z" 
            fill="url(#goldGrad)" 
            opacity="0.9"
          />
          {/* Monogram EZ */}
          <text 
            x="24" 
            y="37" 
            textAnchor="middle" 
            fill="#F3E5AB" 
            fontSize="8" 
            fontWeight="bold" 
            fontFamily="Cinzel, serif"
            letterSpacing="1"
          >
            EZ
          </text>
          <defs>
            <linearGradient id="goldGrad" x1="13" y1="10" x2="35" y2="31" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F5D77F" />
              <stop offset="0.5" stopColor="#D4AF37" />
              <stop offset="1" stopColor="#AA820A" />
            </linearGradient>
          </defs>
        </svg>

        {/* Subtle decorative gold dot */}
        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#D4AF37] border border-[#0A192F]"></div>
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-serif-luxury font-bold tracking-wider text-xl leading-none transition-colors ${
            isDarkBg ? 'text-white group-hover:text-[#F3E5AB]' : 'text-[#0A192F] group-hover:text-[#AA820A]'
          }`}>
            ENGLISH ZONE
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#D4AF37] mt-1 leading-none">
          International Academy
        </span>
      </div>
    </div>
  );
};
