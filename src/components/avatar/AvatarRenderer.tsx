import React from 'react';
import { EZAvatar } from './EZAvatar';

interface AvatarRendererProps {
  config?: any;
  size?: number;
  className?: string;
  showBackground?: boolean;
  view?: 'head' | 'full';
}

// واجهة واحدة لعرض أفاتار أي طالب في الموقع
export const AvatarRenderer: React.FC<AvatarRendererProps> = ({ config, size = 64, className = '', showBackground = true, view = 'head' }) => (
  <EZAvatar config={config} size={size} view={view} showBackground={showBackground} className={className} />
);
