// middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import JwtService from "../services/jwtService";
import User from "../models/userModel";
import AppError from "../utils/appError";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

const getCookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "strict") as
    | "none"
    | "strict",
  maxAge,
});

export class AuthMiddleware {
  constructor(private jwtService: JwtService) {}

  // Authenticate and auto-refresh token for all roles (user, manager, admin)
  authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Get tokens from cookies
      let accessToken = req.cookies?.accessToken;
      let refreshToken = req.cookies?.refreshToken;

      if (!accessToken && !refreshToken) {
        throw new AppError("No authentication tokens provided", 401);
      }

      // Try to verify access token first
      if (accessToken) {
        try {
          const payload = this.jwtService.verifyAccessToken(accessToken);

          // Verify user exists and is active
          const user = await User.findByPk(payload.userId);

          if (!user || !user.isActive) {
            throw new AppError("User not found or inactive", 401);
          }

          // Set user info in request
          req.user = {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
          };

          return next();
        } catch (accessTokenError) {
          // Access token expired or invalid, try refresh token
          console.log("Access token expired/invalid, trying refresh token...");
        }
      }

      // Try to use refresh token to get new access token
      if (refreshToken) {
        try {
          const refreshPayload =
            this.jwtService.verifyRefreshToken(refreshToken);

          // Verify user exists and is active
          const user = await User.findByPk(refreshPayload.userId);

          if (!user || !user.isActive) {
            // Clear invalid cookies
            this.clearAuthCookies(res);
            throw new AppError("User not found or inactive", 401);
          }

          // Generate new access token
          const newAccessToken = this.jwtService.generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
          });

          // Set new access token in cookie
          res.cookie(
            "accessToken",
            newAccessToken,
            getCookieOptions(15 * 60 * 1000),
          ); // 15 minutes

          // Set user info in request
          req.user = {
            userId: user.id,
            email: user.email,
            role: user.role,
          };

          return next();
        } catch (refreshTokenError) {
          // Refresh token expired or invalid
          this.clearAuthCookies(res);
          throw new AppError("Session expired. Please login again.", 401);
        }
      }

      throw new AppError("Authentication required", 401);
    } catch (error) {
      next(error);
    }
  };

  // Admin authorization middleware
  isAdmin = (req: AuthRequest, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError("User not authenticated", 401);
      }

      if (req.user.role !== "admin") {
        throw new AppError("Access denied. Admin privileges required.", 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  // Manager authorization middleware
  isManager = (req: AuthRequest, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError("User not authenticated", 401);
      }

      if (req.user.role !== "manager") {
        throw new AppError("Access denied. Manager privileges required.", 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  // User authorization middleware
  isUser = (req: AuthRequest, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError("User not authenticated", 401);
      }

      if (req.user.role !== "user") {
        throw new AppError("Access denied. User privileges required.", 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  // Helper method to clear authentication cookies
  private clearAuthCookies = (res: Response): void => {
    const clearOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: (process.env.NODE_ENV === "production" ? "none" : "strict") as
        | "none"
        | "strict",
    };

    res.clearCookie("accessToken", clearOptions);
    res.clearCookie("refreshToken", clearOptions);
  };
}

export default AuthMiddleware;
