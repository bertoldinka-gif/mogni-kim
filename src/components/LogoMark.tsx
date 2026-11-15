import React from 'react';

interface LogoMarkProps {
  size?: number;
  className?: string;
}

export const LogoMark: React.FC<LogoMarkProps> = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="36" height="36" rx="9" fill="#1E1B4B" stroke="#4F46E5" strokeWidth="1.25" />
      <path
        d="M9.5 25V11H13.1L18 19.2L22.9 11H26.5V25H23.2V16.6L19.1 23.3H16.9L12.8 16.6V25H9.5Z"
        fill="#E0E7FF"
      />
      <rect x="24" y="22.5" width="4.5" height="4.5" rx="1.2" fill="#10B981" />
    </svg>
  );
};
