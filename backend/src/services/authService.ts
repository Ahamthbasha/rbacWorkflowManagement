// services/authService.ts
import User, { UserRole } from '../models/userModel';
import { JwtService, IRegistrationPayload, ITokenPair } from './jwtService';
import AppError from '../utils/appError';
import { Op } from 'sequelize';

export interface IRegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface ILoginDTO {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  };
  tokens: ITokenPair;
}

export interface IManagerRegisterDTO {
  name: string;
  email: string;
  password: string;
  department?: string;
}

export class AuthService {
  constructor(private jwtService: JwtService) {}

  // Direct registration without OTP
  async register(data: IRegisterDTO): Promise<IAuthResponse> {
    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: { email: data.email } 
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Create user directly
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
      isActive: true,  // User is active immediately
      isVerified: true, // Mark as verified since no OTP needed
      role: UserRole.USER, // Default role is USER
    });

    // Generate tokens
    const tokens = this.jwtService.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
      tokens,
    };
  }

  // Login user
  async login(data: ILoginDTO): Promise<IAuthResponse> {
    const user = await User.findOne({
      where: { email: data.email },
      attributes: { include: ['password'] },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Your account is deactivated. Please contact admin.', 403);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const tokens = this.jwtService.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
      tokens,
    };
  }

  // Get current user
  async getCurrentUser(userId: string): Promise<User> {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    return user;
  }

  // Refresh token
  async refreshToken(userId: string): Promise<ITokenPair> {
    const user = await User.findByPk(userId);
    
    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    const tokens = this.jwtService.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return tokens;
  }

  // Search users
  async searchUsers(query: string, excludeUserId: string): Promise<Partial<User>[]> {
    if (!query || query.length < 2) return [];

    const users = await User.findAll({
      where: {
        id: { [Op.ne]: excludeUserId },
        isActive: true,
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { email: { [Op.like]: `%${query}%` } },
        ],
      },
      attributes: ['id', 'name', 'email', 'role'],
      limit: 10,
    });

    return users;
  }

  // Get all active users
  async getAllActiveUsers(excludeUserId: string): Promise<Partial<User>[]> {
    const users = await User.findAll({
      where: {
        id: { [Op.ne]: excludeUserId },
        isActive: true,
      },
      attributes: ['id', 'name', 'email', 'role'],
      limit: 50,
    });

    return users;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } });
  }

  // Add this method to register manager
  async registerManager(data: IManagerRegisterDTO): Promise<User> {
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
      department: data.department || null,
      isActive: true,
      isVerified: true,
      role: UserRole.MANAGER,
    });

    return user;
  }

  // Add this method to generate tokens for a user
  generateUserTokens(user: User): ITokenPair {
    return this.jwtService.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  }

  // Add this method for manager login
  async loginManager(data: ILoginDTO): Promise<IAuthResponse> {
    const user = await User.findOne({
      where: { email: data.email },
      attributes: { include: ['password'] },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if user is a manager
    if (user.role !== UserRole.MANAGER) {
      throw new AppError('Access denied. Manager privileges required.', 403);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Your account is deactivated. Please contact admin.', 403);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const tokens = this.jwtService.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
      tokens,
    };
  }

}

export default AuthService;