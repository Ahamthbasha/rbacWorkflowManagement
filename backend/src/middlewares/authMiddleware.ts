
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

  authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      let accessToken = req.cookies?.accessToken;
      let refreshToken = req.cookies?.refreshToken;

      if (!accessToken && !refreshToken) {
        throw new AppError("No authentication tokens provided", 401);
      }

      if (accessToken) {
        try {
          const payload = this.jwtService.verifyAccessToken(accessToken);

          const user = await User.findByPk(payload.userId);

          if (!user || !user.isActive) {
            throw new AppError("User not found or inactive", 401);
          }

          req.user = {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
          };

          return next();
        } catch (accessTokenError) {
        }
      }

      if (refreshToken) {
        try {
          const refreshPayload =
            this.jwtService.verifyRefreshToken(refreshToken);

          const user = await User.findByPk(refreshPayload.userId);

          if (!user || !user.isActive) {
            this.clearAuthCookies(res);
            throw new AppError("User not found or inactive", 401);
          }

          const newAccessToken = this.jwtService.generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
          });

          res.cookie(
            "accessToken",
            newAccessToken,
            getCookieOptions(15 * 60 * 1000),
          );

          req.user = {
            userId: user.id,
            email: user.email,
            role: user.role,
          };

          return next();
        } catch (refreshTokenError) {
          this.clearAuthCookies(res);
          throw new AppError("Session expired. Please login again.", 401);
        }
      }

      throw new AppError("Authentication required", 401);
    } catch (error) {
      next(error);
    }
  };

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