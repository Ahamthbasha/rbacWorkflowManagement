import React from "react";
import type { WorkflowRequest } from "../../types/requestTypes";
import StatusBadge from "./StatusBadge";
import { ICONS } from "./iconPaths";
import { priorityColor, statusColor } from "./requestHelpers";
import { Icon } from "./Icons";

interface RequestHeaderCardProps {
  request: WorkflowRequest;
  onBack: () => void;
  actions?: React.ReactNode;
}

export const RequestHeaderCard: React.FC<RequestHeaderCardProps> = ({
  request,
  onBack,
  actions,
}) => (
  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
    <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
    <div className="px-6 py-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <button
            onClick={onBack}
            className="mt-1 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
            aria-label="Go back"
          >
            <Icon path={ICONS.back} className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug truncate">
                {request.title}
              </h1>
              <StatusBadge
                label={request.statusDisplay?.label ?? request.status ?? ""}
                color={statusColor(request.status ?? "")}
                apiColor={request.statusDisplay?.color}
              />
            </div>
            <div className="mt-1 flex items-center gap-3 flex-wrap">
              {request.categoryLabel && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Icon path={ICONS.tag} className="h-3 w-3" />
                  {request.categoryLabel}
                </span>
              )}
              {(request.submittedAtFormatted ?? request.createdAt) && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Icon path={ICONS.calendar} className="h-3 w-3" />
                  {request.submittedAtFormatted ??
                    new Date(request.createdAt!).toLocaleDateString()}
                </span>
              )}
              <StatusBadge
                label={request.priorityDisplay?.label ?? request.priority ?? ""}
                color={priorityColor(request.priority ?? "")}
                apiColor={request.priorityDisplay?.color}
                size="sm"
              />
            </div>
          </div>
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  </div>
);
