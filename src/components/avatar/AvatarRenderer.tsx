import React from 'react';
import { EZAvatar } from './EZAvatar';

interface AvatarRendererProps {
  config?: any;
  size?: number;
  className?: string;
  showBackground?: boolean;
  view?: 'head' | 'full';
}

// واجهة واحدة لعرض أفاتار أي شخص في الموقع: صورته الشخصية إن اختارها، وإلا الأفاتار الكرتوني
export const AvatarRenderer: React.FC<AvatarRendererProps> = ({ config, size = 64, className = '', showBackground = true, view = 'head' }) => {
  if (config?.mode === 'photo' && typeof config.photo === 'string' && config.photo.startsWith('data:image/')) {
    return (
      <img
        src={config.photo}
        alt=""
        width={size}
        height={size}
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return <EZAvatar config={config} size={size} view={view} showBackground={showBackground} className={className} />;
};
