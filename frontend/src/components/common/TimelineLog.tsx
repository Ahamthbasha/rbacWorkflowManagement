// components/TimelineLog.tsx
import React from "react";
import type { RequestLog } from "../../types/requestTypes";

interface TimelineLogProps {
  logs: RequestLog[];
}

const actionMeta: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  create: {
    label: "Request created",
    color: "bg-blue-500",
    icon: "M12 4v16m8-8H4",
  },
  edit: {
    label: "Request edited",
    color: "bg-amber-500",
    icon: "M15.232 5.232l3.536 3.536M9 11l6.586-6.586a2 2 0 112.828 2.828L11.828 13.828A2 2 0 0110 14H8v-2a2 2 0 01.586-1.414z",
  },
  resubmit: {
    label: "Resubmitted",
    color: "bg-violet-500",
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  },
  status_change: {
    label: "Status changed",
    color: "bg-slate-500",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
  clarification_requested: {
    label: "Clarification requested",
    color: "bg-orange-500",
    icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  clarification_responded: {
    label: "Clarification responded",
    color: "bg-teal-500",
    icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  },
  reopen: {
    label: "Reopened",
    color: "bg-cyan-500",
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9",
  },
};

const roleBadge = (role: string) => {
  const map: Record<string, string> = {
    user: "bg-blue-50 text-blue-700",
    manager: "bg-emerald-50 text-emerald-700",
    admin: "bg-violet-50 text-violet-700",
  };
  return map[role] ?? "bg-gray-100 text-gray-600";
};

const TimelineLog: React.FC<TimelineLogProps> = ({ logs }) => {
  if (!logs.length) {
    return (
      <p className="text-sm text-slate-400 py-2">No activity recorded yet.</p>
    );
  }

  return (
    <ol className="relative">
      {logs.map((log, idx) => {
        const meta = actionMeta[log.action] ?? {
          label: log.action,
          color: "bg-slate-400",
          icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
        };
        const isLast = idx === logs.length - 1;

        return (
          <li key={log.id} className="relative flex gap-4 pb-6">
            {/* vertical connector line */}
            {!isLast && (
              <span className="absolute left-[14px] top-7 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
            )}

            {/* dot */}
            <span
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${meta.color}`}
            >
              <svg
                className="h-3.5 w-3.5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={meta.icon} />
              </svg>
            </span>

            {/* content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {meta.label}
                </p>
                <span
                  className={`text-[11px] font-medium rounded px-1.5 py-0.5 ${roleBadge(
                    log.role
                  )}`}
                >
                  {log.role}
                </span>
                {log.oldStatus && log.newStatus && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">
                      {log.oldStatus}
                    </span>
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">
                      {log.newStatus}
                    </span>
                  </span>
                )}
              </div>
              {log.comments && (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                  {log.comments}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-400">
                {new Date(log.timestamp).toLocaleString()}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default TimelineLog;