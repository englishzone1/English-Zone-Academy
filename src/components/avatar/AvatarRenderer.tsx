import React from 'react';
import { AvatarConfiguration } from '../../types/auth';
import { StylizedCartoonAvatarCanvas } from './StylizedCartoonAvatarCanvas';

interface AvatarRendererProps {
  config: AvatarConfiguration;
  size?: number | string;
  className?: string;
  showBackground?: boolean;
}

export const AvatarRenderer: React.FC<AvatarRendererProps> = ({
  config,
  size = 280,
  className = '',
  showBackground = true
}) => {
  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none overflow-hidden rounded-2xl ${className}`}
      style={{ width: size, height: size }}
    >
      <StylizedCartoonAvatarCanvas
        config={config as any}
        cameraView="face"
        angleView="front"
        showBackground={showBackground}
      />
    </div>
  );
};
