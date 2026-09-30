import React from 'react';
import { useSiteContent } from '../services/siteContent';

interface ClinicLogoProps {
  className?: string;
  size?: number;
}

export const ClinicLogo: React.FC<ClinicLogoProps> = ({ className = 'w-14 h-14', size = 56 }) => {
  const { stationInfo } = useSiteContent();

  return (
    <img
      src={stationInfo.logoUrl}
      width={size}
      height={size}
      alt="Biểu trưng Trạm Y tế An Hải"
      className={`${className} shrink-0 object-contain`}
    />
  );
};
