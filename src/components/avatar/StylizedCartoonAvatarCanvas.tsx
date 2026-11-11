import React from 'react';
import { DetailedAvatarConfig } from '../../types/avatar3d';

interface StylizedCartoonAvatarCanvasProps {
  config: DetailedAvatarConfig;
  cameraView?: 'face' | 'upper' | 'full';
  angleView?: 'front' | 'three-quarter' | 'side';
  className?: string;
  showBackground?: boolean;
}

export const StylizedCartoonAvatarCanvas: React.FC<StylizedCartoonAvatarCanvasProps> = ({
  config,
  cameraView = 'upper',
  angleView = 'front',
  className = '',
  showBackground = true
}) => {
  const {
    gender = 'female',
    characterType = 'teen',
    skinTone = '#E5AC7D',
    eyeColor = '#3A2016',
    hairStyle = 'swooped-pompadour',
    hairColor = '#3A2016',
    hasHijab = true,
    hijabStyle = 'cartoon-soft-wrap',
    hijabColor = '#D8B89E',
    hijabTrimColor = '#FAF8F5',
    clothingType = 'pastel-pleated-skirt',
    clothingColor = '#E8BDC4',
    secondaryClothingColor = '#FAF8F5',
    bottomColor = '#353A40',
    shoesType = 'leather-boots',
    shoesColor = '#7A4325',
    lipColor = '#D4777E',
    accessories = [],
    backgroundId = 'modern-library'
  } = config;

  // ViewBox dynamic framing based on cameraView zoom preset
  // Face close-up: 100 65 200 230
  // Upper body: 60 70 280 370
  // Full body: 30 10 340 680
  const getViewBox = () => {
    switch (cameraView) {
      case 'face':
        return '95 65 210 230';
      case 'full':
        return '30 20 340 660';
      case 'upper':
      default:
        return '60 70 280 370';
    }
  };

  // Horizontal perspective transform for angles
  const getAngleTransform = () => {
    switch (angleView) {
      case 'three-quarter':
        return 'translate(6, 0) scale(0.98, 1) skewY(-1.2)';
      case 'side':
        return 'translate(14, 0) scale(0.93, 1) skewY(-2.5)';
      case 'front':
      default:
        return '';
    }
  };

  // Soft cartoon ambient shading
  const getSkinShadow = () => '#C98A5B';
  const isChild = characterType === 'child';

  return (
    <div className={`relative w-full h-full flex items-center justify-center select-none overflow-hidden ${className}`}>
      <svg
        viewBox={getViewBox()}
        className="w-full h-full transition-all duration-500 ease-out drop-shadow-2xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Reference 1 & 2 Style Soft Warm Pastel Studio Backgrounds */}
          <linearGradient id="cartoonBgWarm" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F5E8DD" />
            <stop offset="60%" stopColor="#EAD8CA" />
            <stop offset="100%" stopColor="#DFC8B8" />
          </linearGradient>

          <linearGradient id="cartoonBgCool" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E2EBF5" />
            <stop offset="70%" stopColor="#D0DEEB" />
            <stop offset="100%" stopColor="#BCCFDE" />
          </linearGradient>

          <linearGradient id="cartoonBgPink" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F9E6EB" />
            <stop offset="70%" stopColor="#F0D1DA" />
            <stop offset="100%" stopColor="#E6BCC8" />
          </linearGradient>

          <linearGradient id="cartoonBgAcademy" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1B2D4B" />
            <stop offset="60%" stopColor="#0F1E36" />
            <stop offset="100%" stopColor="#08101E" />
          </linearGradient>

          {/* 3D Vinyl / Soft Matte Skin Gradients */}
          <radialGradient id="cartoonFaceLight" cx="45%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
            <stop offset="65%" stopColor={skinTone} />
            <stop offset="100%" stopColor={getSkinShadow()} />
          </radialGradient>

          {/* 3D Cartoon Hijab Fabric Soft Light & Gradient (Reference 1) */}
          <linearGradient id="cartoonHijabGrad" x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
            <stop offset="45%" stopColor={hijabColor} />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.32" />
          </linearGradient>

          {/* 3D Glossy Cartoon Eye Depth */}
          <radialGradient id="cartoonIrisGrad" cx="42%" cy="38%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
            <stop offset="25%" stopColor={eyeColor} />
            <stop offset="80%" stopColor={eyeColor} />
            <stop offset="100%" stopColor="#0A0A0A" />
          </radialGradient>

          {/* Floor Contact Soft Ambient Shadow */}
          <radialGradient id="cartoonGroundShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#000000" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* --- 1. BACKGROUND & STUDIO LIGHTING --- */}
        {showBackground && (
          <g id="studio-backdrop">
            <rect
              x="-60"
              y="-60"
              width="520"
              height="800"
              fill={
                backgroundId === 'golden-stars'
                  ? 'url(#cartoonBgPink)'
                  : backgroundId === 'nature-garden'
                  ? 'url(#cartoonBgCool)'
                  : backgroundId === 'academic-hall'
                  ? 'url(#cartoonBgAcademy)'
                  : 'url(#cartoonBgWarm)'
              }
            />
            {/* Subtle soft studio rim halo */}
            <circle cx="200" cy="230" r="185" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.3" />
            <circle cx="200" cy="230" r="210" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="6 6" opacity="0.2" />

            {/* Floor Contact Shadow */}
            <ellipse cx="200" cy="640" rx="115" ry="18" fill="url(#cartoonGroundShadow)" />
          </g>
        )}

        {/* --- 2. MASTER CHARACTER COMPOSITE HIERARCHY --- */}
        <g id="cartoon-character-root" transform={getAngleTransform()}>

          {/* --- LEGS & SHOES (Full Body) --- */}
          {clothingType !== 'royal-abaya' && clothingType !== 'academic-robe' && (
            <g id="cartoon-legs">
              {gender === 'female' ? (
                /* Female Stylized Legs (Stockings/Bare Cartoon Legs) */
                <g id="female-cartoon-legs">
                  {/* Left Leg */}
                  <path d="M180 430 L178 575 L168 575 L172 430 Z" fill={isChild ? '#FBECEF' : skinTone} />
                  {/* Right Leg */}
                  <path d="M220 430 L222 575 L232 575 L228 430 Z" fill={isChild ? '#FBECEF' : skinTone} />

                  {/* Laced Boots (Reference 1 style) or Mary Janes (Reference 3) */}
                  {shoesType === 'mary-jane-flats' ? (
                    <g id="mary-jane-shoes">
                      <ellipse cx="170" cy="582" rx="14" ry="9" fill="#E86E8C" />
                      <ellipse cx="230" cy="582" rx="14" ry="9" fill="#E86E8C" />
                      <circle cx="170" cy="578" r="3.5" fill="#FAF8F5" />
                      <circle cx="230" cy="578" r="3.5" fill="#FAF8F5" />
                    </g>
                  ) : (
                    /* Brown Leather Laced Boots (Exact Reference 1) */
                    <g id="ref1-leather-boots">
                      {/* Left Boot */}
                      <path
                        d="M162 560 C162 550 184 550 184 560 L188 595 C188 602 154 602 156 592 Z"
                        fill={shoesColor}
                      />
                      <path d="M154 598 L188 598" stroke="#4A2511" strokeWidth="4" strokeLinecap="round" />
                      {/* Laces */}
                      <line x1="168" y1="565" x2="178" y2="565" stroke="#FAF8F5" strokeWidth="1.5" />
                      <line x1="169" y1="572" x2="177" y2="572" stroke="#FAF8F5" strokeWidth="1.5" />

                      {/* Right Boot */}
                      <path
                        d="M238 560 C238 550 216 550 216 560 L212 595 C212 602 246 602 244 592 Z"
                        fill={shoesColor}
                      />
                      <path d="M212 598 L246 598" stroke="#4A2511" strokeWidth="4" strokeLinecap="round" />
                      <line x1="222" y1="565" x2="232" y2="565" stroke="#FAF8F5" strokeWidth="1.5" />
                      <line x1="223" y1="572" x2="231" y2="572" stroke="#FAF8F5" strokeWidth="1.5" />
                    </g>
                  )}
                </g>
              ) : (
                /* Male Stylized Jogger Pants & Sneakers (Exact Reference 2) */
                <g id="male-cartoon-legs">
                  {/* Left Pant Leg with White Side Stripe */}
                  <path d="M172 380 L165 565 L148 565 L152 380 Z" fill={bottomColor} />
                  <path d="M152 390 L149 560" stroke="#FAF8F5" strokeWidth="2.5" />
                  {/* Rolled cuff */}
                  <rect x="146" y="560" width="22" height="6" rx="3" fill="#24282D" />

                  {/* Right Pant Leg with White Side Stripe */}
                  <path d="M228 380 L235 565 L252 565 L248 380 Z" fill={bottomColor} />
                  <path d="M248 390 L251 560" stroke="#FAF8F5" strokeWidth="2.5" />
                  <rect x="232" y="560" width="22" height="6" rx="3" fill="#24282D" />

                  {/* High-Top Street Sneakers (Exact Reference 2) */}
                  <g id="ref2-sneakers">
                    {/* Left Sneaker */}
                    <path
                      d="M142 566 C142 556 168 556 168 566 L174 596 C174 602 136 602 138 592 Z"
                      fill="#1E232A"
                    />
                    <path d="M136 597 L174 597" stroke="#FAF8F5" strokeWidth="5" strokeLinecap="round" />
                    {/* Toe cap & laces */}
                    <ellipse cx="146" cy="593" rx="7" ry="4" fill="#FAF8F5" />
                    <line x1="154" y1="572" x2="164" y2="572" stroke="#FAF8F5" strokeWidth="1.5" />

                    {/* Right Sneaker (Slight 3/4 turn like Reference 2) */}
                    <path
                      d="M232 566 C232 556 258 556 258 566 L262 596 C262 602 226 602 228 592 Z"
                      fill="#1E232A"
                    />
                    <path d="M226 597 L262 597" stroke="#FAF8F5" strokeWidth="5" strokeLinecap="round" />
                    <ellipse cx="236" cy="593" rx="7" ry="4" fill="#FAF8F5" />
                    <line x1="244" y1="572" x2="254" y2="572" stroke="#FAF8F5" strokeWidth="1.5" />
                  </g>
                </g>
              )}
            </g>
          )}

          {/* --- TORSO & CLOTHING WARDROBE --- */}
          <g id="cartoon-wardrobe-torso">
            {clothingType === 'pastel-pleated-skirt' ? (
              /* REFERENCE 1: ELEGANT WHITE TOP & DUSTY PINK PLEATED A-LINE SKIRT */
              <g id="ref1-outfit">
                {/* White Long-Sleeve Bell Top */}
                <path
                  d="M142 220 C130 235 125 255 128 275 L272 275 C275 255 270 235 258 220 Z"
                  fill="#FFFFFF"
                />
                {/* Bell Sleeves Left */}
                <path d="M142 220 C118 240 108 275 116 308 C126 312 138 308 144 290 L152 245 Z" fill="#FFFFFF" />
                {/* Bell Sleeves Right */}
                <path d="M258 220 C282 240 292 275 284 308 C274 312 262 308 256 290 L248 245 Z" fill="#FFFFFF" />

                {/* High-Waist Pleated Midi Skirt (Dusty Pink / Customizable) */}
                <path
                  d="M136 270 C130 330 115 420 110 460 L290 460 C285 420 270 330 264 270 Z"
                  fill={clothingColor}
                />
                {/* 3D Vertical Pleat Creases & Shadow Folds */}
                <path d="M145 275 C142 340 135 415 130 458" stroke="#000000" strokeWidth="2" opacity="0.16" />
                <path d="M170 273 C168 340 165 415 162 458" stroke="#000000" strokeWidth="2" opacity="0.16" />
                <path d="M200 272 C200 340 200 415 200 458" stroke="#FFFFFF" strokeWidth="2" opacity="0.28" />
                <path d="M230 273 C232 340 235 415 238 458" stroke="#000000" strokeWidth="2" opacity="0.16" />
                <path d="M255 275 C258 340 265 415 270 458" stroke="#000000" strokeWidth="2" opacity="0.16" />
              </g>
            ) : clothingType === 'olive-bomber-jacket' ? (
              /* REFERENCE 2: TRENDY PUFFY BOMBER JACKET & HOODIE */
              <g id="ref2-outfit">
                {/* Dark Inner Hoodie */}
                <path d="M152 220 L146 360 L254 360 L248 220 Z" fill="#1E232A" />
                {/* Orange Circular Graphic on Chest (Reference 2) */}
                <circle cx="200" cy="275" r="14" fill="#E86526" />
                <circle cx="200" cy="275" r="8" fill="#1E232A" />

                {/* Puffy Olive Green Bomber Jacket Outer */}
                <path
                  d="M136 220 C120 250 118 310 125 355 L165 355 L158 235 Z"
                  fill={clothingColor || '#5E6B4B'}
                />
                <path
                  d="M264 220 C280 250 282 310 275 355 L235 355 L242 235 Z"
                  fill={clothingColor || '#5E6B4B'}
                />

                {/* Bomber Ribbed Collar & Hem */}
                <rect x="125" y="348" width="150" height="12" rx="4" fill="#2A3036" />

                {/* Puffy Left Sleeve (Hand on hip pose like Reference 2!) */}
                <path
                  d="M136 220 C105 240 92 280 102 315 C114 322 130 310 134 290 L146 240 Z"
                  fill={clothingColor || '#5E6B4B'}
                />
                {/* Puffy Right Sleeve */}
                <path
                  d="M264 220 C295 240 308 280 298 315 C286 322 270 310 266 290 L254 240 Z"
                  fill={clothingColor || '#5E6B4B'}
                />
                {/* Sleeve Utility Pocket */}
                <rect x="290" y="260" width="8" height="14" rx="2" fill="#2A3036" />
              </g>
            ) : clothingType === 'tiered-party-dress' ? (
              /* REFERENCE 3: CUTE TIERED RUFFLE DRESS & GIANT SASH */
              <g id="ref3-outfit">
                <path d="M155 220 L145 280 L255 280 L245 220 Z" fill="#FFFFFF" />
                {/* Bow on chest */}
                <ellipse cx="200" cy="275" rx="8" ry="4.5" fill="#E86E8C" />
                {/* Tiered Ruffle Skirt */}
                <path d="M140 280 C125 330 110 370 100 410 L300 410 C290 370 275 330 260 280 Z" fill="#E86E8C" />
                <path d="M100 405 C145 420 255 420 300 405 L305 420 C255 435 145 435 95 420 Z" fill="#FAF8F5" />
              </g>
            ) : (
              /* ROYAL ABAYA / TAILORED SUIT */
              <g id="abaya-suit">
                <path
                  d="M136 220 C115 300 95 460 90 620 L310 620 C305 460 285 300 264 220 Z"
                  fill={clothingColor}
                />
                <path d="M194 225 L194 620 L206 620 L206 225 Z" fill="#D4AF37" />
              </g>
            )}

            {/* Cute Cartoon Hands */}
            <g id="cartoon-hands">
              {/* Left Hand */}
              <circle cx="120" cy="318" r="9" fill={skinTone} />
              {/* Right Hand */}
              <circle cx="280" cy="318" r="9" fill={skinTone} />
            </g>

            {/* English Zone Gold Star Badge */}
            {accessories.includes('star-brooch') && (
              <g id="academy-badge" transform="translate(160, 245)">
                <circle cx="0" cy="0" r="8" fill="#0A192F" stroke="#D4AF37" strokeWidth="1.5" />
                <path d="M0 -5 L1.5 -1.5 L5 -1.5 L2 0.8 L3.2 4.5 L0 2 L-3.2 4.5 L-2 0.8 L-5 -1.5 L-1.5 -1.5 Z" fill="#D4AF37" />
              </g>
            )}
          </g>

          {/* --- NECK --- */}
          <rect x="188" y="195" width="24" height="35" rx="10" fill={skinTone} />

          {/* --- 3. BEAUTIFUL STYLIZED CARTOON HEAD & FACE --- */}
          <g id="cartoon-head-group">
            {/* Soft Rounded 3D Cartoon Head (Exact Reference 1 & 2 proportion) */}
            <path
              d="M135 130 C130 75 160 55 200 55 C240 55 270 75 265 130 C262 178 238 212 200 214 C162 212 138 178 135 130 Z"
              fill="url(#cartoonFaceLight)"
            />

            {/* Chubby Rosy Cartoon Cheeks */}
            <ellipse cx="155" cy="155" rx="15" ry="9" fill="#FF8A96" opacity="0.32" />
            <ellipse cx="245" cy="155" rx="15" ry="9" fill="#FF8A96" opacity="0.32" />

            {/* Cute Stylized Ears (with optional stud earring like Reference 2) */}
            {(!hasHijab || hijabStyle === 'chic-turban') && (
              <g id="cartoon-ears">
                <ellipse cx="132" cy="140" rx="9" ry="12" fill={skinTone} />
                <ellipse cx="268" cy="140" rx="9" ry="12" fill={skinTone} />
                {/* Stud Earring on Left Ear (Reference 2 style) */}
                <circle cx="130" cy="148" r="2.5" fill="#1A1A1A" />
              </g>
            )}

            {/* --- CARTOON FACIAL FEATURES --- */}

            {/* Stylized Eyebrows */}
            <g id="cartoon-eyebrows">
              <path
                d="M152 110 C162 102 176 104 185 111 C176 107 162 106 152 110 Z"
                fill={hairColor}
              />
              <path
                d="M248 110 C238 102 224 104 215 111 C224 107 238 106 248 110 Z"
                fill={hairColor}
              />
            </g>

            {/* LARGE EXPRESSIVE CARTOON EYES (Exact Reference 1 & 2 & 3!) */}
            <g id="cartoon-eyes">
              {/* Left Eye */}
              <g id="left-cartoon-eye">
                {/* White Sclera with soft almond/round curve */}
                <ellipse cx="168" cy="130" rx="16" ry="18" fill="#FFFFFF" />
                {/* Deep Colored Iris */}
                <ellipse cx="170" cy="130" rx="12.5" ry="14" fill="url(#cartoonIrisGrad)" />
                {/* Large Black Pupil */}
                <ellipse cx="171" cy="130" rx="7.5" ry="8.5" fill="#0A0A0A" />
                {/* Prominent White Specular Highlight (The signature anime/Pixar look!) */}
                <circle cx="166" cy="123" r="4.2" fill="#FFFFFF" />
                <circle cx="174" cy="136" r="2.2" fill="#FFFFFF" opacity="0.85" />
                {/* Arched Upper Eyelid / Lashes */}
                <path
                  d="M150 128 C160 112 180 112 188 126"
                  stroke="#121212"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
              </g>

              {/* Right Eye */}
              <g id="right-cartoon-eye">
                <ellipse cx="232" cy="130" rx="16" ry="18" fill="#FFFFFF" />
                <ellipse cx="230" cy="130" rx="12.5" ry="14" fill="url(#cartoonIrisGrad)" />
                <ellipse cx="229" cy="130" rx="7.5" ry="8.5" fill="#0A0A0A" />
                <circle cx="226" cy="123" r="4.2" fill="#FFFFFF" />
                <circle cx="234" cy="136" r="2.2" fill="#FFFFFF" opacity="0.85" />
                <path
                  d="M250 128 C240 112 220 112 212 126"
                  stroke="#121212"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
              </g>
            </g>

            {/* Small Cute Button Nose (Exact Reference 1 & 2) */}
            <g id="cartoon-nose">
              <ellipse cx="200" cy="148" rx="3.5" ry="2.5" fill={getSkinShadow()} opacity="0.65" />
              <circle cx="200" cy="146" r="1.5" fill="#FFFFFF" opacity="0.45" />
            </g>

            {/* Friendly Warm Cartoon Smile */}
            <g id="cartoon-smile">
              <path
                d="M188 168 C194 176 206 176 212 168"
                stroke="#6B1D2F"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
              {/* Natural Lip Gloss */}
              <ellipse cx="200" cy="172" rx="7" ry="2.2" fill={lipColor} opacity="0.65" />
            </g>
          </g>

          {/* --- 4. CARTOON HAIRSTYLES (When Hijab is Off or Male) --- */}
          {!hasHijab && (
            <g id="cartoon-hairstyles">
              {gender === 'female' ? (
                hairStyle === 'curly-pigtails-bow' ? (
                  /* REFERENCE 3: FLUFFY WAVY HAIR WITH BIG BOW */
                  <g id="ref3-curly-hair">
                    <path
                      d="M135 125 C120 70 155 45 200 45 C245 45 280 70 265 125 C290 160 295 240 270 265 C255 210 255 160 250 120 C240 75 160 75 150 120 C145 160 145 210 130 265 C105 240 110 160 135 125 Z"
                      fill={hairColor}
                    />
                    {/* Front Bangs Fringe */}
                    <path
                      d="M155 75 C170 102 230 102 245 75 C230 88 170 88 155 75 Z"
                      fill={hairColor}
                    />
                    {/* Giant Satin Hair Bow on Top (Exact Reference 3!) */}
                    <g id="giant-bow" transform="translate(200, 50)">
                      <ellipse cx="-22" cy="-6" rx="20" ry="14" fill="#E86E8C" />
                      <ellipse cx="22" cy="-6" rx="20" ry="14" fill="#E86E8C" />
                      <circle cx="0" cy="0" r="7" fill="#F08CA5" />
                    </g>
                  </g>
                ) : (
                  /* Shoulder Waves */
                  <g id="female-shoulder-waves">
                    <path
                      d="M135 125 C125 70 155 45 200 45 C245 45 275 70 265 125 C280 180 275 250 260 270 C250 210 252 140 200 70 C148 140 150 210 140 270 C125 250 120 180 135 125 Z"
                      fill={hairColor}
                    />
                  </g>
                )
              ) : (
                /* REFERENCE 2: STYLISH 3D SWOOPED ANIME/CARTOON HAIR */
                <g id="ref2-swooped-hair">
                  {/* High Volume Hair Crest */}
                  <path
                    d="M132 120 C124 60 160 40 200 40 C240 40 276 60 268 120 C265 95 255 60 200 58 C145 60 135 95 132 120 Z"
                    fill={hairColor}
                  />
                  {/* Swooped Volumetric Tuft (Reference 2 style) */}
                  <path
                    d="M142 85 C145 42 188 32 215 48 C195 55 175 62 165 85 Z"
                    fill={hairColor}
                  />
                  <path
                    d="M185 52 C210 38 235 48 245 75 C230 65 210 60 185 52 Z"
                    fill="#FFFFFF"
                    opacity="0.22"
                  />
                </g>
              )}
            </g>
          )}

          {/* --- 5. STYLIZED CARTOON FABRIC HIJAB (EXACT REFERENCE 1 STYLE!) --- */}
          {hasHijab && gender === 'female' && (
            <g id="ref1-cartoon-hijab">
              {/* Forehead Inner Undercap */}
              <path
                d="M152 102 C170 90 230 90 248 102 C238 96 162 96 152 102 Z"
                fill={hijabTrimColor}
              />

              {/* Main Rounded Hijab Hood Envelope framing the cute cartoon face */}
              <path
                d="M128 135 C124 68 158 50 200 50 C242 50 276 68 272 135 C272 195 246 220 200 220 C154 220 128 195 128 135 Z"
                fill="url(#cartoonHijabGrad)"
              />

              {/* Inner Face Cutout */}
              <path
                d="M140 132 C136 96 160 76 200 76 C240 76 264 96 260 132 C258 175 238 210 200 212 C162 210 142 175 140 132 Z"
                fill="url(#cartoonFaceLight)"
              />

              {/* Re-render Cartoon Features cleanly over cutout */}
              <ellipse cx="155" cy="155" rx="15" ry="9" fill="#FF8A96" opacity="0.32" />
              <ellipse cx="245" cy="155" rx="15" ry="9" fill="#FF8A96" opacity="0.32" />
              {/* Eyebrows */}
              <path d="M154 110 C164 102 176 104 185 111 C176 107 164 106 154 110 Z" fill={hairColor} />
              <path d="M246 110 C236 102 224 104 215 111 C224 107 236 106 246 110 Z" fill={hairColor} />
              {/* Eyes */}
              <ellipse cx="168" cy="130" rx="15" ry="17" fill="#FFFFFF" />
              <ellipse cx="170" cy="130" rx="11.5" ry="13" fill="url(#cartoonIrisGrad)" />
              <ellipse cx="171" cy="130" rx="7" ry="8" fill="#0A0A0A" />
              <circle cx="166" cy="124" r="3.8" fill="#FFFFFF" />
              <path d="M152 128 C160 114 178 114 186 126" stroke="#121212" strokeWidth="3" strokeLinecap="round" />

              <ellipse cx="232" cy="130" rx="15" ry="17" fill="#FFFFFF" />
              <ellipse cx="230" cy="130" rx="11.5" ry="13" fill="url(#cartoonIrisGrad)" />
              <ellipse cx="229" cy="130" rx="7" ry="8" fill="#0A0A0A" />
              <circle cx="226" cy="124" r="3.8" fill="#FFFFFF" />
              <path d="M248 128 C240 114 222 114 214 126" stroke="#121212" strokeWidth="3" strokeLinecap="round" />

              {/* Nose & Smile */}
              <ellipse cx="200" cy="148" rx="3.5" ry="2.5" fill={getSkinShadow()} opacity="0.65" />
              <path d="M188 168 C194 176 206 176 212 168" stroke="#6B1D2F" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <ellipse cx="200" cy="172" rx="7" ry="2.2" fill={lipColor} opacity="0.65" />

              {/* Signature Front Rounded Bib Drapery over Chest (Exact Reference 1!) */}
              <path
                d="M130 215 C115 240 115 275 140 295 C170 310 230 310 260 295 C285 275 285 240 270 215 C240 230 160 230 130 215 Z"
                fill="url(#cartoonHijabGrad)"
              />
              {/* Soft Cartoon Cloth Fold Curves */}
              <path
                d="M142 225 C165 250 215 285 255 280"
                stroke="#FFFFFF"
                strokeWidth="2.2"
                opacity="0.32"
                strokeLinecap="round"
              />
              <path
                d="M142 226 C165 251 215 286 255 281"
                stroke="#000000"
                strokeWidth="1.6"
                opacity="0.22"
                strokeLinecap="round"
              />

              {/* Back Drape behind shoulders (Reference 1 style) */}
              <path
                d="M125 210 C110 260 115 330 130 360 L140 350 C128 320 126 260 135 215 Z"
                fill={hijabColor}
                opacity="0.85"
              />
            </g>
          )}

          {/* --- 6. CARTOON ACCESSORIES --- */}
          {accessories.includes('glasses') && (
            <g id="cartoon-glasses">
              <rect x="150" y="118" width="36" height="25" rx="8" fill="#FFFFFF" fillOpacity="0.2" stroke="#D4AF37" strokeWidth="2.4" />
              <rect x="214" y="118" width="36" height="25" rx="8" fill="#FFFFFF" fillOpacity="0.2" stroke="#D4AF37" strokeWidth="2.4" />
              <path d="M186 128 L214 128" stroke="#D4AF37" strokeWidth="2.4" strokeLinecap="round" />
            </g>
          )}

        </g>
      </svg>
    </div>
  );
};
