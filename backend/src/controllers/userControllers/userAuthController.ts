// controllers/userAuthController.ts
import { Request, Response, NextFunction } from 'express';
import AppError from '../../utils/appError';
import AuthService from '../../services/authService';

// Helper function for consistent cookie options
const getCookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'strict') as 'none' | 'strict',
  maxAge,
});

export class UserAuthController {
  constructor(private authService: AuthService) {}

  // Direct registration (no OTP) - sets role as USER by default
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      // Validate required fields
      if (!name || !email || !password) {
        throw new AppError('Name, email and password are required', 400);
      }

      // Validate email format
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        throw new AppError('Please provide a valid email address', 400);
      }

      // Validate password strength
      if (password.length < 6) {
        throw new AppError('Password must be at least 6 characters long', 400);
      }

      const result = await this.authService.register({ name, email, password });

      // Set auth tokens in HTTP-only cookies
      res.cookie('accessToken', result.tokens.accessToken, getCookieOptions(15 * 60 * 1000)); // 15 minutes
      res.cookie('refreshToken', result.tokens.refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000)); // 7 days

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Login
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        throw new AppError('Email and password are required', 400);
      }

      const result = await this.authService.login({ email, password });

      // Set auth tokens in HTTP-only cookies
      res.cookie('accessToken', result.tokens.accessToken, getCookieOptions(15 * 60 * 1000)); // 15 minutes
      res.cookie('refreshToken', result.tokens.refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000)); // 7 days

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Logout
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Clear all auth cookies
      const clearOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'strict') as 'none' | 'strict',
      };

      res.clearCookie('accessToken', clearOptions);
      res.clearCookie('refreshToken', clearOptions);

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  };

  // Get current user
  getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const user = await this.authService.getCurrentUser(userId);

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

export default UserAuthController;