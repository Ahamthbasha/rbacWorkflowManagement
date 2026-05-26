// types/requestTypes.ts
export type RequestStatus = 
  | 'submitted'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'clarification_needed'
  | 'closed'
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

// Constants for enums (optional - for type safety)
export const RequestStatusValues = {
  SUBMITTED: 'submitted' as const,
  PENDING: 'pending' as const,
  APPROVED: 'approved' as const,
  REJECTED: 'rejected' as const,
  CLARIFICATION: 'clarification_needed' as const,
  CLOSED: 'closed' as const,
  CANCELLED: 'cancelled' as const,
} as const;

export const RequestPriorityValues = {
  LOW: 'low' as const,
  MEDIUM: 'medium' as const,
  HIGH: 'high' as const,
  URGENT: 'urgent' as const,
} as const;

export const RequestCategoryValues = {
  ACCESS: 'access' as const,
  SOFTWARE: 'software' as const,
  HARDWARE: 'hardware' as const,
  LEAVE: 'leave' as const,
  BUDGET: 'budget' as const,
  OTHER: 'other' as const,
} as const;

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
  comments: string | null;
  timestamp: string;
  changedByUser?: {        // ✅ was 'user' — now matches the association alias
    id: string;
    name: string;
    email: string;
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
  priority: RequestPriority;
  status: RequestStatus;
  userId: string;
  managerId: string | null;
  adminId: string | null;
  comments: string | null;
  clarificationRequest: string | null;
  clarificationResponse: string | null;
  submittedAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  manager?: Manager;
  logs?: RequestLog[];
}

// Generic ApiResponse type
export interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}