// components/InfoField.tsx
import React from "react";

interface InfoFieldProps {
  label: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  vertical?: boolean;
}

const InfoField: React.FC<InfoFieldProps> = ({
  label,
  value,
  children,
  className = "",
  vertical = false,
}) => {
  return (
    <div
      className={`${
        vertical
          ? "flex flex-col gap-0.5"
          : "flex flex-col sm:flex-row sm:items-start sm:gap-4"
      } ${className}`}
    >
      <span
        className={`text-xs font-semibold uppercase tracking-wide text-slate-400 ${
          !vertical ? "sm:w-36 sm:shrink-0 pt-0.5" : ""
        }`}
      >
        {label}
      </span>
      <span className="text-sm text-slate-800 dark:text-slate-200">
        {value ?? children ?? <span className="text-slate-400">—</span>}
      </span>
    </div>
  );
};

export default InfoField;