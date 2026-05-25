import { API } from "../../services/axios"; 
import adminRouterEndPoints from "../../endpoints/adminEndpoints"; 

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  data: {
    admin: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  };
}
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const adminLogin = async (data: AdminLoginRequest): Promise<AdminLoginResponse> => {
  const response = await API.post(adminRouterEndPoints.adminLogin, data);
  return response.data;
};

export const adminLogout = async (): Promise<{ success: boolean; message: string }> => {
  const response = await API.post(adminRouterEndPoints.adminLogout);
  return response.data;
};