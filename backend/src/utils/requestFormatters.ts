import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  CATEGORY_LABELS,
  ACTION_ICON_MAP,
} from './requestConstants';
import { formatDateInIST } from './timezoneUtils';

export const formatIndianDate = (date: Date | string | null): string => {
  return formatDateInIST(date);
};

export const getActionLabel = (
  action: string,
  oldStatus: string | null,
  newStatus: string | null,
): string => {
  switch (action) {
    case 'create':                   return 'Request Created';
    case 'edit':                     return 'Request Edited';
    case 'resubmit':                 return 'Request Resubmitted';
    case 'status_change':            return `Status Changed: ${oldStatus ?? 'N/A'} → ${newStatus ?? 'N/A'}`;
    case 'clarification_requested':  return 'Clarification Requested';
    case 'clarification_responded':  return 'Clarification Response Submitted';
    case 'reopen':                   return 'Request Reopened';
    default:                         return 'Activity';
  }
};


export const formatLog = (log: any) => {
  const p = log.toJSON ? log.toJSON() : log;
  return {
    id: p.id,
    requestId: p.requestId,
    oldStatus: p.oldStatus,
    newStatus: p.newStatus,
    role: p.role,
    action: p.action,
    actionLabel: getActionLabel(p.action, p.oldStatus, p.newStatus),
    actionIconName: ACTION_ICON_MAP[p.action] ?? 'History',
    comments: p.comments,
    timestampFormatted: formatDateInIST(p.timestamp),
    changedByUser: p.changedByUser
      ? {
          id: p.changedByUser.id,
          name: p.changedByUser.name,
          email: p.changedByUser.email,
          role: p.role,
        }
      : null,
  };
};

export const formatRequestBase = (p: any) => {
  const statusConfig   = STATUS_CONFIG[p.status]     ?? STATUS_CONFIG.submitted;
  const priorityConfig = PRIORITY_CONFIG[p.priority] ?? PRIORITY_CONFIG.medium;

  return {
    id: p.id,
    title: p.title,
    description: p.description,

    category: p.category,
    priority: p.priority,
    status: p.status,

    categoryLabel: CATEGORY_LABELS[p.category] ?? p.category,

    statusDisplay: {
      label: statusConfig.label,
      color: statusConfig.color,
      iconName: statusConfig.iconName,
    },

    priorityDisplay: {
      label: priorityConfig.label,
      color: priorityConfig.color,
    },

    submittedAtFormatted:  formatDateInIST(p.submittedAt),
    createdAtFormatted:    formatDateInIST(p.createdAt),
    approvedAtFormatted:   p.approvedAt  ? formatDateInIST(p.approvedAt)  : null,
    rejectedAtFormatted:   p.rejectedAt  ? formatDateInIST(p.rejectedAt)  : null,
    closedAtFormatted:     p.closedAt    ? formatDateInIST(p.closedAt)    : null,
    reopenedAtFormatted:   p.reopenedAt  ? formatDateInIST(p.reopenedAt)  : null,

    comments:               p.comments,
    clarificationRequest:   p.clarificationRequest,
    clarificationResponse:  p.clarificationResponse,
    reopenReason:           p.reopenReason,

    user: p.user
      ? { id: p.user.id, name: p.user.name, email: p.user.email }
      : null,
    manager: p.manager
      ? { id: p.manager.id, name: p.manager.name, email: p.manager.email }
      : null,
    admin: p.admin
      ? { id: p.admin.id, name: p.admin.name, email: p.admin.email }
      : null,
  };
};

export const attachLogs = (result: Record<string, any>, logs: any[]) => {
  const sorted = [...logs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
  result.logs = sorted.map(formatLog);
};

export const formatRecentRequest = (r: any) => {
  const p = r.toJSON ? r.toJSON() : r;
  return {
    id: p.id,
    title: p.title,
    category: p.category,
    priority: p.priority,
    status: p.status,
    categoryLabel:   CATEGORY_LABELS[p.category]  ?? p.category,
    statusDisplay:   STATUS_CONFIG[p.status]       ?? STATUS_CONFIG.submitted,
    priorityDisplay: PRIORITY_CONFIG[p.priority]   ?? PRIORITY_CONFIG.medium,
    user:    p.user    ? { name: p.user.name }    : null,
    manager: p.manager ? { name: p.manager.name } : null,
    submittedAtFormatted: formatDateInIST(p.submittedAt),
  };
};