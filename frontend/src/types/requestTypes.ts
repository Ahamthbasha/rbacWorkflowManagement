// types/requestTypes.ts
export type RequestStatus = 
  | 'submitted'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'clarification_needed'
  | 'closed'
  | 'reopened'
  | 'cancelled';

export type RequestPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export type RequestCategory = 
  | 'access'
  | 'software'
  | 'hardware'
  | 'leave'
  | 'budget'
  | 'other';

// Display types for backend computed values
export interface StatusDisplay {
  label: string;
  color: string;
  iconName: string;
}

export interface PriorityDisplay {
  label: string;
  color: string;
}

// Admin action buttons
export interface AdminActionButtons {
  canClose: boolean;
  canReopen: boolean;
}

// Manager action buttons
export interface ManagerActionButtons {
  canApprove: boolean;
  canReject: boolean;
  canClarify: boolean;
}

// Union type for actions
export type ActionButtons = AdminActionButtons | ManagerActionButtons;

// Dashboard Stats - Match backend response structure
export interface DashboardStats {
  counts: {
    total: number;
    submitted:number;
    pending: number;
    approved: number;
    rejected: number;
    clarification:number;
    closed:number;
    cancelled:number;
    reopened:number;
  };
  recentRequests: WorkflowRequest[];
}

export interface CreateRequestData {
  title: string;
  description: string;
  category?: RequestCategory;
  priority?: RequestPriority;
}

export interface UpdateRequestStatusData {
  status: RequestStatus;
  comments?: string;
}

export interface ClarificationRequestData {
  question: string;
}

export interface ClarificationResponseData {
  response: string;
}

export interface RequestLog {
  id: string;
  requestId: string;
  oldStatus: string | null;
  newStatus: string | null;
  changedBy: string;
  role: string;
  action: string;
  actionLabel?: string;
  actionIconName?: string;
  comments: string | null;
  timestamp: string;
  timestampFormatted?: string;
  changedByUser?: {
    id: string;
    name: string;
    email: string;
    role?:string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  department?: string;
}

export interface Manager {
  id: string;
  name: string;
  email: string;
}

export interface WorkflowRequest {
  id: string;
  title: string;
  description: string;
  category: RequestCategory;
  categoryLabel?: string;
  priority: RequestPriority;
  priorityDisplay?: PriorityDisplay;
  status: RequestStatus;
  statusDisplay?: StatusDisplay;
  userId: string;
  managerId: string | null;
  adminId: string | null;
  comments: string | null;
  clarificationRequest: string | null;
  clarificationResponse: string | null;
  reopenReason: string | null;
  reopenedAt: string | null;
  submittedAt: string;
  submittedAtFormatted?: string;
  createdAt: string;
  createdAtFormatted?: string;
  updatedAt: string;
  updatedAtFormatted?: string;
  approvedAt: string | null;
  approvedAtFormatted?: string | null;
  rejectedAt: string | null;
  rejectedAtFormatted?: string | null;
  closedAt: string | null;
  closedAtFormatted?: string | null;
  reopenedAtFormatted?: string | null;
  actions?: ActionButtons;
  user?: User;
  manager?: Manager;
  logs?: RequestLog[];
}

export interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}