// api/action/adminAction.ts
import { API } from "../../services/axios";
import adminEndpoints from "../../endpoints/adminEndpoints";
import type {
  WorkflowRequest,
  RequestLog,
  ApiResponse,
  DashboardStats,
} from "../../types/requestTypes";

export interface AdminProfileResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

// ==================== DASHBOARD ====================

// DashboardStats is now imported from requestTypes.ts (counts + recentRequests shape)
export const getDashboardStats = async (): Promise<ApiResponse<DashboardStats>> => {
  const response = await API.get(adminEndpoints.adminDashboardStats);
  return response.data;
};

// ==================== REQUEST MANAGEMENT ====================

export interface GetRequestsParams {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Get all requests with filters
export const getAllRequests = async (params: GetRequestsParams = {}): Promise<PaginatedResponse<WorkflowRequest>> => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.status) queryParams.append('status', params.status);
  if (params.category) queryParams.append('category', params.category);
  if (params.priority) queryParams.append('priority', params.priority);
  if (params.search) queryParams.append('search', params.search);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);

  const url = queryParams.toString()
    ? `${adminEndpoints.getAllRequests}?${queryParams}`
    : adminEndpoints.getAllRequests;

  const response = await API.get(url);
  return response.data;
};

// Get single request by ID
export const getRequestById = async (requestId: string): Promise<ApiResponse<WorkflowRequest>> => {
  const response = await API.get(adminEndpoints.getRequestById(requestId));
  return response.data;
};

// Get request logs
export const getRequestLogs = async (requestId: string): Promise<ApiResponse<RequestLog[]>> => {
  const response = await API.get(adminEndpoints.getRequestLogs(requestId));
  return response.data;
};

// ==================== ADMIN ACTIONS ====================

export interface CloseRequestData {
  closureNote?: string;
}

export interface ReopenRequestData {
  reason: string;
}

// Close a request (only approved requests can be closed)
export const closeRequest = async (requestId: string, data: CloseRequestData): Promise<ApiResponse<WorkflowRequest>> => {
  const response = await API.put(adminEndpoints.closeRequest(requestId), data);
  return response.data;
};

// Reopen a request (only closed or cancelled requests can be reopened)
export const reopenRequest = async (requestId: string, data: ReopenRequestData): Promise<ApiResponse<WorkflowRequest>> => {
  const response = await API.put(adminEndpoints.reopenRequest(requestId), data);
  return response.data;
};