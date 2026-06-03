
import User, { UserRole } from "../models/userModel";
import { JwtService, ITokenPair } from "./jwtService";
import AppError from "../utils/appError";
import { Op } from "sequelize";

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
}

export class AuthService {
  constructor(private jwtService: JwtService) {}

  private validatePasswordStrength(password: string): void {
  const errors = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  if (errors.length > 0) {
    throw new AppError(errors.join('. '), 400);
  }
}

async register(data: IRegisterDTO): Promise<void> {
  if (!data.name || data.name.trim().length < 5) {
    throw new AppError('Name must be at least 5 characters long', 400);
  }
  
  const nameParts = data.name.trim().split(/\s+/);
  
  if (!/^[A-Za-z\s]+$/.test(data.name)) {
    throw new AppError('Name can only contain letters and spaces', 400);
  }
  
  if (data.name.includes('  ')) {
    throw new AppError('Name cannot have multiple consecutive spaces', 400);
  }
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  if (!emailRegex.test(data.email)) {
    throw new AppError('Please provide a valid professional email address', 400);
  }
  
  this.validatePasswordStrength(data.password);
  
  const existingUser = await User.findOne({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError("User with this email already exists", 409);
  }

  await User.create({
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    password: data.password,
    isActive: true,
    isVerified: true,
    role: UserRole.USER,
  });
  
}

  async login(data: ILoginDTO): Promise<IAuthResponse> {
    const user = await User.findOne({
      where: { email: data.email },
      attributes: { include: ["password"] },
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    if (!user.isActive) {
      throw new AppError(
        "Your account is deactivated. Please contact admin.",
        403,
      );
    }

    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

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

  async getCurrentUser(userId: string): Promise<User> {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }

  async refreshToken(userId: string): Promise<ITokenPair> {
    const user = await User.findByPk(userId);

    if (!user || !user.isActive) {
      throw new AppError("User not found or inactive", 401);
    }

    const tokens = this.jwtService.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return tokens;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } });
  }

  async registerManager(data: IManagerRegisterDTO): Promise<User> {
  // Validate name
  if (!data.name || data.name.trim().length < 5) {
    throw new AppError('Name must be at least 5 characters long', 400);
  }
  
  // Check for full name
  const nameParts = data.name.trim().split(/\s+/);
  // Validate email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  if (!emailRegex.test(data.email)) {
    throw new AppError('Please provide a valid professional email address', 400);
  }
  
  // Validate password strength
  this.validatePasswordStrength(data.password);
  
  const user = await User.create({
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    password: data.password,
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
      attributes: { include: ["password"] },
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Check if user is a manager
    if (user.role !== UserRole.MANAGER) {
      throw new AppError("Access denied. Manager privileges required.", 403);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError(
        "Your account is deactivated. Please contact admin.",
        403,
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
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
