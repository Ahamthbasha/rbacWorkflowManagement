// pages/manager/Auth/Register.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { type AxiosError } from "axios";
import { useState } from "react";
import InputField from "../../../components/common/InputField"; 
import PasswordField from "../../../components/common/PasswordField"; 
import { managerRegister } from "../../../api/auth/managerAuth";
import { Building2, Shield, Sparkles, Mail, Lock, User, Briefcase } from "lucide-react";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    department: z.string().min(2, "Department is required"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

interface ErrorResponse {
  success: boolean;
  message?: string;
  errors?: Array<{ msg: string; path: string }>;
}

export default function ManagerRegister() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsSubmitting(true);
    try {
      const { name, email, password, department } = data;
      const res = await managerRegister({ name, email, password, department });

      if (res.success) {
        toast.success(res.message || "Manager registration successful! Please login.");
        navigate("/manager/login");
      }
    } catch (error: unknown) {
      const err = error as AxiosError<ErrorResponse>;
      
      if (err.response?.data) {
        const responseData = err.response.data;
        
        if (responseData.errors && Array.isArray(responseData.errors)) {
          responseData.errors.forEach((validationErr) => {
            toast.error(validationErr.msg);
          });
        } else if (responseData.message) {
          toast.error(responseData.message);
        } else {
          toast.error("Registration failed. Please try again.");
        }
      } else {
        toast.error("Network error. Please check your connection and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 sm:p-10 border border-gray-200 dark:border-gray-700">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl mb-6 shadow-lg">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Manager Registration
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Create your manager account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <InputField
              label="Full Name"
              id="name"
              type="text"
              placeholder="John Doe"
              icon={<User className="h-4 w-4 text-gray-400" />}
              {...register("name")}
              error={errors.name?.message}
            />

            <InputField
              label="Email Address"
              id="email"
              type="email"
              placeholder="manager@company.com"
              icon={<Mail className="h-4 w-4 text-gray-400" />}
              {...register("email")}
              error={errors.email?.message}
            />

            <InputField
              label="Department"
              id="department"
              type="text"
              placeholder="e.g., IT, HR, Sales, Operations"
              icon={<Briefcase className="h-4 w-4 text-gray-400" />}
              {...register("department")}
              error={errors.department?.message}
            />

            <PasswordField
              label="Password"
              id="password"
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4 text-gray-400" />}
              {...register("password")}
              error={errors.password?.message}
            />

            <PasswordField
              label="Confirm Password"
              id="confirmPassword"
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4 text-gray-400" />}
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
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
                  Creating Manager Account...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Register as Manager
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Already have a manager account?{" "}
              <Link 
                to="/manager/login" 
                className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link 
              to="/register" 
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              ← Register as Regular User
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center justify-center">
              <Shield className="h-3 w-3 mr-1" />
              Manager accounts require admin approval
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}