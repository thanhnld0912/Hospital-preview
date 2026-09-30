import React from 'react';

interface ClinicLogoProps {
  className?: string;
  size?: number;
}

export const ClinicLogo: React.FC<ClinicLogoProps> = ({ className = 'w-14 h-14', size = 56 }) => {
  return (
    <img
      src="/logo.jpg"
      width={size}
      height={size}
      alt="Biểu trưng Trạm Y tế An Hải"
      className={`${className} shrink-0 object-contain`}
    />
  );
};
