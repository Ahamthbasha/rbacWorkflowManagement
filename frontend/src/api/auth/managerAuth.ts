
import { API } from "../../services/axios"; 
import managerEndpoints from "../../endpoints/managerEndpoint";

export interface ManagerLoginRequest {
  email: string;
  password: string;
}

export interface ManagerRegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ManagerLoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      isActive: boolean;
      createdAt?: string;
    };
  };
}

export interface ManagerRegisterResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  };
}

export interface ManagerProfileResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  };
}

export interface PendingRequest {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: string;
}

export interface PendingRequestsResponse {
  success: boolean;
  data: PendingRequest[];
  count: number;
}

export interface ApproveRequestData {
  comments?: string;
}

export interface RejectRequestData {
  reason: string;
}

export interface ClarifyRequestData {
  question: string;
}

export const managerLogin = async (data: ManagerLoginRequest): Promise<ManagerLoginResponse> => {
  const response = await API.post(managerEndpoints.managerLogin, data);
  return response.data;
};

export const managerRegister = async (data: ManagerRegisterRequest): Promise<ManagerRegisterResponse> => {
  const response = await API.post(managerEndpoints.managerRegister, data);
  return response.data;
};

export const managerLogout = async (): Promise<{ success: boolean; message: string }> => {
  const response = await API.post(managerEndpoints.managerLogout);
  return response.data;
};

const managerAuth = {
  login: managerLogin,
  register: managerRegister,
  logout: managerLogout,
};

export default managerAuth;