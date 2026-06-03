
import axios, {
  type AxiosInstance,
  type AxiosError,
} from "axios";
import { toast } from "react-toastify";
import { clearUserDetails } from "../redux/slices/userSlice"; 
import { type Dispatch, type AnyAction } from "@reduxjs/toolkit";
import { type NavigateFunction } from "react-router-dom";

export const API: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, 
  timeout: 10000,
});

let toastShown = false;
let toastTimeout: number | undefined;

let isRedirecting = false;

interface ErrorResponse {
  success?: boolean;
  message?: string;
  errors?: Array<{ msg: string; path: string }>;
}

let interceptorId: number | null = null;

export const configureAxiosInterceptors = (
  dispatch: Dispatch<AnyAction>,
  navigate: NavigateFunction
) => {
  if (interceptorId !== null) {
    API.interceptors.response.eject(interceptorId);
  }

  interceptorId = API.interceptors.response.use(
    (response) => response, 
    (error: AxiosError<ErrorResponse>) => {
      if (error.response?.status === 401) {
        
        const isLoginPage = window.location.pathname === '/login' || 
                           window.location.pathname === '/admin/login' ||
                           window.location.pathname === '/manager/login';
        
        if (isLoginPage) {
          return Promise.reject(error);
        }
        
        if (isRedirecting) {
          return Promise.reject(error);
        }
        
        isRedirecting = true;
        
        dispatch(clearUserDetails());
        
        if (!toastShown) {
          toastShown = true;
          toast.error(error.response?.data?.message || "Session expired. Please login again.");
          toastTimeout = setTimeout(() => {
            toastShown = false;
          }, 3000) as unknown as number;
        }
        
        const currentPath = window.location.pathname;
        const isAdminRoute = currentPath.startsWith('/admin');
        const isManagerRoute = currentPath.startsWith('/manager');
        
        setTimeout(() => {
          if (isAdminRoute) {
            navigate("/admin/login");
          } else if (isManagerRoute) {
            navigate("/manager/login");
          } else {
            navigate("/login");
          }
          setTimeout(() => {
            isRedirecting = false;
          }, 1000);
        }, 100);
        
        return Promise.reject(error);
      }

      if (error.response?.status === 403) {
        if (!toastShown) {
          toastShown = true;
          toast.error(error.response?.data?.message || "Access denied. You don't have permission.");
          toastTimeout = setTimeout(() => {
            toastShown = false;
          }, 2000) as unknown as number;
        }
        return Promise.reject(error);
      }
      if (error.response?.status === 500 && !toastShown) {
        toastShown = true;
        toast.error("Server error. Please try again later.");
        
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
          toastShown = false;
        }, 2000) as unknown as number;
      }

      return Promise.reject(error);
    }
  );
};