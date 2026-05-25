import userRouterEndPoints from "../../endpoints/userEndpoint";
import { API } from "../../services/axios";

export interface JobRole {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  category?: string;
}

export interface UploadResumeResponse {
  success: boolean;
  message: string;
  data: {
    resumeId: string;
    fileName: string;
    extractedSkills: string[];
    categorizedSkills: Record<string, string[]>;
    pageCount: number;
  };
}

export interface CompareResumeRequest {
  resumeId: string;
  jobRoleId: string;
}

export interface CompareResumeResponse {
  success: boolean;
  message: string;
  data: {
    matchPercentage: number;
    matchedSkills: string[];
    missingSkills: string[];
    extraSkills: string[];
    suggestions: string[];
    scanId: string;
  };
}

export interface ScanHistoryItem {
  id: string;
  jobRoleTitle: string;
  fileName: string;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  createdAt: string;
}

export interface ScanHistoryResponse {
  success: boolean;
  data: {
    scans: ScanHistoryItem[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface ScanDetailData {
  id: string;
  jobRoleTitle: string;
  fileName: string;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  extraSkills: string[];
  suggestions: string[];
  createdAt: string;
  resume?: {
    id: string;
    fileName: string;
    extractedSkills: string[];
    categorizedSkills: Record<string, string[]>;
  };
}

export interface ScanDetailResponse {
  success: boolean;
  data: ScanDetailData;
}

export interface UserResume {
  id: string;
  fileName: string;
  extractedSkills: string[];
  createdAt: string;
}

export interface UserResumesResponse {
  success: boolean;
  data: UserResume[];
}


export const getJobRoles = async (): Promise<{ success: boolean; data: JobRole[] }> => {
  const response = await API.get(userRouterEndPoints.jobRoles);
  return response.data;
};

export const uploadResume = async (file: File): Promise<UploadResumeResponse> => {
  const formData = new FormData();
  formData.append('resume', file);
  
  const response = await API.post(userRouterEndPoints.uploadResume, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const compareResume = async (data: CompareResumeRequest): Promise<CompareResumeResponse> => {
  const response = await API.post(userRouterEndPoints.compareResume, data);
  return response.data;
};

export const getScanHistory = async (page: number = 1, limit: number = 10): Promise<ScanHistoryResponse> => {
  const response = await API.get(userRouterEndPoints.scanHistory, {
    params: { page, limit },
  });
  return response.data;
};

export const getScanDetail = async (scanId: string): Promise<ScanDetailResponse> => {
  const response = await API.get(userRouterEndPoints.scanDetail(scanId));
  return response.data;
};

export const deleteScanHistory = async (scanId: string): Promise<{ success: boolean; message: string }> => {
  const response = await API.delete(userRouterEndPoints.deleteScan(scanId));
  return response.data;
};

export const getUserResumes = async (): Promise<UserResumesResponse> => {
  const response = await API.get(userRouterEndPoints.userResumes);
  return response.data;
};

export const deleteResume = async (resumeId: string): Promise<{ success: boolean; message: string }> => {
  const response = await API.delete(userRouterEndPoints.deleteResume(resumeId));
  return response.data;
};