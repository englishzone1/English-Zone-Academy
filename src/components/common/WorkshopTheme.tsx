import React from 'react';

// مظهر صفحات الورش والشهادات: «أزرق سينمائي» أو «أبيض»، والخلفية نفسها في الصفحتين
export type WsTheme = 'blue' | 'white';

export const WS_THEMES: { id: WsTheme; label: string; swatch: string }[] = [
  { id: 'blue', label: 'أزرق سينمائي', swatch: 'radial-gradient(circle at 50% 35%, #3f8fff 0%, #0b2a6b 45%, #020714 100%)' },
  { id: 'white', label: 'أبيض', swatch: '#ffffff' }
];

// متغيرات الألوان لكل مظهر (تُستعمل في الصفحات عبر var(--…))
export const wsVars = (theme: WsTheme | undefined, accent: string, soft: string): React.CSSProperties =>
  (theme === 'blue'
    ? {
        '--wc': '#3b8cff',
        '--wl': 'rgba(60,140,255,.16)',
        '--card': 'rgba(6,22,60,.62)',
        '--ink': '#ffffff',
        '--muted': '#a9cdf5',
        '--line': 'rgba(150,205,255,.32)',
        '--btn': '#2f7bff',
        '--btnInk': '#ffffff'
      }
    : {
        '--wc': accent,
        '--wl': soft,
        '--card': '#ffffff',
        '--ink': '#1f2433',
        '--muted': '#6b6f7b',
        '--line': '#e5e7ee',
        '--btn': accent,
        '--btnInk': '#ffffff'
      }) as React.CSSProperties;

// نقاط الضوء (ثابتة حتى لا تتغير بين التحميلات)
const BOKEH = [
  [8, 12, 26, 0.45], [22, 70, 14, 0.5], [35, 30, 34, 0.3], [48, 88, 18, 0.55], [62, 18, 12, 0.6], [74, 54, 30, 0.35],
  [88, 26, 20, 0.5], [93, 78, 38, 0.3], [15, 46, 10, 0.6], [55, 62, 24, 0.3], [80, 92, 14, 0.5], [30, 95, 28, 0.35],
  [4, 84, 16, 0.45], [68, 40, 10, 0.55], [42, 8, 22, 0.4], [97, 50, 12, 0.5]
];

export const WsBackdrop: React.FC<{ theme?: WsTheme }> = ({ theme }) => {
  if (theme !== 'blue') return <div className="fixed inset-0 z-0 bg-white" aria-hidden />;
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden style={{ background: '#030a1a' }}>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, rgba(64,150,255,.50) 0%, rgba(20,70,170,.32) 30%, rgba(3,10,26,0) 65%),' +
            'radial-gradient(ellipse at 15% 110%, rgba(0,190,255,.22) 0%, rgba(3,10,26,0) 45%),' +
            'radial-gradient(ellipse at 90% -10%, rgba(80,110,255,.28) 0%, rgba(3,10,26,0) 45%),' +
            'linear-gradient(180deg,#020714 0%,#061638 50%,#020714 100%)'
        }}
      />
      <div
        className="absolute"
        style={{
          inset: '-20%',
          mixBlendMode: 'screen',
          background:
            'conic-gradient(from 200deg at 50% -10%, rgba(120,190,255,0) 0deg, rgba(120,190,255,.10) 8deg, rgba(120,190,255,0) 16deg, rgba(120,190,255,.07) 26deg, rgba(120,190,255,0) 34deg, rgba(120,190,255,.09) 46deg, rgba(120,190,255,0) 56deg)'
        }}
      />
      {BOKEH.map(([x, y, s, o], i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, opacity: o, filter: 'blur(2px)', background: 'radial-gradient(circle, rgba(140,200,255,.6), rgba(140,200,255,0) 70%)' }}
        />
      ))}
    </div>
  );
};

// اختيار المظهر في لوحة الإدارة
export const WsThemePicker: React.FC<{ value: WsTheme; onChange: (t: WsTheme) => void }> = ({ value, onChange }) => (
  <div className="flex gap-2">
    {WS_THEMES.map((t) => (
      <button
        key={t.id}
        type="button"
        onClick={() => onChange(t.id)}
        className={`flex-1 flex items-center gap-2 p-2 rounded-xl border-2 text-xs font-bold ${value === t.id ? 'border-[#D4AF37]' : 'border-gray-200'}`}
      >
        <span className="w-8 h-8 rounded-lg border border-gray-300 shrink-0" style={{ background: t.swatch }} />
        {t.label}
      </button>
    ))}
  </div>
);
