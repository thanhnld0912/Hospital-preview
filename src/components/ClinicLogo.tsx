import React from 'react';

interface ClinicLogoProps {
  className?: string;
  size?: number;
}

export const ClinicLogo: React.FC<ClinicLogoProps> = ({ className = 'w-14 h-14', size = 56 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0`}
      aria-label="Biểu trưng Trạm Y tế"
    >
      {/* Outer Blue Ring */}
      <circle cx="64" cy="64" r="60" stroke="#0057c2" strokeWidth="6" fill="#f8f9ff" />
      <circle cx="64" cy="64" r="54" stroke="#d9e3f6" strokeWidth="2" fill="#ffffff" />

      {/* Central Blue Cross with stylized geometry */}
      {/* Vertical crossbar */}
      <rect x="52" y="28" width="24" height="72" rx="3" fill="#0057c2" />
      {/* Horizontal crossbar */}
      <rect x="28" y="52" width="72" height="24" rx="3" fill="#0057c2" />
      {/* Inner white core cut */}
      <rect x="56" y="32" width="16" height="64" rx="1" fill="#ffffff" />
      <rect x="32" y="56" width="64" height="16" rx="1" fill="#ffffff" />
      {/* Center solid plus anchor */}
      <rect x="54" y="44" width="20" height="40" fill="#0057c2" />
      <rect x="44" y="54" width="40" height="20" fill="#0057c2" />

      {/* Green Dot in upper shaft */}
      <circle cx="64" cy="42" r="4" fill="#006c4e" />

      {/* Green Smiling Health Arc at the bottom */}
      <path
        d="M32 76C36 94 48 102 64 102C80 102 92 94 96 76"
        stroke="#006c4e"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
};
