import React from 'react';
import { EZAvatarConfig, shade, toEZAvatar } from './ezAvatar';

interface Props {
  config?: any;
  view?: 'full' | 'head';
  size?: number | string;
  showBackground?: boolean;
  className?: string;
  rounded?: boolean;
  // جنس صاحب الأفاتار: رجل للطالب وامرأة للطالبة إن لم يصمّم أفاتاره
  gender?: string;
}

const DARK = '#2B211C';

// رسم الأفاتار بصيغة SVG: ألوان مسطحة نظيفة وظلال خفيفة
export const EZAvatar: React.FC<Props> = ({ config, view = 'head', size = 120, showBackground = true, className = '', rounded = true, gender }) => {
  const a: EZAvatarConfig = toEZAvatar(config, gender);
  const female = a.gender === 'female';
  const hijab = female && a.hijab !== 'none';

  const skin = a.skin;
  const skinShade = shade(skin, -0.12);
  const oc = a.outfitColor;
  const ocD = shade(oc, -0.18);
  const ac = a.accentColor;
  const acD = shade(ac, -0.18);
  const hc = a.hairColor;
  const hjc = a.hijabColor;
  const hjD = shade(hjc, -0.14);

  // الوجه
  const fy = hijab ? 90 : 86;
  const frx = hijab ? 31 : 36;
  const fry = hijab ? 34 : 39;

  const viewBox = view === 'full' ? '0 0 200 300' : '36 24 128 128';

  /* ------------------------------ Arms & hands ------------------------------ */
  const arm = (color: string, width = 15, short = false) => (
    <g strokeLinecap="round" fill="none">
      <path d="M76 140 Q66 162 63 190" stroke={short ? color : color} strokeWidth={width} />
      <path d="M124 140 Q134 162 137 190" stroke={color} strokeWidth={width} />
      {short && (
        <>
          <path d="M68 158 Q64 176 63 190" stroke={skin} strokeWidth={11} />
          <path d="M132 158 Q136 176 137 190" stroke={skin} strokeWidth={11} />
        </>
      )}
    </g>
  );
  const hands = (
    <g fill={skin}>
      <circle cx="62" cy="195" r="7.5" />
      <circle cx="138" cy="195" r="7.5" />
    </g>
  );

  /* ------------------------------ Legs & shoes ------------------------------ */
  const shoeColor = a.outfit === 'suit' || a.outfit === 'thobe' ? '#4A2E1F' : female ? '#6B4226' : '#F4F4F4';
  const shoes = (
    <g>
      <path d="M78 266 Q78 258 90 258 Q99 258 99 266 L99 272 L76 272 Q74 268 78 266 Z" fill={shoeColor} />
      <path d="M101 266 Q101 258 110 258 Q122 258 122 266 Q126 268 124 272 L101 272 Z" fill={shoeColor} />
      {shoeColor === '#F4F4F4' && (
        <g fill="#D9D9D9">
          <rect x="76" y="270" width="23" height="3" rx="1.5" />
          <rect x="101" y="270" width="23" height="3" rx="1.5" />
        </g>
      )}
    </g>
  );
  const trousers = (color: string, wide = false) => (
    <g fill={color}>
      <path d={wide ? 'M74 196 L100 196 L99 262 L72 262 Z' : 'M79 194 L99 194 L98 262 L81 262 Z'} />
      <path d={wide ? 'M100 196 L126 196 L128 262 L101 262 Z' : 'M101 194 L121 194 L119 262 L102 262 Z'} />
      <path d="M100 200 L100 262" stroke={shade(color, -0.2)} strokeWidth="1.5" />
    </g>
  );

  /* ------------------------------ Outfits ------------------------------ */
  const torso = 'M74 134 Q100 126 126 134 L130 198 Q100 203 70 198 Z';

  const outfit = (): React.ReactNode => {
    switch (a.outfit) {
      // ---------- male ----------
      case 'tee':
        return (
          <g>
            {trousers(ac)}
            {arm(oc, 16, true)}
            <path d={torso} fill={oc} />
            <path d="M90 130 Q100 138 110 130" stroke={ocD} strokeWidth="3" fill="none" />
          </g>
        );
      case 'hoodie':
        return (
          <g>
            {trousers(ac)}
            {arm(oc)}
            <path d={torso} fill={oc} />
            <path d="M80 132 Q100 150 120 132 Q112 126 100 126 Q88 126 80 132 Z" fill={ocD} />
            <rect x="84" y="170" width="32" height="16" rx="6" fill={ocD} />
            <path d="M95 140 L94 156 M105 140 L106 156" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        );
      case 'jacket':
        return (
          <g>
            {trousers(ac)}
            {arm(oc)}
            <path d={torso} fill="#F4F4F4" />
            <path d="M74 134 Q86 128 94 130 L92 199 Q80 200 70 198 Z" fill={oc} />
            <path d="M126 134 Q114 128 106 130 L108 199 Q120 200 130 198 Z" fill={oc} />
            <path d="M70 192 L130 192" stroke={ocD} strokeWidth="5" />
            <rect x="113" y="150" width="9" height="4" rx="1" fill={ocD} />
          </g>
        );
      case 'thobe':
        return (
          <g>
            {arm(oc)}
            <path d="M74 134 Q100 126 126 134 L134 262 Q100 266 66 262 Z" fill={oc} />
            <path d="M92 130 L100 140 L108 130" stroke={ocD} strokeWidth="2.5" fill="none" />
            <path d="M100 140 L100 176" stroke={ocD} strokeWidth="1.6" />
            <g fill={ocD}>
              <circle cx="100" cy="150" r="1.6" />
              <circle cx="100" cy="162" r="1.6" />
            </g>
            <path d="M118 150 L124 150" stroke={ocD} strokeWidth="2" />
          </g>
        );
      case 'suit':
        return (
          <g>
            {trousers(ocD)}
            {arm(oc)}
            <path d={torso} fill={oc} />
            <path d="M90 130 L100 158 L110 130 Q100 128 90 130 Z" fill="#FFFFFF" />
            <path d="M98 136 L102 136 L104 156 L100 162 L96 156 Z" fill={ac} />
            <path d="M90 130 L100 158 L84 150 Z M110 130 L100 158 L116 150 Z" fill={ocD} />
            <circle cx="100" cy="176" r="1.8" fill={ocD} />
          </g>
        );
      case 'shirt':
        return (
          <g>
            {trousers(ac)}
            {arm(oc)}
            <path d={torso} fill={oc} />
            <path d="M90 129 L100 140 L94 144 Z M110 129 L100 140 L106 144 Z" fill="#FFFFFF" />
            <path d="M100 140 L100 198" stroke={ocD} strokeWidth="1.4" />
            <g fill="#FFFFFF">
              <circle cx="100" cy="152" r="1.4" />
              <circle cx="100" cy="166" r="1.4" />
              <circle cx="100" cy="180" r="1.4" />
            </g>
          </g>
        );

      // ---------- female ----------
      case 'tunic':
        return (
          <g>
            {trousers(ac, true)}
            {arm(oc)}
            <path d="M74 134 Q100 126 126 134 L134 226 Q100 232 66 226 Z" fill={oc} />
            <path d="M100 140 L100 170" stroke={ocD} strokeWidth="1.6" />
            <path d="M68 220 Q100 226 132 220" stroke={ocD} strokeWidth="2" fill="none" />
          </g>
        );
      case 'cardigan':
        return (
          <g>
            <path d="M72 194 L128 194 L140 264 Q100 270 60 264 Z" fill={ac} />
            {arm(oc)}
            <path d={torso} fill="#FFFFFF" />
            <path d="M74 134 Q86 128 93 130 L92 208 Q80 208 68 205 Z" fill={oc} />
            <path d="M126 134 Q114 128 107 130 L108 208 Q120 208 132 205 Z" fill={oc} />
            <g fill={ocD}>
              <circle cx="95" cy="160" r="1.5" />
              <circle cx="95" cy="176" r="1.5" />
            </g>
          </g>
        );
      case 'abaya':
        return (
          <g>
            <g strokeLinecap="round" fill="none">
              <path d="M76 140 Q64 164 60 188" stroke={oc} strokeWidth="20" />
              <path d="M124 140 Q136 164 140 188" stroke={oc} strokeWidth="20" />
            </g>
            <path d="M74 134 Q100 126 126 134 L144 264 Q100 272 56 264 Z" fill={oc} />
            <path d="M100 136 L100 264" stroke={ocD} strokeWidth="1.6" />
            <path d="M58 182 Q60 190 66 192 M142 182 Q140 190 134 192" stroke={ac} strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        );
      case 'dress':
        return (
          <g>
            {arm(oc)}
            <path d="M76 134 Q100 126 124 134 L126 186 L142 264 Q100 272 58 264 L74 186 Z" fill={oc} />
            <rect x="73" y="182" width="54" height="7" rx="3" fill={ac} />
            <path d="M88 200 L80 262 M112 200 L120 262" stroke={ocD} strokeWidth="1.4" opacity="0.6" />
          </g>
        );
      case 'gown':
        return (
          <g>
            {arm(oc)}
            <path d="M76 134 Q100 126 124 134 L124 184 Q150 230 152 266 Q100 276 48 266 Q50 230 76 184 Z" fill={oc} />
            <path d="M74 182 Q100 190 126 182 L126 190 Q100 198 74 190 Z" fill={ac} />
            <g fill={ac} opacity="0.85">
              <circle cx="84" cy="220" r="1.6" />
              <circle cx="112" cy="232" r="1.6" />
              <circle cx="96" cy="248" r="1.6" />
              <circle cx="126" cy="252" r="1.6" />
              <circle cx="70" cy="252" r="1.6" />
              <circle cx="104" cy="212" r="1.4" />
            </g>
            <path d="M92 132 Q100 142 108 132" stroke={ac} strokeWidth="2" fill="none" />
          </g>
        );
      case 'kaftan':
        return (
          <g>
            <g strokeLinecap="round" fill="none">
              <path d="M76 140 Q64 164 60 188" stroke={oc} strokeWidth="19" />
              <path d="M124 140 Q136 164 140 188" stroke={oc} strokeWidth="19" />
            </g>
            <path d="M74 134 Q100 126 126 134 L140 264 Q100 272 60 264 Z" fill={oc} />
            <path d="M94 132 L94 264 L106 264 L106 132 Q100 130 94 132 Z" fill={ac} />
            <g fill={oc}>
              {[146, 166, 186, 206, 226, 246].map((y) => (
                <path key={y} d={`M100 ${y - 5} L104 ${y} L100 ${y + 5} L96 ${y} Z`} />
              ))}
            </g>
            <path d="M54 184 Q60 194 68 192 M146 184 Q140 194 132 192" stroke={ac} strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>
        );
      case 'blouse':
      default:
        return (
          <g>
            <path d="M72 194 L128 194 L142 264 Q100 270 58 264 Z" fill={ac} />
            <path d="M84 200 L76 262 M116 200 L124 262" stroke={acD} strokeWidth="1.4" opacity="0.6" />
            {arm(oc)}
            <path d="M74 134 Q100 126 126 134 L129 200 Q100 205 71 200 Z" fill={oc} />
            <path d="M92 131 Q100 138 108 131" stroke={ocD} strokeWidth="2.4" fill="none" />
          </g>
        );
    }
  };

  /* ------------------------------ Hair ------------------------------ */
  const hairBack = () => {
    if (hijab || !female) return null;
    switch (a.hairStyle) {
      case 'long':
        return <path d="M58 92 Q54 40 100 40 Q146 40 142 92 L148 168 Q100 182 52 168 Z" fill={shade(hc, -0.08)} />;
      case 'ponytail':
        return <path d="M130 58 Q164 74 154 146 Q146 116 126 82 Z" fill={shade(hc, -0.08)} />;
      case 'bun':
        return <circle cx="100" cy="40" r="15" fill={shade(hc, -0.05)} />;
      case 'bob':
        return <path d="M58 92 Q54 40 100 40 Q146 40 142 92 L144 120 Q100 128 56 120 Z" fill={shade(hc, -0.08)} />;
      default:
        return null;
    }
  };

  const hairFront = () => {
    if (hijab) return null;
    if (female) {
      return <path d="M63 92 Q60 44 100 44 Q140 44 137 92 Q132 66 114 60 Q98 74 72 66 Q66 76 63 92 Z" fill={hc} />;
    }
    switch (a.hairStyle) {
      case 'side':
        return (
          <g>
            <path d="M63 88 Q58 42 102 40 Q142 44 137 86 Q132 62 118 58 Q96 62 76 52 Q66 66 63 88 Z" fill={hc} />
            <path d="M76 52 Q90 50 104 54" stroke={shade(hc, 0.2)} strokeWidth="1.6" fill="none" />
          </g>
        );
      case 'curly':
        return (
          <g fill={hc}>
            <path d="M64 86 Q60 50 100 46 Q140 50 136 86 Q130 66 100 64 Q70 66 64 86 Z" />
            {[[68, 64], [76, 54], [87, 48], [100, 46], [113, 48], [124, 54], [132, 64]].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="9" />
            ))}
          </g>
        );
      case 'quiff':
        return (
          <g fill={hc}>
            <path d="M63 86 Q60 46 100 44 Q140 46 137 86 Q134 66 122 60 Q104 68 80 62 Q68 68 63 86 Z" />
            <path d="M80 54 Q96 22 126 46 Q110 44 96 58 Z" />
          </g>
        );
      case 'buzz':
        return <path d="M65 80 Q64 48 100 47 Q136 48 135 80 Q128 62 100 60 Q72 62 65 80 Z" fill={hc} opacity="0.85" />;
      case 'short':
      default:
        return <path d="M63 86 Q60 44 100 42 Q140 44 137 86 Q134 66 122 60 Q104 70 80 62 Q68 68 63 86 Z" fill={hc} />;
    }
  };

  /* ------------------------------ Hijab ------------------------------ */
  const hijabBody = () => {
    if (!hijab) return null;
    if (a.hijab === 'sport') {
      return (
        <g>
          <path d="M60 92 Q58 42 100 42 Q142 42 140 92 Q140 124 124 136 Q100 144 76 136 Q60 124 60 92 Z" fill={hjc} />
          <ellipse cx="100" cy={fy} rx={frx + 3} ry={fry + 3} fill={hjD} />
        </g>
      );
    }
    return (
      <g>
        <path
          d="M58 92 Q56 38 100 38 Q144 38 142 92 Q144 118 132 130 Q152 138 156 162 Q100 180 44 162 Q48 138 68 130 Q56 118 58 92 Z"
          fill={hjc}
        />
        <path d="M70 136 Q100 150 130 136" stroke={hjD} strokeWidth="1.6" fill="none" opacity="0.7" />
        <path d="M60 150 Q100 166 140 150" stroke={hjD} strokeWidth="1.4" fill="none" opacity="0.5" />
        {a.hijab === 'wrap' && (
          <>
            <path d="M126 118 Q156 150 142 210 Q132 176 116 140 Z" fill={hjD} />
            <path d="M66 66 Q100 50 134 66" stroke={hjD} strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        )}
        <ellipse cx="100" cy={fy} rx={frx + 3.5} ry={fry + 3.5} fill={hjD} />
      </g>
    );
  };

  /* ------------------------------ Face ------------------------------ */
  const ex = 13;
  const ey = fy + 3;
  const eye = (cx: number) => {
    if (a.eyes === 'happy') {
      return <path d={`M${cx - 6} ${ey + 1} Q${cx} ${ey - 6} ${cx + 6} ${ey + 1}`} stroke={DARK} strokeWidth="2.6" fill="none" strokeLinecap="round" />;
    }
    const almond = a.eyes === 'almond';
    return (
      <g>
        {almond ? (
          <path d={`M${cx - 7.5} ${ey} Q${cx} ${ey - 7} ${cx + 7.5} ${ey} Q${cx} ${ey + 6} ${cx - 7.5} ${ey} Z`} fill="#FFFFFF" />
        ) : (
          <ellipse cx={cx} cy={ey} rx="6.4" ry="7.4" fill="#FFFFFF" />
        )}
        <circle cx={cx} cy={ey + 0.5} r={almond ? 3.8 : 4.6} fill={a.eyeColor} />
        <circle cx={cx} cy={ey + 0.5} r={almond ? 1.8 : 2.2} fill={DARK} />
        <circle cx={cx + 1.6} cy={ey - 1.6} r="1.4" fill="#FFFFFF" />
        {female && <path d={`M${cx + (cx < 100 ? -6 : 6)} ${ey - 4} l${cx < 100 ? -3 : 3} -2`} stroke={DARK} strokeWidth="1.6" strokeLinecap="round" />}
      </g>
    );
  };

  const my = fy + 21;
  const mouth = () => {
    if (a.mouth === 'grin') {
      return (
        <g>
          <path d={`M91 ${my - 1.5} Q100 ${my - 0.5} 109 ${my - 1.5} Q108 ${my + 9} 100 ${my + 9} Q92 ${my + 9} 91 ${my - 1.5} Z`} fill="#7A2E2E" />
          <path d={`M92.5 ${my - 1} Q100 ${my} 107.5 ${my - 1} L106.8 ${my + 2.4} Q100 ${my + 3.2} 93.2 ${my + 2.4} Z`} fill="#FFFFFF" />
          <path d={`M95 ${my + 7} Q100 ${my + 4} 105 ${my + 7} Q100 ${my + 9} 95 ${my + 7} Z`} fill="#E07A7A" />
        </g>
      );
    }
    if (a.mouth === 'soft') {
      return <path d={`M96 ${my + 1} Q100 ${my + 3.5} 104 ${my + 1}`} stroke="#8A3B3B" strokeWidth="2.2" fill="none" strokeLinecap="round" />;
    }
    return <path d={`M93 ${my} Q100 ${my + 6} 107 ${my}`} stroke="#8A3B3B" strokeWidth="2.4" fill="none" strokeLinecap="round" />;
  };

  const browColor = hijab ? '#3B2A20' : shade(hc, -0.15);

  const face = (
    <g>
      {!hijab && (
        <g fill={skin}>
          <ellipse cx={100 - frx - 1} cy={fy + 4} rx="6" ry="8" />
          <ellipse cx={100 + frx + 1} cy={fy + 4} rx="6" ry="8" />
        </g>
      )}
      <ellipse cx="100" cy={fy} rx={frx} ry={fry} fill={skin} />
      <ellipse cx="100" cy={fy + fry - 6} rx={frx - 10} ry="5" fill={skinShade} opacity="0.25" />
      <path d={`M${100 - ex - 6} ${ey - 11} Q${100 - ex} ${ey - 15} ${100 - ex + 6} ${ey - 11}`} stroke={browColor} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d={`M${100 + ex - 6} ${ey - 11} Q${100 + ex} ${ey - 15} ${100 + ex + 6} ${ey - 11}`} stroke={browColor} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      {eye(100 - ex)}
      {eye(100 + ex)}
      <ellipse cx="100" cy={fy + 12} rx="2.2" ry="1.6" fill={shade(skin, -0.2)} />
      <g fill="#F29C9C" opacity="0.45">
        <circle cx={100 - 20} cy={fy + 14} r="5" />
        <circle cx={100 + 20} cy={fy + 14} r="5" />
      </g>
      {mouth()}
    </g>
  );

  const glasses = () => {
    if (a.glasses === 'none') return null;
    const common = { stroke: '#2B2B2B', strokeWidth: 2, fill: 'rgba(255,255,255,0.12)' };
    return (
      <g>
        {a.glasses === 'round' ? (
          <>
            <circle cx={100 - ex} cy={ey} r="8.6" {...common} />
            <circle cx={100 + ex} cy={ey} r="8.6" {...common} />
          </>
        ) : (
          <>
            <rect x={100 - ex - 9} y={ey - 7} width="18" height="14" rx="3.5" {...common} />
            <rect x={100 + ex - 9} y={ey - 7} width="18" height="14" rx="3.5" {...common} />
          </>
        )}
        <path d={`M${100 - 4.4} ${ey - 1} Q100 ${ey - 3} ${100 + 4.4} ${ey - 1}`} stroke="#2B2B2B" strokeWidth="2" fill="none" />
      </g>
    );
  };

  const cap = () =>
    !female && a.cap ? (
      <g>
        <path d="M62 74 Q62 38 100 38 Q138 38 138 74 Z" fill={ocD} />
        <path d="M100 74 L150 74 Q152 80 140 80 L100 80 Z" fill={shade(oc, -0.3)} />
        <circle cx="100" cy="40" r="3" fill={oc} />
      </g>
    ) : null;

  return (
    <svg
      viewBox={viewBox}
      width={size}
      height={view === 'full' && typeof size === 'number' ? size * 1.5 : size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="avatar"
      style={{ display: 'block', borderRadius: rounded && showBackground ? (view === 'head' ? '9999px' : '24px') : undefined }}
    >
      {showBackground && (
        <g>
          <rect x="0" y="0" width="200" height="300" fill={a.bg} />
          <circle cx="100" cy={view === 'full' ? 120 : 88} r={view === 'full' ? 84 : 60} fill="#FFFFFF" opacity={a.bg === '#0E3A99' ? 0.08 : 0.35} />
        </g>
      )}
      {view === 'full' && <ellipse cx="100" cy="274" rx="48" ry="6" fill="#000000" opacity="0.1" />}
      {hairBack()}
      {view === 'full' && shoes}
      {outfit()}
      {view === 'full' && hands}
      {view === 'head' && !hijab && <rect x="92" y="118" width="16" height="14" fill={skinShade} />}
      {!hijab && <rect x="93" y="118" width="14" height="14" rx="3" fill={skinShade} />}
      {hijabBody()}
      {face}
      {hairFront()}
      {glasses()}
      {cap()}
    </svg>
  );
};
