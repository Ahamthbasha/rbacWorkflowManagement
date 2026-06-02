import React from "react";
import { statusColor } from "./requestHelpers";

interface StatusPillProps {
  value: string | null;
}

export const StatusPill: React.FC<StatusPillProps> = ({ value }) => {
  if (!value) {
    return <span className="text-slate-400 italic text-xs">—</span>;
  }
  const color = statusColor(value);
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    yellow: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    purple: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
    gray: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colorMap[color]}`}
    >
      {value.replace(/_/g, " ")}
    </span>
  );
};