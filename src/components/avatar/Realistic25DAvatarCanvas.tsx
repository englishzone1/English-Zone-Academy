import React from 'react';
import { DetailedAvatarConfig } from '../../types/avatar3d';

interface Realistic25DAvatarCanvasProps {
  config: DetailedAvatarConfig;
  cameraView?: 'face' | 'upper' | 'full';
  angleView?: 'front' | 'three-quarter' | 'side';
  className?: string;
  showBackground?: boolean;
}

export const Realistic25DAvatarCanvas: React.FC<Realistic25DAvatarCanvasProps> = ({
  config,
  cameraView = 'upper',
  angleView = 'front',
  className = '',
  showBackground = true
}) => {
  const {
    gender = 'female',
    characterType = 'teen',
    skinTone = '#E0AC69',
    eyeColor = '#2C1B18',
    eyesStyle = 'almond',
    hairStyle = 'shoulder-length',
    hairColor = '#1A1A1A',
    hasHijab = true,
    hijabStyle = 'modern-wrap',
    hijabColor = '#0A192F',
    hijabTrimColor = '#D4AF37',
    clothingType = 'royal-abaya',
    clothingColor = '#164E43',
    secondaryClothingColor = '#D4AF37',
    bottomColor = '#0A192F',
    lipColor = '#C97A7E',
    accessories = [],
    backgroundId = 'modern-library'
  } = config;

  // ViewBox dynamic framing based on cameraView zoom preset
  // Full Body: 0 0 400 700
  // Upper Body: 50 70 300 420
  // Face Close-Up: 100 80 200 240
  const getViewBox = () => {
    switch (cameraView) {
      case 'face':
        return '85 70 230 250';
      case 'full':
        return '25 10 350 680';
      case 'upper':
      default:
        return '40 60 320 440';
    }
  };

  // Horizontal perspective transform based on angleView
  const getAngleTransform = () => {
    switch (angleView) {
      case 'three-quarter':
        return 'translate(8, 0) scale(0.97, 1) skewY(-1.2)';
      case 'side':
        return 'translate(18, 0) scale(0.92, 1) skewY(-2.5)';
      case 'front':
      default:
        return '';
    }
  };

  // Skin shading tones derived from base skin tone
  // Subtle ambient occlusion & blush
  const getSkinDark = () => {
    // Return a richer, warmer shadow tone
    return '#8D5B3A';
  };

  return (
    <div className={`relative w-full h-full flex items-center justify-center select-none overflow-hidden ${className}`}>
      <svg
        viewBox={getViewBox()}
        className="w-full h-full transition-all duration-500 ease-out drop-shadow-xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Studio Vignette Background Gradients */}
          <linearGradient id="bgStudioNavy" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E2D4A" />
            <stop offset="60%" stopColor="#0A192F" />
            <stop offset="100%" stopColor="#050D1A" />
          </linearGradient>

          <linearGradient id="bgGoldLuxury" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C5A059" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#0A192F" />
            <stop offset="100%" stopColor="#030811" />
          </linearGradient>

          <linearGradient id="bgCampusGarden" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1B4D3E" />
            <stop offset="60%" stopColor="#0E2921" />
            <stop offset="100%" stopColor="#06120F" />
          </linearGradient>

          {/* Skin lighting gradients */}
          <radialGradient id="faceLight" cx="48%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.18" />
            <stop offset="65%" stopColor={skinTone} />
            <stop offset="100%" stopColor={getSkinDark()} stopOpacity="0.7" />
          </radialGradient>

          {/* Hijab Silk Shading */}
          <linearGradient id="hijabSilkGrad" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
            <stop offset="40%" stopColor={hijabColor} />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.45" />
          </linearGradient>

          {/* Fabric Texture Pattern */}
          <pattern id="fabricWeave" width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M0 2h4M2 0v4" stroke="#FFFFFF" strokeWidth="0.4" opacity="0.08" />
          </pattern>

          {/* Eye Iris Depth Radial */}
          <radialGradient id="irisGrad" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="30%" stopColor={eyeColor} />
            <stop offset="85%" stopColor={eyeColor} />
            <stop offset="100%" stopColor="#050505" />
          </radialGradient>

          {/* Contact Ground Shadow */}
          <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#000000" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. BACKGROUND ATMOSPHERE & PEDESTAL */}
        {showBackground && (
          <g id="studio-background">
            <rect
              x="-50"
              y="-50"
              width="500"
              height="800"
              fill={
                backgroundId === 'nature-garden'
                  ? 'url(#bgCampusGarden)'
                  : backgroundId === 'golden-stars'
                  ? 'url(#bgGoldLuxury)'
                  : 'url(#bgStudioNavy)'
              }
            />
            {/* Subtle architectural halo */}
            <circle cx="200" cy="240" r="190" stroke="#D4AF37" strokeWidth="1" strokeDasharray="8 6" opacity="0.2" />
            <circle cx="200" cy="240" r="215" stroke="#D4AF37" strokeWidth="0.5" opacity="0.12" />

            {/* Pedestal floor shadow */}
            <ellipse cx="200" cy="655" rx="140" ry="24" fill="url(#groundShadow)" />
            <ellipse cx="200" cy="655" rx="110" ry="12" fill="#D4AF37" opacity="0.3" />
          </g>
        )}

        {/* 2. CHARACTER COMPOSITE HIERARCHY WITH PERSPECTIVE SKEW */}
        <g id="character-master" transform={getAngleTransform()}>

          {/* --- LEGS & SHOES (Full body mode) --- */}
          {clothingType !== 'royal-abaya' && clothingType !== 'academic-robe' && (
            <g id="lower-limbs">
              {/* Left Leg / Trouser */}
              <path
                d="M165 410 L158 580 L146 580 L140 410 Z"
                fill={bottomColor}
              />
              {/* Left Crease & Shadow */}
              <line x1="152" y1="420" x2="152" y2="575" stroke="#000000" strokeWidth="1.2" opacity="0.25" />

              {/* Right Leg / Trouser */}
              <path
                d="M235 410 L242 580 L254 580 L260 410 Z"
                fill={bottomColor}
              />
              <line x1="248" y1="420" x2="248" y2="575" stroke="#000000" strokeWidth="1.2" opacity="0.25" />

              {/* Shoes - Oxford / Modest Flats */}
              <path
                d="M136 578 C136 570 152 568 160 575 L168 595 C168 600 134 600 136 578 Z"
                fill="#151515"
              />
              <path d="M134 598 L168 598" stroke="#D4AF37" strokeWidth="1.5" opacity="0.6" />

              <path
                d="M264 578 C264 570 248 568 240 575 L232 595 C232 600 266 600 264 578 Z"
                fill="#151515"
              />
              <path d="M232 598 L266 598" stroke="#D4AF37" strokeWidth="1.5" opacity="0.6" />
            </g>
          )}

          {/* --- TORSO & MAIN CLOTHING --- */}
          <g id="clothing-body">
            {clothingType === 'royal-abaya' || clothingType === 'academic-robe' ? (
              /* ELEGANT MODEST ABAYA / ROBE (Flowing to ankles with soft folds) */
              <g id="abaya-dress">
                {/* Back drape silhouette */}
                <path
                  d="M130 250 C110 320 95 480 90 620 L310 620 C305 480 290 320 270 250 C245 270 155 270 130 250 Z"
                  fill={clothingColor}
                />
                <path
                  d="M130 250 C110 320 95 480 90 620 L310 620 C305 480 290 320 270 250 C245 270 155 270 130 250 Z"
                  fill="url(#fabricWeave)"
                />

                {/* Natural Fabric Folds & Shading */}
                <path
                  d="M150 280 C140 370 130 490 120 620"
                  stroke="#000000"
                  strokeWidth="3"
                  opacity="0.25"
                  strokeLinecap="round"
                />
                <path
                  d="M250 280 C260 370 270 490 280 620"
                  stroke="#000000"
                  strokeWidth="3"
                  opacity="0.25"
                  strokeLinecap="round"
                />
                <path
                  d="M185 270 C182 380 180 500 175 620"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  opacity="0.12"
                  strokeLinecap="round"
                />

                {/* Central Champagne Gold Placket & Trim */}
                <path
                  d="M194 255 L194 620 L206 620 L206 255 Z"
                  fill={secondaryClothingColor || '#D4AF37'}
                />
                <line x1="200" y1="260" x2="200" y2="615" stroke="#0A192F" strokeWidth="1.2" opacity="0.4" />

                {/* Waist Satin Sash / Belt */}
                <path
                  d="M138 340 C175 350 225 350 262 340 L264 354 C225 365 175 365 136 354 Z"
                  fill={secondaryClothingColor || '#D4AF37'}
                  opacity="0.9"
                />

                {/* Abaya Sleeve - Left */}
                <path
                  d="M130 250 C95 290 75 360 85 410 C100 415 118 410 125 390 L145 285 Z"
                  fill={clothingColor}
                />
                {/* Gold Cuff Left */}
                <path d="M85 405 C100 412 115 410 125 390" stroke={secondaryClothingColor || '#D4AF37'} strokeWidth="4" />

                {/* Abaya Sleeve - Right */}
                <path
                  d="M270 250 C305 290 325 360 315 410 C300 415 282 410 275 390 L255 285 Z"
                  fill={clothingColor}
                />
                {/* Gold Cuff Right */}
                <path d="M315 405 C300 412 285 410 275 390" stroke={secondaryClothingColor || '#D4AF37'} strokeWidth="4" />
              </g>
            ) : (
              /* TAILORED BLAZER & BLOUSE / OXFORD JACKET */
              <g id="blazer-suit">
                {/* Base Inner Shirt / Blouse */}
                <path d="M175 240 L200 285 L225 240 L200 230 Z" fill="#FAF8F5" />
                <line x1="200" y1="250" x2="200" y2="340" stroke="#D4AF37" strokeWidth="1.5" />

                {/* Main Jacket Torso */}
                <path
                  d="M135 245 C115 300 120 370 125 410 L275 410 C280 370 285 300 265 245 C235 260 165 260 135 245 Z"
                  fill={clothingColor}
                />
                <path
                  d="M135 245 C115 300 120 370 125 410 L275 410 C280 370 285 300 265 245 C235 260 165 260 135 245 Z"
                  fill="url(#fabricWeave)"
                />

                {/* Lapels */}
                <path d="M145 248 L185 330 L200 330 L168 250 Z" fill="#000000" opacity="0.18" />
                <path d="M142 248 L182 328 L198 328 L165 250 Z" fill={clothingColor} stroke={secondaryClothingColor} strokeWidth="1.2" />

                <path d="M255 248 L215 330 L200 330 L232 250 Z" fill="#000000" opacity="0.18" />
                <path d="M258 248 L218 328 L202 328 L235 250 Z" fill={clothingColor} stroke={secondaryClothingColor} strokeWidth="1.2" />

                {/* Gold Buttons */}
                <circle cx="200" cy="345" r="3.5" fill="#D4AF37" stroke="#FAF8F5" strokeWidth="0.8" />
                <circle cx="200" cy="375" r="3.5" fill="#D4AF37" stroke="#FAF8F5" strokeWidth="0.8" />

                {/* Left Sleeve */}
                <path d="M135 245 C105 285 92 350 96 395 C110 400 122 395 128 375 L145 275 Z" fill={clothingColor} />
                {/* Right Sleeve */}
                <path d="M265 245 C295 285 308 350 304 395 C290 400 278 395 272 375 L255 275 Z" fill={clothingColor} />
              </g>
            )}

            {/* Hands (Natural Anatomical Skin) */}
            <g id="hands">
              {/* Left Hand & Delicate Fingers */}
              <path
                d="M86 405 C80 420 84 435 90 442 C96 448 105 442 110 435 C116 426 122 410 114 398 Z"
                fill={skinTone}
              />
              <path d="M92 425 C93 435 97 440 100 440" stroke={getSkinDark()} strokeWidth="0.8" opacity="0.5" />

              {/* Right Hand & Delicate Fingers */}
              <path
                d="M314 405 C320 420 316 435 310 442 C304 448 295 442 290 435 C284 426 278 410 286 398 Z"
                fill={skinTone}
              />
              <path d="M308 425 C307 435 303 440 300 440" stroke={getSkinDark()} strokeWidth="0.8" opacity="0.5" />
            </g>

            {/* English Zone Gold Star Crest on Left Chest */}
            {accessories.includes('star-brooch') && (
              <g id="academy-crest" transform="translate(155, 275)">
                <circle cx="0" cy="0" r="9" fill="#0A192F" stroke="#D4AF37" strokeWidth="1.5" />
                <path d="M0 -6 L1.8 -1.8 L6.2 -1.8 L2.7 0.8 L4 5.2 L0 2.5 L-4 5.2 L-2.7 0.8 L-6.2 -1.8 L-1.8 -1.8 Z" fill="#D4AF37" />
              </g>
            )}
          </g>

          {/* --- NECK & JAW ANATOMY --- */}
          <g id="neck-throat">
            <path
              d="M182 205 L180 252 C192 256 208 256 220 252 L218 205 Z"
              fill={skinTone}
            />
            {/* Throat shadow under chin */}
            <path
              d="M180 205 C190 220 210 220 220 205 L218 222 C206 232 194 232 182 222 Z"
              fill={getSkinDark()}
              opacity="0.35"
            />
          </g>

          {/* --- BEAUTIFUL ANATOMICAL FACE & HEAD --- */}
          <g id="head-face">
            {/* Base Face Cranium Contour */}
            <path
              d="M142 145 C140 100 160 75 200 75 C240 75 260 100 258 145 C256 185 235 220 200 222 C165 220 144 185 142 145 Z"
              fill="url(#faceLight)"
            />

            {/* Soft Warm Blush on Cheeks */}
            <ellipse cx="165" cy="165" rx="14" ry="9" fill="#F87171" opacity="0.22" />
            <ellipse cx="235" cy="165" rx="14" ry="9" fill="#F87171" opacity="0.22" />

            {/* Chin shadow / highlight */}
            <ellipse cx="200" cy="214" rx="10" ry="4" fill="#FFFFFF" opacity="0.18" />

            {/* Ears (Only visible when hijab is off or turban style) */}
            {(!hasHijab || hijabStyle === 'royal-turban') && (
              <g id="ears">
                <path
                  d="M142 142 C135 142 132 155 137 168 C140 175 144 172 143 162 Z"
                  fill={skinTone}
                  stroke={getSkinDark()}
                  strokeWidth="0.8"
                />
                <path
                  d="M258 142 C265 142 268 155 263 168 C260 175 256 172 257 162 Z"
                  fill={skinTone}
                  stroke={getSkinDark()}
                  strokeWidth="0.8"
                />
              </g>
            )}

            {/* --- REFINED FACIAL FEATURES --- */}

            {/* Sculpted Eyebrows */}
            <g id="eyebrows">
              <path
                d="M158 126 C166 120 178 121 186 127 C178 124 166 123 158 126 Z"
                fill={hairColor}
              />
              <path
                d="M242 126 C234 120 222 121 214 127 C222 124 234 123 242 126 Z"
                fill={hairColor}
              />
            </g>

            {/* Detailed Expressive Eyes */}
            <g id="eyes">
              {/* Left Eye */}
              <g id="left-eye">
                {/* Sclera Eyeball */}
                <path
                  d="M160 140 C166 132 180 132 186 140 C180 147 166 147 160 140 Z"
                  fill="#F8FAFC"
                />
                {/* Iris with deep radial gradation */}
                <circle cx="173" cy="140" r="5.5" fill="url(#irisGrad)" />
                {/* Pupil */}
                <circle cx="173" cy="140" r="2.4" fill="#0A0A0A" />
                {/* Cornea Specular Gloss */}
                <circle cx="171.5" cy="138" r="1.3" fill="#FFFFFF" />
                <circle cx="174.5" cy="141.5" r="0.7" fill="#FFFFFF" opacity="0.8" />
                {/* Upper Eyelash Contour */}
                <path
                  d="M158 139 C166 131 180 131 188 139"
                  stroke="#171717"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </g>

              {/* Right Eye */}
              <g id="right-eye">
                <path
                  d="M240 140 C234 132 220 132 214 140 C220 147 234 147 240 140 Z"
                  fill="#F8FAFC"
                />
                <circle cx="227" cy="140" r="5.5" fill="url(#irisGrad)" />
                <circle cx="227" cy="140" r="2.4" fill="#0A0A0A" />
                <circle cx="225.5" cy="138" r="1.3" fill="#FFFFFF" />
                <circle cx="228.5" cy="141.5" r="0.7" fill="#FFFFFF" opacity="0.8" />
                <path
                  d="M242 139 C234 131 220 131 212 139"
                  stroke="#171717"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </g>
            </g>

            {/* Sculpted Delicate Nose */}
            <g id="nose">
              {/* Soft bridge shading */}
              <path
                d="M198 135 L197 165 C197 172 203 172 203 165"
                stroke={getSkinDark()}
                strokeWidth="1.1"
                opacity="0.35"
                strokeLinecap="round"
              />
              {/* Nostril curvature & tip highlight */}
              <path
                d="M193 172 C196 175 204 175 207 172"
                stroke={getSkinDark()}
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <circle cx="200" cy="169" r="1.5" fill="#FFFFFF" opacity="0.3" />
            </g>

            {/* Natural Friendly Lips */}
            <g id="lips">
              {/* Upper Lip with Cupid's bow */}
              <path
                d="M188 187 C194 184 198 186 200 187 C202 186 206 184 212 187 C206 190 194 190 188 187 Z"
                fill={lipColor}
              />
              {/* Lower Lip fullness */}
              <path
                d="M189 188 C194 196 206 196 211 188 C206 193 194 193 189 188 Z"
                fill={lipColor}
              />
              {/* Specular gloss highlight */}
              <ellipse cx="200" cy="191" rx="4" ry="1.5" fill="#FFFFFF" opacity="0.3" />
            </g>
          </g>

          {/* --- HAIRSTYLES (If Hijab is not active, or for male) --- */}
          {!hasHijab && (
            <g id="hair-collection">
              {gender === 'female' ? (
                hairStyle === 'long-waves' ? (
                  /* Long Soft Waves flowing past shoulders */
                  <g id="hair-waves">
                    <path
                      d="M142 135 C132 80 160 65 200 65 C240 65 268 80 258 135 C275 190 280 290 265 340 C250 290 255 200 248 140 C240 90 160 90 152 140 C145 200 150 290 135 340 C120 290 125 190 142 135 Z"
                      fill={hairColor}
                    />
                    <path
                      d="M155 80 C185 75 215 75 245 80 C235 70 165 70 155 80 Z"
                      fill="#FFFFFF"
                      opacity="0.18"
                    />
                  </g>
                ) : hairStyle === 'bob-cut' ? (
                  /* Chic Modern Bob Cut */
                  <g id="hair-bob">
                    <path
                      d="M140 145 C132 80 160 65 200 65 C240 65 268 80 260 145 C265 190 255 205 248 195 C250 140 245 85 200 85 C155 85 150 140 152 195 C145 205 135 190 140 145 Z"
                      fill={hairColor}
                    />
                  </g>
                ) : (
                  /* Classic Shoulder-Length */
                  <g id="hair-shoulder">
                    <path
                      d="M140 140 C132 80 160 65 200 65 C240 65 268 80 260 140 C270 200 265 260 250 275 C245 220 248 140 200 90 C152 140 155 220 150 275 C135 260 130 200 140 140 Z"
                      fill={hairColor}
                    />
                  </g>
                )
              ) : (
                /* MALE ACADEMIC HAIRSTYLE */
                <g id="male-hair">
                  <path
                    d="M142 130 C138 78 165 65 200 65 C235 65 262 78 258 130 C254 105 245 80 200 80 C155 80 146 105 142 130 Z"
                    fill={hairColor}
                  />
                  <path
                    d="M152 90 C180 82 220 82 248 90 C235 84 165 84 152 90 Z"
                    fill="#FFFFFF"
                    opacity="0.18"
                  />
                </g>
              )}
            </g>
          )}

          {/* --- BEAUTIFULLY MODELED HIJAB COLLECTION (NATURAL FABRIC FOLDS & DRAPERY) --- */}
          {hasHijab && gender === 'female' && (
            <g id="hijab-collection">
              {/* 1. Forehead Inner Undercap / Band */}
              <path
                d="M156 112 C172 100 228 100 244 112 C236 106 164 106 156 112 Z"
                fill={hijabTrimColor || '#D4AF37'}
              />

              {/* 2. Main Volumetric Hijab Hood Envelope framing the face smoothly */}
              <path
                d="M136 142 C132 80 162 65 200 65 C238 65 268 80 264 142 C264 195 242 222 200 222 C158 222 136 195 136 142 Z"
                fill="url(#hijabSilkGrad)"
              />
              <path
                d="M136 142 C132 80 162 65 200 65 C238 65 268 80 264 142 C264 195 242 222 200 222 C158 222 136 195 136 142 Z"
                fill="url(#fabricWeave)"
              />

              {/* Hijab Inner Oval Cutout (Re-framing the face cleanly) */}
              <path
                d="M148 140 C146 106 166 90 200 90 C234 90 254 106 252 140 C250 180 234 212 200 214 C166 212 150 180 148 140 Z"
                fill="url(#faceLight)"
              />

              {/* Re-render Cheeks, Eyes, Nose & Lips seamlessly inside the clean inner cutout */}
              <ellipse cx="165" cy="165" rx="14" ry="9" fill="#F87171" opacity="0.22" />
              <ellipse cx="235" cy="165" rx="14" ry="9" fill="#F87171" opacity="0.22" />
              {/* Eyebrows */}
              <path d="M160 127 C168 121 178 122 186 128 C178 125 168 124 160 127 Z" fill={hairColor} />
              <path d="M240 127 C232 121 222 122 214 128 C222 125 232 124 240 127 Z" fill={hairColor} />
              {/* Eyes */}
              <path d="M162 140 C167 133 179 133 185 140 C179 146 167 146 162 140 Z" fill="#F8FAFC" />
              <circle cx="174" cy="140" r="5.2" fill="url(#irisGrad)" />
              <circle cx="174" cy="140" r="2.3" fill="#0A0A0A" />
              <circle cx="172.5" cy="138" r="1.3" fill="#FFFFFF" />
              <path d="M160 139 C167 132 179 132 187 139" stroke="#171717" strokeWidth="1.8" strokeLinecap="round" />

              <path d="M238 140 C233 133 221 133 215 140 C221 146 233 146 238 140 Z" fill="#F8FAFC" />
              <circle cx="226" cy="140" r="5.2" fill="url(#irisGrad)" />
              <circle cx="226" cy="140" r="2.3" fill="#0A0A0A" />
              <circle cx="224.5" cy="138" r="1.3" fill="#FFFFFF" />
              <path d="M240 139 C233 132 221 132 213 139" stroke="#171717" strokeWidth="1.8" strokeLinecap="round" />

              {/* Nose & Lips */}
              <path d="M198 138 L197 165 C197 172 203 172 203 165" stroke={getSkinDark()} strokeWidth="1.1" opacity="0.35" strokeLinecap="round" />
              <path d="M193 172 C196 175 204 175 207 172" stroke={getSkinDark()} strokeWidth="1.6" strokeLinecap="round" />
              <path d="M188 187 C194 184 198 186 200 187 C202 186 206 184 212 187 C206 190 194 190 188 187 Z" fill={lipColor} />
              <path d="M189 188 C194 196 206 196 211 188 C206 193 194 193 189 188 Z" fill={lipColor} />

              {/* 3. Draping Styles & Natural Fabric Folds */}
              {hijabStyle === 'flowing-shawl' ? (
                /* STYLE A: FLOWING SATIN SHAWL OVER SHOULDERS & CHEST */
                <g id="shawl-drapery">
                  <path
                    d="M120 220 C95 250 85 305 105 345 C135 365 265 365 295 345 C315 305 305 250 280 220 C240 240 160 240 120 220 Z"
                    fill="url(#hijabSilkGrad)"
                  />
                  {/* Graceful fold pleats */}
                  <path d="M130 240 C145 280 180 320 200 335" stroke="#FFFFFF" strokeWidth="1.8" opacity="0.25" strokeLinecap="round" />
                  <path d="M270 240 C255 280 220 320 200 335" stroke="#000000" strokeWidth="2.5" opacity="0.3" strokeLinecap="round" />
                  <path d="M165 250 C180 285 200 310 215 325" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.2" strokeLinecap="round" />
                </g>
              ) : (
                /* STYLE B: MODERN TAILORED ACADEMIC WRAP */
                <g id="modern-wrap-drapery">
                  <path
                    d="M130 215 C115 240 110 275 125 300 C155 315 245 315 275 300 C290 275 285 240 270 215 C240 230 160 230 130 215 Z"
                    fill="url(#hijabSilkGrad)"
                  />
                  {/* Clean angled wrap fold line */}
                  <path
                    d="M142 225 C165 250 215 285 255 280"
                    stroke="#FFFFFF"
                    strokeWidth="2.2"
                    opacity="0.3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M142 226 C165 251 215 286 255 281"
                    stroke="#000000"
                    strokeWidth="1.5"
                    opacity="0.25"
                    strokeLinecap="round"
                  />
                </g>
              )}

              {/* Hijab Gold Clasp / Brooch */}
              <circle cx="200" cy="228" r="4.5" fill="#D4AF37" stroke="#FAF8F5" strokeWidth="1" />
              <circle cx="200" cy="228" r="2" fill="#0A192F" />
            </g>
          )}

          {/* --- ACCESSORIES: METALLIC SCHOLAR GLASSES --- */}
          {accessories.includes('glasses') && (
            <g id="scholar-glasses">
              {/* Left Lens Frame */}
              <rect
                x="156"
                y="131"
                width="32"
                height="20"
                rx="6"
                fill="#FFFFFF"
                fillOpacity="0.25"
                stroke="#D4AF37"
                strokeWidth="2"
              />
              {/* Right Lens Frame */}
              <rect
                x="212"
                y="131"
                width="32"
                height="20"
                rx="6"
                fill="#FFFFFF"
                fillOpacity="0.25"
                stroke="#D4AF37"
                strokeWidth="2"
              />
              {/* Nose Bridge */}
              <path d="M188 139 C194 135 206 135 212 139" stroke="#D4AF37" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              {/* Subtle glass reflection sheen */}
              <line x1="160" y1="147" x2="175" y2="135" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.7" />
              <line x1="216" y1="147" x2="231" y2="135" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.7" />
            </g>
          )}

        </g>
      </svg>
    </div>
  );
};
