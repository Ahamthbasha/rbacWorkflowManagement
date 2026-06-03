
import { API } from "../../services/axios";
import managerEndpoints from "../../endpoints/managerEndpoint"; 
import type {
  WorkflowRequest,
  RequestLog,
  ApiResponse,
  DashboardStats
} from "../../types/requestTypes";

export const getDashboardStats = async (): Promise<ApiResponse<DashboardStats>> => {
  const response = await API.get(managerEndpoints.managerDashboardStats);
  return response.data;
};
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

export const getAssignedRequests = async (params: GetRequestsParams = {}): Promise<PaginatedResponse<WorkflowRequest>> => {
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
    ? `${managerEndpoints.getAssignedRequests}?${queryParams}`
    : managerEndpoints.getAssignedRequests;
  
  const response = await API.get(url);
  return response.data;
};

export interface GetPendingRequestsParams {
  page?: number;
  limit?: number;
  category?: string;
  priority?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export const getPendingRequests = async (params: GetPendingRequestsParams = {}): Promise<PaginatedResponse<WorkflowRequest>> => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.category) queryParams.append('category', params.category);
  if (params.priority) queryParams.append('priority', params.priority);
  if (params.search) queryParams.append('search', params.search);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  
  const url = queryParams.toString() 
    ? `${managerEndpoints.getPendingRequests}?${queryParams}`
    : managerEndpoints.getPendingRequests;
  
  const response = await API.get(url);
  return response.data;
};

export const getRequestById = async (requestId: string): Promise<ApiResponse<WorkflowRequest>> => {
  const response = await API.get(managerEndpoints.getRequestById(requestId));
  return response.data;
};

export const getRequestLogs = async (requestId: string): Promise<ApiResponse<RequestLog[]>> => {
  const response = await API.get(managerEndpoints.getRequestLogs(requestId));
  return response.data;
};

export interface ApproveRequestData {
  comments?: string;
}

export interface RejectRequestData {
  reason: string;
}

export interface ClarificationRequestData {
  question: string;
}

export const approveRequest = async (requestId: string, data: ApproveRequestData): Promise<ApiResponse<WorkflowRequest>> => {
  const response = await API.put(managerEndpoints.approveRequest(requestId), data);
  return response.data;
};

export const rejectRequest = async (requestId: string, data: RejectRequestData): Promise<ApiResponse<WorkflowRequest>> => {
  const response = await API.put(managerEndpoints.rejectRequest(requestId), data);
  return response.data;
};

export const requestClarification = async (requestId: string, data: ClarificationRequestData): Promise<ApiResponse<WorkflowRequest>> => {
  const response = await API.post(managerEndpoints.requestClarification(requestId), data);
  return response.data;
};