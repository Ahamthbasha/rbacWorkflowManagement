import React from "react";
import type { WorkflowRequest } from "../../types/requestTypes";
import StatusBadge from "./StatusBadge";
import SectionCard from "./SectionCard";
import { ICONS } from "./iconPaths";
import { priorityColor, statusColor } from "./requestHelpers";
import { Icon } from "./Icons";

interface RequestSidebarProps {
  request: WorkflowRequest;
  showSubmitter?: boolean;
  showManager?: boolean;
  actionButtons?: React.ReactNode;
}

export const RequestSidebar: React.FC<RequestSidebarProps> = ({
  request,
  showSubmitter = true,
  showManager = false,
  actionButtons,
}) => (
  <div className="space-y-4">
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5 flex flex-col items-center gap-3 text-center">
      <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
        <Icon path={ICONS.check} className="h-6 w-6 text-slate-400" />
      </div>
      <div>
        <p className="text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wide">
          Current Status
        </p>
        <StatusBadge
          label={request.statusDisplay?.label ?? request.status ?? ""}
          color={statusColor(request.status ?? "")}
          apiColor={request.statusDisplay?.color}
          size="md"
        />
      </div>
    </div>

    {showSubmitter && (
      <SectionCard title="Submitted by">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center shrink-0">
              <Icon
                path={ICONS.user}
                className="h-4 w-4 text-sky-600 dark:text-sky-400"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                {request.user?.name ?? "Unknown user"}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {request.user?.email ?? "No email"}
              </p>
            </div>
          </div>
          {request.user?.department && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                Department
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-300">
                {request.user.department}
              </span>
            </div>
          )}
        </div>
      </SectionCard>
    )}

    {showManager && request.manager && (
      <SectionCard title="Manager">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
            <Icon
              path={ICONS.user}
              className="h-4 w-4 text-violet-600 dark:text-violet-400"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              {request.manager.name}
            </p>
            {request.manager.email && (
              <p className="text-xs text-slate-400 truncate">
                {request.manager.email}
              </p>
            )}
          </div>
        </div>
      </SectionCard>
    )}

    <SectionCard title="Details">
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
            Category
          </span>
          <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
            {request.categoryLabel ?? request.category}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
            Priority
          </span>
          <StatusBadge
            label={request.priorityDisplay?.label ?? request.priority ?? ""}
            color={priorityColor(request.priority ?? "")}
            apiColor={request.priorityDisplay?.color}
            size="sm"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
            Submitted
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {request.submittedAtFormatted ??
              (request.createdAt
                ? new Date(request.createdAt).toLocaleDateString()
                : "—")}
          </span>
        </div>
      </div>
    </SectionCard>

    {actionButtons && (
      <SectionCard title="Actions">{actionButtons}</SectionCard>
    )}
  </div>
);
