// controllers/adminAuthController.ts
import { Request, Response, NextFunction } from "express";
import AppError from "../../utils/appError";
import { JwtService } from "../../services/jwtService";
import User, { UserRole } from "../../models/userModel";
import bcrypt from "bcryptjs";

// Helper function for consistent cookie options
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
        // Don't hash here — beforeCreate hook handles it
        await User.create({
          name: "Administrator",
          email: adminEmail,
          password: adminPassword, // plain text — hook will hash it
          role: UserRole.ADMIN,
          isActive: true,
          isVerified: true,
          department: "System Administration",
        });
        console.log("✅ Admin user created successfully");
      } else {
        // Don't hash here — beforeUpdate hook handles it when password changes
        await existingAdmin.update({ password: adminPassword }); // plain text
        console.log("✅ Admin user already exists — password synced from .env");
      }
    } catch (error) {
      console.error("Error initializing admin:", error);
    }
  }

  // Admin login - checks credentials from database
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

      // Find admin in database
      const admin = await User.findOne({
        where: { email, role: UserRole.ADMIN },
      });

      if (!admin) {
        throw new AppError("Invalid admin credentials", 401);
      }

      // Check if admin is active
      if (!admin.isActive) {
        throw new AppError("Admin account is deactivated", 403);
      }
      console.log("adminPassword", password);

      // Verify password
      const isPasswordValid = await admin.comparePassword(password);
      if (!isPasswordValid) {
        throw new AppError("Invalid admin credentials", 401);
      }

      // Generate tokens for admin
      const tokens = this.jwtService.generateTokenPair({
        userId: admin.id,
        email: admin.email,
        role: admin.role,
      });

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

  // Admin logout
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
        message: "Admin logout successful",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AdminAuthController;
