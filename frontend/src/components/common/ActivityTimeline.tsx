import React from "react";
import type { RequestLog } from "../../types/requestTypes";
import { ICONS } from "./iconPaths";
import { StatusPill } from "./StatusPill";
import { roleBadgeClass, actionIconPath } from "./requestHelpers";
import { Icon } from "./Icons";

interface ActivityTimelineProps {
  logs: RequestLog[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ logs }) => {
  if (!logs.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Icon path={ICONS.activity} className="h-5 w-5 text-slate-400" />
        </div>
        <p className="text-sm text-slate-400">No activity yet.</p>
      </div>
    );
  }

  return (
    <ol className="relative space-y-0">
      {logs.map((log, idx) => {
        const isLast = idx === logs.length - 1;
        const actor = log.changedByUser as
          | { id: string; name: string; email: string; role?: string }
          | undefined;

        return (
          <li key={log.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 ring-2 ring-white dark:ring-slate-900">
                <Icon
                  path={actionIconPath(log.actionIconName)}
                  className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400"
                />
              </span>
              {!isLast && (
                <span className="w-px flex-1 bg-slate-200 dark:bg-slate-700 my-1" />
              )}
            </div>

            <div className={`flex-1 min-w-0 ${isLast ? "pb-0" : "pb-5"}`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {log.actionLabel ?? log.action}
                </span>
                {actor?.role && (
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${roleBadgeClass(
                      actor.role,
                    )}`}
                  >
                    {actor.role}
                  </span>
                )}
                <span className="ml-auto text-xs text-slate-400 whitespace-nowrap">
                  {log.timestampFormatted ?? log.timestamp}
                </span>
              </div>

              {actor && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Icon path={ICONS.user} className="h-3 w-3" />
                  <span>{actor.name}</span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="truncate">{actor.email}</span>
                </div>
              )}

              {(log.oldStatus || log.newStatus) && (
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <StatusPill value={log.oldStatus ?? null} />
                  {log.oldStatus && log.newStatus && (
                    <Icon
                      path="M9 5l7 7-7 7"
                      className="h-3 w-3 text-slate-400 shrink-0"
                    />
                  )}
                  <StatusPill value={log.newStatus ?? null} />
                </div>
              )}

              {log.comments && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 rounded-lg px-3 py-2 border border-slate-100 dark:border-slate-700">
                  {log.comments}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};
