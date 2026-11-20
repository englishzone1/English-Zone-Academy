import React from 'react';

// رسومات خاصة بكل ميزة (SVG خفيفة) بألوان English Zone: الكحلي والذهبي
export type FeatureKind = 'placement' | 'certs' | 'rooms' | 'package' | 'platform' | 'community';

const NAVY = '#0A192F';
const NAVY2 = '#102445';
const GOLD = '#D4AF37';
const CREAM = '#F3E5AB';

const Frame: React.FC<{ id: string; children: React.ReactNode; tint?: string }> = ({ id, children, tint = '#1E1B4B' }) => (
  <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full block" role="img" aria-hidden="true">
    <defs>
      <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={tint} />
        <stop offset="0.55" stopColor={NAVY} />
        <stop offset="1" stopColor={NAVY2} />
      </linearGradient>
      <linearGradient id={`gold-${id}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={GOLD} />
        <stop offset="0.5" stopColor={CREAM} />
        <stop offset="1" stopColor={GOLD} />
      </linearGradient>
      <radialGradient id={`glow-${id}`} cx="0.5" cy="0.45" r="0.5">
        <stop offset="0" stopColor={GOLD} stopOpacity="0.35" />
        <stop offset="1" stopColor={GOLD} stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="400" height="300" fill={`url(#bg-${id})`} />
    <circle cx="200" cy="140" r="150" fill={`url(#glow-${id})`} />
    {/* نجوم صغيرة للفخامة */}
    {[
      [40, 40],
      [360, 60],
      [330, 250],
      [60, 255],
      [300, 30],
      [90, 120]
    ].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={i % 2 ? 1.6 : 2.4} fill={CREAM} opacity="0.55" />
    ))}
    {children}
  </svg>
);

export const FeatureArt: React.FC<{ kind: FeatureKind }> = ({ kind }) => {
  const g = (id: string) => `url(#gold-${id})`;
  switch (kind) {
    case 'placement':
      return (
        <Frame id="pl">
          {/* لوح الاختبار */}
          <rect x="120" y="45" width="160" height="200" rx="16" fill="#fff" />
          <rect x="165" y="35" width="70" height="24" rx="8" fill={g('pl')} />
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(140 ${82 + i * 38})`}>
              <rect width="22" height="22" rx="6" fill={i < 2 ? GOLD : '#E5E7EB'} />
              {i < 2 && <path d="M5 11 l5 5 l8 -10" stroke={NAVY} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
              <rect x="32" y="4" width={90 - i * 14} height="6" rx="3" fill={NAVY} opacity="0.8" />
              <rect x="32" y="14" width={60 - i * 8} height="5" rx="2.5" fill="#CBD5E1" />
            </g>
          ))}
          {/* مقياس المستويات */}
          <g transform="translate(50 255)">
            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l, i) => (
              <g key={l} transform={`translate(${i * 50} 0)`}>
                <rect width="46" height="22" rx="11" fill={i === 2 ? GOLD : 'rgba(255,255,255,0.12)'} stroke={GOLD} strokeOpacity="0.5" />
                <text x="23" y="15" textAnchor="middle" fontSize="11" fontWeight="700" fill={i === 2 ? NAVY : CREAM} fontFamily="sans-serif">
                  {l}
                </text>
              </g>
            ))}
          </g>
          <path d="M148 247 l7 -9 l7 9 z" fill={GOLD} />
        </Frame>
      );
    case 'certs':
      return (
        <Frame id="ce" tint="#2B1B0E">
          {/* شهادة خلفية */}
          <rect x="95" y="70" width="210" height="150" rx="10" fill="#FFFDF5" transform="rotate(-6 200 145)" opacity="0.6" />
          <rect x="95" y="60" width="210" height="150" rx="10" fill="#FFFDF5" stroke={GOLD} strokeWidth="4" />
          <rect x="105" y="70" width="190" height="130" rx="6" fill="none" stroke={GOLD} strokeOpacity="0.5" strokeDasharray="4 4" />
          <rect x="150" y="86" width="100" height="10" rx="5" fill={NAVY} />
          <rect x="130" y="108" width="140" height="6" rx="3" fill="#CBD5E1" />
          <rect x="140" y="122" width="120" height="6" rx="3" fill="#CBD5E1" />
          <rect x="125" y="176" width="60" height="4" rx="2" fill={NAVY} opacity="0.5" />
          {/* ميدالية */}
          <path d="M250 175 l-14 45 l14 -8 l12 10 z" fill="#B91C1C" />
          <path d="M268 175 l14 45 l-14 -8 l-12 10 z" fill="#991B1B" />
          <circle cx="259" cy="170" r="24" fill={g('ce')} stroke="#AA820A" strokeWidth="3" />
          <path d="M259 158 l4 8 l9 1 l-7 6 l2 9 l-8 -5 l-8 5 l2 -9 l-7 -6 l9 -1 z" fill={NAVY} />
          {/* ثلاث نجوم = ثلاث شهادات */}
          {[150, 200, 250].map((x, i) => (
            <path key={x} transform={`translate(${x} ${i === 1 ? 30 : 38}) scale(${i === 1 ? 1.2 : 0.9})`} d="M0 -10 l3 7 l8 0.5 l-6 5 l2 8 l-7 -4 l-7 4 l2 -8 l-6 -5 l8 -0.5 z" fill={CREAM} />
          ))}
        </Frame>
      );
    case 'rooms':
      return (
        <Frame id="ro">
          {/* موجات صوت */}
          {[70, 95, 120].map((r) => (
            <circle key={r} cx="200" cy="150" r={r} fill="none" stroke={GOLD} strokeOpacity={0.5 - r / 400} strokeWidth="2" />
          ))}
          {/* ميكروفون */}
          <circle cx="200" cy="150" r="44" fill={g('ro')} />
          <rect x="188" y="122" width="24" height="38" rx="12" fill={NAVY} />
          <path d="M180 150 a20 20 0 0 0 40 0" stroke={NAVY} strokeWidth="4" fill="none" strokeLinecap="round" />
          <rect x="198" y="170" width="4" height="10" fill={NAVY} />
          {/* أشخاص حول الدائرة */}
          {[
            [80, 70, '#F9A8D4'],
            [320, 70, '#93C5FD'],
            [60, 200, '#FCD34D'],
            [340, 200, '#86EFAC'],
            [200, 268, '#C4B5FD']
          ].map(([x, y, c], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <circle r="22" fill={c as string} stroke={CREAM} strokeWidth="3" />
              <circle cy="-4" r="7" fill={NAVY} opacity="0.75" />
              <path d="M-11 12 a11 9 0 0 1 22 0" fill={NAVY} opacity="0.75" />
            </g>
          ))}
          {/* فقاعة كلام */}
          <g transform="translate(250 92)">
            <rect width="70" height="30" rx="15" fill="#fff" />
            <path d="M14 28 l-6 12 l14 -10 z" fill="#fff" />
            <text x="35" y="20" textAnchor="middle" fontSize="13" fontWeight="700" fill={NAVY} fontFamily="sans-serif">
              Hello!
            </text>
          </g>
        </Frame>
      );
    case 'package':
      return (
        <Frame id="pk" tint="#0E2A2A">
          {/* حقيبة */}
          <rect x="110" y="95" width="180" height="140" rx="18" fill={g('pk')} />
          <path d="M165 95 v-18 a10 10 0 0 1 10 -10 h50 a10 10 0 0 1 10 10 v18" stroke={GOLD} strokeWidth="8" fill="none" />
          <rect x="110" y="140" width="180" height="10" fill="#AA820A" opacity="0.6" />
          <rect x="188" y="134" width="24" height="22" rx="4" fill={NAVY} />
          {/* عناصر تخرج من الحقيبة */}
          <g transform="translate(60 40) rotate(-12)">
            <rect width="62" height="80" rx="6" fill="#fff" />
            <rect x="8" y="10" width="46" height="6" rx="3" fill={NAVY} />
            <rect x="8" y="24" width="38" height="4" rx="2" fill="#CBD5E1" />
            <rect x="8" y="34" width="42" height="4" rx="2" fill="#CBD5E1" />
            <text x="31" y="66" textAnchor="middle" fontSize="16" fontWeight="800" fill={GOLD} fontFamily="serif">
              ABC
            </text>
          </g>
          <g transform="translate(290 50)">
            <path d="M0 30 a28 28 0 0 1 56 0" stroke={CREAM} strokeWidth="6" fill="none" />
            <rect x="-6" y="26" width="16" height="26" rx="6" fill={CREAM} />
            <rect x="46" y="26" width="16" height="26" rx="6" fill={CREAM} />
          </g>
          <g transform="translate(165 245)">
            <rect width="70" height="44" rx="8" fill="#fff" />
            <path d="M28 12 l18 10 l-18 10 z" fill={GOLD} />
          </g>
        </Frame>
      );
    case 'platform':
      return (
        <Frame id="pf" tint="#0B2447">
          {/* حاسوب */}
          <rect x="75" y="50" width="250" height="160" rx="12" fill="#fff" />
          <rect x="75" y="50" width="250" height="24" rx="12" fill={NAVY2} />
          <circle cx="92" cy="62" r="4" fill="#F87171" />
          <circle cx="106" cy="62" r="4" fill="#FBBF24" />
          <circle cx="120" cy="62" r="4" fill="#34D399" />
          <path d="M55 215 h290 l-20 18 h-250 z" fill={CREAM} />
          {/* أعمدة تقدّم */}
          {[38, 62, 50, 84, 104].map((h, i) => (
            <rect key={i} x={100 + i * 26} y={190 - h} width="16" height={h} rx="4" fill={i === 4 ? GOLD : NAVY} opacity={i === 4 ? 1 : 0.75} />
          ))}
          {/* حلقة النسبة */}
          <circle cx="270" cy="130" r="34" fill="none" stroke="#E5E7EB" strokeWidth="10" />
          <circle cx="270" cy="130" r="34" fill="none" stroke={GOLD} strokeWidth="10" strokeDasharray="170 214" strokeLinecap="round" transform="rotate(-90 270 130)" />
          <text x="270" y="136" textAnchor="middle" fontSize="16" fontWeight="800" fill={NAVY} fontFamily="sans-serif">
            80%
          </text>
          {/* علامة صح */}
          <circle cx="330" cy="58" r="20" fill={g('pf')} />
          <path d="M321 58 l6 6 l12 -13" stroke={NAVY} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Frame>
      );
    case 'community':
      return (
        <Frame id="cm" tint="#3B0F3A">
          {/* كرة أرضية خفيفة */}
          <circle cx="200" cy="150" r="88" fill="none" stroke={GOLD} strokeOpacity="0.35" strokeWidth="2" />
          <ellipse cx="200" cy="150" rx="40" ry="88" fill="none" stroke={GOLD} strokeOpacity="0.25" strokeWidth="2" />
          <path d="M112 150 h176 M125 105 h150 M125 195 h150" stroke={GOLD} strokeOpacity="0.25" strokeWidth="2" />
          {/* أشخاص مترابطون */}
          {[
            [200, 95, 30, '#FCD34D'],
            [130, 170, 26, '#F9A8D4'],
            [270, 170, 26, '#93C5FD'],
            [175, 225, 22, '#86EFAC'],
            [235, 225, 22, '#C4B5FD']
          ].map(([x, y, r, c], i) => (
            <g key={i}>
              <circle cx={x as number} cy={y as number} r={r as number} fill={c as string} stroke={CREAM} strokeWidth="3" />
              <circle cx={x as number} cy={(y as number) - (r as number) * 0.18} r={(r as number) * 0.32} fill={NAVY} opacity="0.75" />
              <path
                d={`M${(x as number) - (r as number) * 0.5} ${(y as number) + (r as number) * 0.55} a${(r as number) * 0.5} ${(r as number) * 0.4} 0 0 1 ${r as number} 0`}
                fill={NAVY}
                opacity="0.75"
              />
            </g>
          ))}
          <path d="M200 125 L130 170 M200 125 L270 170 M130 170 L175 225 M270 170 L235 225 M175 225 L235 225" stroke={GOLD} strokeWidth="2" strokeDasharray="5 5" />
          {/* قلب وفقاعة */}
          <path d="M320 70 c-8 -10 -24 -2 -16 12 l16 14 l16 -14 c8 -14 -8 -22 -16 -12 z" fill="#F43F5E" />
          <g transform="translate(55 60)">
            <rect width="54" height="30" rx="15" fill="#fff" />
            <circle cx="16" cy="15" r="3.5" fill={NAVY} />
            <circle cx="27" cy="15" r="3.5" fill={NAVY} />
            <circle cx="38" cy="15" r="3.5" fill={NAVY} />
          </g>
        </Frame>
      );
  }
};
