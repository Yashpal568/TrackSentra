import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { AuditLog } from '../models/AuditLog';

const generateTokens = (user: IUser) => {
  const accessToken = jwt.sign(
    { userId: user._id, companyId: user.companyId, role: user.role },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user._id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const ipAddress = req.ip || req.socket.remoteAddress;

  try {
    const user = await User.findOne({ email }).select('+passwordHash');
    
    if (!user || user.status !== 'active') {
      res.status(401).json({ error: { message: 'Invalid credentials or inactive account' } });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!isMatch) {
      await AuditLog.create({
        companyId: user.companyId,
        userId: user._id,
        action: 'LOGIN_FAILED',
        resource: 'Authentication',
        ipAddress,
        userAgent: req.get('User-Agent'),
      });
      res.status(401).json({ error: { message: 'Invalid credentials or inactive account' } });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    await AuditLog.create({
      companyId: user.companyId,
      userId: user._id,
      action: 'LOGIN_SUCCESS',
      resource: 'Authentication',
      ipAddress,
      userAgent: req.get('User-Agent'),
    });

    // Set secure HTTP-only cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const userObj = user.toObject();
    delete (userObj as any).passwordHash;

    res.json({ message: 'Login successful', user: userObj, accessToken });
  } catch (error) {
    console.error('Login error', error);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.refreshToken;
  
  if (token) {
    await RefreshToken.findOneAndUpdate({ token }, { revokedAt: new Date() });
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });

  res.json({ message: 'Logged out successfully' });
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const incomingToken = req.cookies?.refreshToken;

  if (!incomingToken) {
    res.status(401).json({ error: { message: 'No refresh token provided' } });
    return;
  }

  try {
    const decoded = jwt.verify(
      incomingToken, 
      process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret'
    ) as { userId: string };

    const tokenDoc = await RefreshToken.findOne({ token: incomingToken });

    // Reuse detection
    if (!tokenDoc || tokenDoc.revokedAt) {
      if (tokenDoc?.revokedAt) {
        // Suspected token theft, revoke all tokens for this user
        await RefreshToken.updateMany({ userId: decoded.userId }, { revokedAt: new Date() });
        console.warn(`Token reuse detected for user ${decoded.userId}`);
      }
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
      res.status(401).json({ error: { message: 'Invalid refresh token' } });
      return;
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'active') {
      res.status(401).json({ error: { message: 'Invalid or inactive user' } });
      return;
    }

    // Rotate token
    tokenDoc.revokedAt = new Date();
    const { accessToken, refreshToken } = generateTokens(user);
    tokenDoc.replacedByToken = refreshToken;
    await tokenDoc.save();

    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ error: { message: 'Invalid refresh token' } });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  res.json({ user: (req as any).user });
};

// Mock forgot/reset for M02
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  res.json({ message: 'If the email exists, a reset link will be sent.' });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  res.json({ message: 'Password reset successful' });
};
