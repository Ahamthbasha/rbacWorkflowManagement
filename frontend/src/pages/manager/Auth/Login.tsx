import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { type AxiosError } from "axios";
import { useDispatch } from "react-redux";
import { Mail, Lock, Building2, LogIn, Shield } from "lucide-react";
import InputField from "../../../components/common/InputField"; 
import PasswordField from "../../../components/common/PasswordField"; 
import { managerLogin } from "../../../api/auth/managerAuth";
import { setManager } from "../../../redux/slices/managerSlice";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

interface ErrorResponse {
  success: boolean;
  message?: string;
  errors?: Array<{ msg: string; path: string }>;
}

export default function ManagerLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await managerLogin(data);

      if (res.success && res.data?.user) {
        // Store manager data in Redux
        dispatch(
          setManager({
            _id: res.data.user.id,
            name: res.data.user.name,
            email: res.data.user.email,
            role: res.data.user.role,
            isActive: res.data.user.isActive,
          })
        );
        
        toast.success(`Welcome back, ${res.data.user.name}!`);
        navigate("/manager/requests");
      }
    } catch (error: unknown) {
      const err = error as AxiosError<ErrorResponse>;
      
      if (err.response?.data) {
        const responseData = err.response.data;
        
        if (responseData.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
          toast.error(responseData.errors[0].msg);
        } else if (responseData.message) {
          toast.error(responseData.message);
        } else {
          toast.error("Login failed. Please try again.");
        }
      } else if (err.code === "ECONNABORTED") {
        toast.error("Request timeout. Please try again.");
      } else if (err.message === "Network Error") {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 sm:p-10 border border-gray-200 dark:border-gray-700">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl mb-6 shadow-lg">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Manager Portal
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Role-Based Access Control System
            </p>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Welcome Back, Manager
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Sign in to review and manage requests
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <InputField
              label="Email Address"
              id="email"
              type="email"
              placeholder="manager@example.com"
              icon={<Mail className="h-4 w-4 text-gray-400" />}
              {...register("email")}
              error={errors.email?.message}
            />

            <PasswordField
              label="Password"
              id="password"
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4 text-gray-400" />}
              {...register("password")}
              error={errors.password?.message}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="
                w-full flex justify-center items-center py-3 px-4 
                bg-gradient-to-r from-blue-600 to-cyan-600 
                hover:from-blue-700 hover:to-cyan-700
                text-white font-semibold rounded-lg
                focus:outline-none focus:ring-4 focus:ring-blue-500/50
                transition-all duration-200 transform hover:scale-[1.02]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                mt-6
              "
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Don't have a manager account?{" "}
              <Link 
                to="/manager/register" 
                className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Register as Manager
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link 
              to="/login" 
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              ← Back to User Login
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center justify-center">
              <Shield className="h-3 w-3 mr-1" />
              Manager credentials are securely encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}