import * as Yup from "yup";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import { adminLogin } from "../../../api/auth/adminAuth";
import { useState } from "react";

const loginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const initialValues = {
    email: "",
    password: "",
  };

  const onSubmit = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await adminLogin(data);
      console.log("login response in login page", response);

      if (response.success) {
        localStorage.setItem("adminEmail", response.data.admin.email);
        localStorage.setItem("isAdminAuthenticated", "true");
        
        toast.success(response.message);
        navigate("/admin/job-roles");
      } else {
        toast.error(response.message);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Login error:", error.message);
      } else {
        console.error("Login error:", error);
      }
      toast.error("Login failed. Please check your credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-100">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md border border-gray-200">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <svg
              className="h-10 w-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-2">
          ADMIN LOGIN
        </h2>
        <p className="text-center text-gray-500 text-sm mb-8">
          Enter your credentials to access admin panel
        </p>

        <Formik
          initialValues={initialValues}
          validationSchema={loginSchema}
          onSubmit={onSubmit}
        >
          {({ errors, touched, values, handleChange, handleBlur }) => (
            <Form className="space-y-5">
              {/* Email Field */}
              <div className="w-full space-y-1.5">
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  disabled={isLoading}
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`
                    w-full px-4 py-2.5 
                    border rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                    transition-all duration-200
                    disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70
                    ${
                      errors.email && touched.email
                        ? 'border-red-500 bg-red-50/50 focus:ring-red-500/50 focus:border-red-500' 
                        : 'border-gray-300 bg-white'
                    }
                  `}
                />
                {errors.email && touched.email && (
                  <p className="text-sm text-red-600 animate-fadeIn">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="w-full space-y-1.5">
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    disabled={isLoading}
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`
                      w-full px-4 py-2.5 pr-12
                      border rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                      transition-all duration-200
                      disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70
                      ${
                        errors.password && touched.password
                          ? 'border-red-500 bg-red-50/50 focus:ring-red-500/50 focus:border-red-500' 
                          : 'border-gray-300 bg-white'
                      }
                    `}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="
                      absolute right-3 top-1/2 -translate-y-1/2
                      text-gray-500 hover:text-gray-700
                      focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-0.5
                      transition-colors duration-200
                    "
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="text-sm text-red-600 animate-fadeIn">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Demo Credentials Hint */}
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-xs text-blue-600 text-center">
                  <span className="font-semibold">Demo Credentials:</span><br />
                  Email: admin@resumescanner.com<br />
                  Password: Admin@123
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Logging in...
                  </>
                ) : (
                  "Login to Admin Panel"
                )}
              </button>

              {/* Back to User Login */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  ← Back to User Login
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default LoginPage;