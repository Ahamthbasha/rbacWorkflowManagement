// api/action/userAction.ts
import userRouterEndPoints from "../../endpoints/userEndpoint";
import { API } from "../../services/axios";

import type {
  CreateRequestData,
  ClarificationResponseData,
  WorkflowRequest,
  RequestLog,
  ApiResponse
} from "../../types/requestTypes";

// Create a new request
export const createRequest = async (data: CreateRequestData): Promise<ApiResponse<WorkflowRequest>> => {
  const response = await API.post(userRouterEndPoints.createRequest, data);
  return response.data;
};

export const getUserRequests = async (
  params?: Record<string, string>
): Promise<ApiResponse<WorkflowRequest[]>> => {
  const response = await API.get(userRouterEndPoints.getUserRequests, {
    params,
  });
  return response.data;
};

// Get a specific request by ID
export const getRequestById = async (requestId: string): Promise<ApiResponse<WorkflowRequest>> => {
  const response = await API.get(userRouterEndPoints.getRequestById(requestId));
  return response.data;
};

// Get request logs/history by REQUEST ID
export const getRequestLogs = async (requestId: string): Promise<ApiResponse<RequestLog[]>> => {
  const response = await API.get(userRouterEndPoints.getRequestLogs(requestId));
  return response.data;
};

// Respond to clarification request from manager
export const respondToClarification = async (
  requestId: string,
  data: ClarificationResponseData
): Promise<ApiResponse<WorkflowRequest>> => {
  const response = await API.put(userRouterEndPoints.respondToClarification(requestId), data);
  return response.data;
};

// Cancel a pending request
export const cancelRequest = async (requestId: string): Promise<ApiResponse<WorkflowRequest>> => {
  const response = await API.delete(userRouterEndPoints.cancelRequest(requestId));
  return response.data;
};

// Edit rejected request
export const editRequest = async (
  requestId: string,
  data: Partial<CreateRequestData>
): Promise<ApiResponse<WorkflowRequest>> => {
  const response = await API.put(userRouterEndPoints.editRequest(requestId), data);
  return response.data;
};

// Resubmit rejected request after editing
export const resubmitRequest = async (requestId: string): Promise<ApiResponse<WorkflowRequest>> => {
  const response = await API.put(userRouterEndPoints.resubmitRequest(requestId));
  return response.data;
};