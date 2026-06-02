// components/StatusBadge.tsx
import React from "react";

type StatusColor =
  | "green"
  | "yellow"
  | "red"
  | "blue"
  | "gray"
  | "orange"
  | "purple";

interface StatusBadgeProps {
  label: string;
  color?: StatusColor;
  /** If provided, overrides `color` with the raw hex/CSS string from the API */
  apiColor?: string;
  size?: "sm" | "md";
  dot?: boolean;
}

const colorMap: Record<StatusColor, { bg: string; text: string; dot: string }> =
  {
    green: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    yellow: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      dot: "bg-amber-500",
    },
    red: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
    blue: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
    gray: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      dot: "bg-orange-500",
    },
    purple: {
      bg: "bg-violet-50",
      text: "text-violet-700",
      dot: "bg-violet-500",
    },
  };

const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  color = "gray",
  apiColor,
  size = "md",
  dot = true,
}) => {
  const cls = colorMap[color];
  const padCls = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  if (apiColor) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-medium ${padCls}`}
        style={{ backgroundColor: `${apiColor}18`, color: apiColor }}
      >
        {dot && (
          <span
            className="h-1.5 w-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: apiColor }}
          />
        )}
        {label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${padCls} ${cls.bg} ${cls.text}`}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${cls.dot}`} />
      )}
      {label}
    </span>
  );
};

export default StatusBadge;