import { Request, Response, NextFunction } from "express";
import AppError from "../../utils/appError";
import { JwtService } from "../../services/jwtService";
import User, { UserRole } from "../../models/userModel";

const getCookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "strict") as
    | "none"
    | "strict",
  maxAge,
});

export class AdminAuthController {
  constructor(private jwtService: JwtService) {}

  static async initializeAdmin(): Promise<void> {
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminEmail || !adminPassword) {
        console.error("Admin credentials not configured in .env file");
        return;
      }

      const existingAdmin = await User.findOne({
        where: { email: adminEmail, role: UserRole.ADMIN },
      });

      if (!existingAdmin) {
        await User.create({
          name: "Administrator",
          email: adminEmail,
          password: adminPassword,
          role: UserRole.ADMIN,
          isActive: true,
          isVerified: true,
        });
        console.log("Admin user created successfully");
      } else {
        await existingAdmin.update({ password: adminPassword });
        console.log("Admin user already exists — password synced from .env");
      }
    } catch (error) {
      console.error("Error initializing admin:", error);
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

      const admin = await User.findOne({
        where: { email, role: UserRole.ADMIN },
      });

      if (!admin) {
        throw new AppError("Invalid admin credentials", 401);
      }

      if (!admin.isActive) {
        throw new AppError("Admin account is deactivated", 403);
      }
      const isPasswordValid = await admin.comparePassword(password);
      if (!isPasswordValid) {
        throw new AppError("Invalid admin credentials", 401);
      }

      const tokens = this.jwtService.generateTokenPair({
        userId: admin.id,
        email: admin.email,
        role: admin.role,
      });

      res.cookie(
        "accessToken",
        tokens.accessToken,
        getCookieOptions(15 * 60 * 1000),
      );
      res.cookie(
        "refreshToken",
        tokens.refreshToken,
        getCookieOptions(7 * 24 * 60 * 60 * 1000),
      );

      res.status(200).json({
        success: true,
        message: "Admin login successful",
        data: {
          admin: {
            id: admin.id,
            email: admin.email,
            role: admin.role,
            name: admin.name,
          },
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
        message: "Admin logout successful",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AdminAuthController;
