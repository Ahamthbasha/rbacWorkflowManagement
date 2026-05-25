import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export interface IJwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface IRegistrationPayload {
  name: string;
  email: string;
  password: string;
  timestamp: number;
}

export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
}

export class JwtService {
  private accessSecret: Secret;
  private refreshSecret: Secret;
  private registrationSecret: Secret;
  private accessExpiry: string;
  private refreshExpiry: string;
  private registrationExpiry: string;

  constructor() {
    this.accessSecret = this.getRequiredEnv('JWT_ACCESS_SECRET');
    this.refreshSecret = this.getRequiredEnv('JWT_REFRESH_SECRET');
    this.registrationSecret = this.getRequiredEnv('JWT_REGISTRATION_SECRET') || this.accessSecret;
    this.accessExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
    this.refreshExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
    this.registrationExpiry = process.env.JWT_REGISTRATION_EXPIRY || '10m';
  }

  private getRequiredEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  generateAccessToken(payload: IJwtPayload): string {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: this.accessExpiry,
    } as SignOptions);
  }

  generateRefreshToken(payload: IJwtPayload): string {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiry,
    } as SignOptions);
  }

  generateTokenPair(payload: IJwtPayload): ITokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  verifyAccessToken(token: string): IJwtPayload {
    try {
      const decoded = jwt.verify(token, this.accessSecret);
      
      if (
        typeof decoded === 'string' ||
        !decoded.userId ||
        !decoded.email ||
        !decoded.role
      ) {
        throw new Error('Invalid token payload');
      }
      
      return decoded as IJwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  verifyRefreshToken(token: string): IJwtPayload {
    try {
      const decoded = jwt.verify(token, this.refreshSecret);
      
      if (
        typeof decoded === 'string' ||
        !decoded.userId ||
        !decoded.email ||
        !decoded.role
      ) {
        throw new Error('Invalid token payload');
      }
      
      return decoded as IJwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  generateRegistrationToken(payload: IRegistrationPayload): string {
    return jwt.sign(payload, this.registrationSecret, {
      expiresIn: this.registrationExpiry,
    } as SignOptions);
  }

  verifyRegistrationToken(token: string): IRegistrationPayload {
    try {
      const decoded = jwt.verify(token, this.registrationSecret);
      
      if (
        typeof decoded === 'string' ||
        !decoded.name ||
        !decoded.email ||
        !decoded.password ||
        !decoded.timestamp
      ) {
        throw new Error('Invalid registration token');
      }
      
      return decoded as IRegistrationPayload;
    } catch (error) {
      throw new Error('Registration session expired. Please register again.');
    }
  }
}

export default JwtService;