// controllers/adminAuthController.ts
import { Request, Response, NextFunction } from 'express';
import AppError from '../../utils/appError';
import { JwtService } from '../../services/jwtService';

// Helper function for consistent cookie options
const getCookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'strict') as 'none' | 'strict',
  maxAge,
});

export class AdminAuthController {
  constructor(private jwtService: JwtService) {}

  // Admin login - checks credentials from .env
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        throw new AppError('Email and password are required', 400);
      }

      // Get admin credentials from environment variables
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;

      // Check if admin credentials are configured
      if (!adminEmail || !adminPassword) {
        console.error('Admin credentials not configured in .env file');
        throw new AppError('Admin configuration error', 500);
      }

      // Validate admin credentials
      if (email !== adminEmail) {
        throw new AppError('Invalid admin email or password', 401);
      }

      if (password !== adminPassword) {
        throw new AppError('Invalid admin email or password', 401);
      }

      // Generate tokens for admin
      const tokens = this.jwtService.generateTokenPair({
        userId: 'admin',
        email: adminEmail,
        role: 'admin',
      });

      // Set auth tokens in HTTP-only cookies
      res.cookie('adminAccessToken', tokens.accessToken, getCookieOptions(15 * 60 * 1000)); // 15 minutes
      res.cookie('adminRefreshToken', tokens.refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000)); // 7 days

      res.status(200).json({
        success: true,
        message: 'Admin login successful',
        data: {
          admin: {
            id: 'admin',
            email: adminEmail,
            role: 'admin',
            name: 'Administrator',
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Admin logout
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Clear all admin auth cookies
      const clearOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'strict') as 'none' | 'strict',
      };

      res.clearCookie('adminAccessToken', clearOptions);
      res.clearCookie('adminRefreshToken', clearOptions);

      res.status(200).json({
        success: true,
        message: 'Admin logout successful',
      });
    } catch (error) {
      next(error);
    }
  };

  // Get current admin
  getCurrentAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      
      if (!user || user.role !== 'admin') {
        throw new AppError('Admin not authenticated', 401);
      }

      res.status(200).json({
        success: true,
        data: {
          id: 'admin',
          email: process.env.ADMIN_EMAIL,
          role: 'admin',
          name: 'Administrator',
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AdminAuthController;