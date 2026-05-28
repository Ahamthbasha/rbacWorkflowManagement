// controllers/managerAuthController.ts
import { Request, Response, NextFunction } from "express";
import AppError from "../../utils/appError";
import AuthService from "../../services/authService";
import { UserRole } from "../../models/userModel";

// Helper function for consistent cookie options
const getCookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "strict") as
    | "none"
    | "strict",
  maxAge,
});

export class ManagerAuthController {
  constructor(private authService: AuthService) {}

  // Register manager (sets role as MANAGER)
  register = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { name, email, password, department } = req.body;

      // Validate required fields
      if (!name || !email || !password) {
        throw new AppError("Name, email and password are required", 400);
      }

      // Validate email format
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        throw new AppError("Please provide a valid email address", 400);
      }

      // Validate password strength
      if (password.length < 6) {
        throw new AppError("Password must be at least 6 characters long", 400);
      }

      // Check if user already exists
      const existingUser = await this.authService.findUserByEmail(email);
      if (existingUser) {
        throw new AppError("User with this email already exists", 409);
      }

      // Create manager user
      const user = await this.authService.registerManager({
        name,
        email,
        password,
        department,
      });

      // Generate tokens
      const tokens = this.authService.generateUserTokens(user);

      // Set auth tokens in HTTP-only cookies
      res.cookie(
        "accessToken",
        tokens.accessToken,
        getCookieOptions(15 * 60 * 1000),
      ); // 15 minutes
      res.cookie(
        "refreshToken",
        tokens.refreshToken,
        getCookieOptions(7 * 24 * 60 * 60 * 1000),
      ); // 7 days

      res.status(201).json({
        success: true,
        message: "Manager registration successful",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            department: user.department,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Manager login
  login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        throw new AppError("Email and password are required", 400);
      }

      // Login as manager
      const result = await this.authService.loginManager({ email, password });

      // Set auth tokens in HTTP-only cookies
      res.cookie(
        "accessToken",
        result.tokens.accessToken,
        getCookieOptions(15 * 60 * 1000),
      ); // 15 minutes
      res.cookie(
        "refreshToken",
        result.tokens.refreshToken,
        getCookieOptions(7 * 24 * 60 * 60 * 1000),
      ); // 7 days

      res.status(200).json({
        success: true,
        message: "Manager login successful",
        data: {
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Logout
  logout = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Clear all auth cookies
      const clearOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: (process.env.NODE_ENV === "production"
          ? "none"
          : "strict") as "none" | "strict",
      };

      res.clearCookie("accessToken", clearOptions);
      res.clearCookie("refreshToken", clearOptions);

      res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      next(error);
    }
  };

  // Get current manager
  getCurrentManager = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError("Manager not authenticated", 401);
      }

      const user = await this.authService.getCurrentUser(userId);

      // Verify role is manager
      if (user.role !== UserRole.MANAGER) {
        throw new AppError("Access denied. Manager role required.", 403);
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          department: user.department,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ManagerAuthController;
