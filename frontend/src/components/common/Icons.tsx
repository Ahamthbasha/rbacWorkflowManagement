import React from "react";

interface IconProps {
  path: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({
  path,
  className = "h-4 w-4",
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);