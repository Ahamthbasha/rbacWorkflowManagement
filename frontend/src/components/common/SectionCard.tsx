import React from "react";

interface SectionCardProps {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, icon, children, className = "", action }) => (
  <div className={`rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm transition-shadow hover:shadow-md ${className}`}>
    {title && (
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {icon && <span className="text-slate-400 dark:text-slate-500">{icon}</span>}
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 tracking-tight">{title}</h3>
        </div>
        {action && <div>{action}</div>}
      </div>
    )}
    <div className="p-5">{children}</div>
  </div>
);

export default SectionCard;