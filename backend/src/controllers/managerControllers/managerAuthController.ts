import { Request, Response, NextFunction } from "express";
import AppError from "../../utils/appError";
import AuthService from "../../services/authService";

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

  register = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        throw new AppError("Name, email and password are required", 400);
      }

      if (name.trim().length < 5) {
        throw new AppError("Name must be at least 5 characters long", 400);
      }

      const nameParts = name.trim().split(/\s+/);

      const emailRegex = /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        throw new AppError(
          "Please provide a valid professional email address",
          400,
        );
      }

      this.validatePasswordStrength(password);

      const existingUser = await this.authService.findUserByEmail(email);
      if (existingUser) {
        throw new AppError("User with this email already exists", 409);
      }

      const user = await this.authService.registerManager({
        name,
        email,
        password,
      });

      res.status(201).json({
        success: true,
        message:
          "Manager registration successful! Please login with your credentials.",
      });
    } catch (error) {
      next(error);
    }
  };

  private validatePasswordStrength(password: string): void {
    const errors = [];

    if (password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[@$!%*?&]/.test(password)) {
      errors.push(
        "Password must contain at least one special character (@$!%*?&)",
      );
    }

    if (errors.length > 0) {
      throw new AppError(errors.join(". "), 400);
    }
  }

  login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError("Email and password are required", 400);
      }

      const result = await this.authService.loginManager({ email, password });

      res.cookie(
        "accessToken",
        result.tokens.accessToken,
        getCookieOptions(15 * 60 * 1000),
      );
      res.cookie(
        "refreshToken",
        result.tokens.refreshToken,
        getCookieOptions(7 * 24 * 60 * 60 * 1000),
      );

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

  logout = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
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
}

export default ManagerAuthController;
