// utils/requestConstants.ts
// ─── Shared display configs used across user, manager, and admin controllers ──

export const STATUS_CONFIG: Record<string, { label: string; color: string; iconName: string }> = {
  submitted:             { label: 'Submitted',           color: 'yellow', iconName: 'Clock'        },
  pending:               { label: 'Pending',             color: 'blue',   iconName: 'Clock'        },
  approved:              { label: 'Approved',            color: 'green',  iconName: 'CheckCircle'  },
  rejected:              { label: 'Rejected',            color: 'red',    iconName: 'XCircle'      },
  clarification_needed:  { label: 'Clarification Needed',color: 'purple', iconName: 'AlertCircle'  },
  closed:                { label: 'Closed',              color: 'gray',   iconName: 'CheckCircle'  },
  reopened:              { label: 'Reopened',            color: 'teal',   iconName: 'RefreshCw'    },
  cancelled:             { label: 'Cancelled',           color: 'orange', iconName: 'XCircle'      },
};

export const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low:    { label: 'Low',    color: 'green'  },
  medium: { label: 'Medium', color: 'yellow' },
  high:   { label: 'High',   color: 'orange' },
  urgent: { label: 'Urgent', color: 'red'    },
};

export const CATEGORY_LABELS: Record<string, string> = {
  access:   'Access Request',
  software: 'Software Request',
  hardware: 'Hardware Request',
  leave:    'Leave Request',
  budget:   'Budget Request',
  other:    'Other',
};

export const ACTION_ICON_MAP: Record<string, string> = {
  create:                    'FileText',
  edit:                      'Edit',
  resubmit:                  'RefreshCw',
  status_change:             'Tag',
  clarification_requested:   'MessageSquare',
  clarification_responded:   'Send',
  reopen:                    'RefreshCw',
};