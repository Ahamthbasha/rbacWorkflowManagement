import userRouterEndPoints from "../../endpoints/userEndpoint";
import { API } from "../../services/axios";
import type {
  CreateRequestData,
  ClarificationResponseData,
  WorkflowRequest,
  ApiResponse,
} from "../../types/requestTypes";

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

export const createRequest = async (
  data: CreateRequestData
): Promise<ApiResponse<WorkflowRequest>> => {
  const response = await API.post(userRouterEndPoints.createRequest, data);
  return response.data;
};

export const getUserRequests = async (
  params?: Record<string, string | number>
): Promise<PaginatedResponse<WorkflowRequest>> => {
  const queryParams: Record<string, string> = {};
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      queryParams[key] = String(value);
    });
  }
  const response = await API.get(userRouterEndPoints.getUserRequests, {
    params: queryParams,
  });
  return response.data;
};

export const getRequestById = async (
  requestId: string
): Promise<ApiResponse<WorkflowRequest>> => {
  const response = await API.get(userRouterEndPoints.getRequestById(requestId));
  return response.data;
};

export const editAndResubmitRequest = async (
  requestId: string,
  data: Partial<CreateRequestData>
): Promise<ApiResponse<WorkflowRequest>> => {
  const response = await API.put(
    userRouterEndPoints.editAndResubmitRequest(requestId),
    data
  );
  return response.data;
};

export const respondToClarification = async (
  requestId: string,
  data: ClarificationResponseData
): Promise<ApiResponse<WorkflowRequest>> => {
  const response = await API.put(
    userRouterEndPoints.respondToClarification(requestId),
    data
  );
  return response.data;
};


export interface UserDashboardStats {
  counts: {
    total: number;
    submitted: number;
    pending: number;
    approved: number;
    rejected: number;
    clarification: number;
    closed: number;
    cancelled: number;
    reopened: number;
  };
  recentRequests: Array<{
    id: string;
    title: string;
    category: string;
    priority: string;
    status: string;
    categoryLabel: string;
    statusDisplay: { label: string; color: string; iconName: string };
    priorityDisplay: { label: string; color: string };
    submittedAtFormatted: string;
  }>;
}

export const getUserDashboardStats = async (): Promise<ApiResponse<UserDashboardStats>> => {
  const response = await API.get(userRouterEndPoints.userDashboard);
  return response.data;
};