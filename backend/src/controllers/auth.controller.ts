import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser, UserRole } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { AuditLog } from '../models/AuditLog';
import crypto from 'crypto';
import { VerificationToken, TokenType } from '../models/VerificationToken';
import { sendEmail } from '../utils/email';
import { NotificationService } from '../services/notification.service';

import { Company } from '../models/Company';
import { Plan } from '../models/Plan';
import { Subscription, SubscriptionStatus } from '../models/Subscription';

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

export const register = async (req: Request, res: Response): Promise<void> => {
  const { companyName, firstName, lastName, email, password, planId } = req.body;
  const ipAddress = req.ip || req.socket.remoteAddress;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: { message: 'Email already in use' } });
      return;
    }

    const session = await User.startSession();
    session.startTransaction();

    try {
      const company = new Company({ name: companyName });
      await company.save({ session });
      
      const passwordHash = await bcrypt.hash(password, 10);
      
      const user = new User({
        companyId: company._id,
        firstName,
        lastName,
        email,
        passwordHash,
        role: 'COMPANY_ADMIN',
      });
      await user.save({ session });

      if (planId) {
        const plan = await Plan.findById(planId).session(session);
        if (plan && plan.visibility === 'public') {
          const subscription = new Subscription({
            companyId: company._id,
            planId: plan._id,
            status: SubscriptionStatus.PENDING_PAYMENT,
            planSnapshot: {
              name: plan.name,
              price: plan.price,
              currency: plan.currency,
              billingInterval: plan.billingInterval,
              limits: plan.limits
            }
          });
          await subscription.save({ session });
        }
      }

      const audit = new AuditLog({
        companyId: company._id,
        userId: user._id,
        action: 'CUSTOMER_REGISTRATION',
        resource: 'Authentication',
        ipAddress,
      });
      await audit.save({ session });

      await session.commitTransaction();

      await session.commitTransaction();

      // M17: Email Verification
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = await bcrypt.hash(rawToken, 10);
      await VerificationToken.create({
        userId: user._id,
        tokenHash,
        type: TokenType.VERIFY_EMAIL,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
      
      const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${rawToken}&email=${encodeURIComponent(user.email)}`;
      await sendEmail(
        user.email,
        'Verify your TrackSentra Account',
        `Please verify your email by clicking the following link:\n\n${verifyUrl}`
      );

      // Notify Super Admins
      await NotificationService.notifySuperAdmins({
        type: 'NEW_COMPANY_REGISTRATION',
        title: 'New Company Registered',
        message: `${company.name} has just registered on the platform.`,
        severity: 'INFO',
        entityType: 'System'
      });

      const { accessToken, refreshToken } = generateTokens(user);

      await RefreshToken.create({
        userId: user._id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      res.cookie('accessToken', accessToken, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/api/auth/refresh', maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const userObj = user.toObject();
      delete (userObj as any).passwordHash;
      if (planId) {
        (userObj as any).subscription = { status: SubscriptionStatus.PENDING_PAYMENT, planId };
      }
      res.status(201).json({ message: 'Registration successful', user: userObj, accessToken });
    } catch (err: any) {
      await session.abortTransaction();
      res.status(400).json({ error: { message: err.message } });
    } finally {
      session.endSession();
    }
  } catch (error) {
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
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
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const userObj = user.toObject();
    delete (userObj as any).passwordHash;
    const sub = await Subscription.findOne({ companyId: user.companyId });
    if (sub) (userObj as any).subscription = { status: sub.status, planId: sub.planId };

    res.json({ message: 'Login successful', user: userObj, accessToken });
  } catch (error) {
    console.error('Login error', error);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

export const demoLogin = async (req: Request, res: Response): Promise<void> => {
  const ipAddress = req.ip || req.socket.remoteAddress;
  try {
    let demoUser = await User.findOne({ email: 'demo@tracksentra.com', isDemoUser: true });
    
    // Seed demo environment on the fly if it doesn't exist
    if (!demoUser) {
      const company = await Company.create({ name: 'TrackSentra Demo Corp' });
      const passwordHash = await bcrypt.hash('demo123!', 10);
      demoUser = await User.create({
        companyId: company._id,
        firstName: 'Demo',
        lastName: 'Admin',
        email: 'demo@tracksentra.com',
        passwordHash,
        role: UserRole.COMPANY_ADMIN,
        isDemoUser: true,
        status: 'active',
        isEmailVerified: true
      });
      
      // We can run an external seeder asynchronously here if we want more data
      try {
        const { exec } = require('child_process');
        exec(`npx ts-node src/scripts/seedDemoData.ts ${company._id.toString()}`);
      } catch (e) {
        console.error('Failed to trigger demo seeder', e);
      }
    }

    const { accessToken, refreshToken } = generateTokens(demoUser);

    await RefreshToken.create({
      userId: demoUser._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/api/auth/refresh', maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userObj = demoUser.toObject();
    delete (userObj as any).passwordHash;
    const sub = await Subscription.findOne({ companyId: demoUser.companyId });
    if (sub) (userObj as any).subscription = { status: sub.status, planId: sub.planId };

    res.json({ message: 'Welcome to the Demo', user: userObj, accessToken });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to start demo' } });
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
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ error: { message: 'Invalid refresh token' } });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (user.isDemoUser) {
      res.status(403).json({ error: { message: 'Write operations are disabled in demo mode.' } });
      return;
    }

    const { firstName, lastName, phone, timezone, language } = req.body;
    
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    
    if (phone !== undefined) user.phone = phone;
    if (timezone !== undefined) user.timezone = timezone;
    if (language !== undefined) user.language = language;

    await user.save();

    await AuditLog.create({
      companyId: user.companyId,
      userId: user._id,
      action: 'UPDATE_PROFILE',
      resource: 'User',
      details: 'Updated profile information'
    });

    const userObj = user.toObject();
    delete (userObj as any).passwordHash;
    const sub = await Subscription.findOne({ companyId: user.companyId });
    if (sub) userObj.subscription = { status: sub.status, planId: sub.planId };
    if (user.companyId) {
      const company = await Company.findById(user.companyId).select('name');
      if (company) userObj.companyName = company.name;
    }

    res.json({
      message: 'Profile updated successfully',
      user: userObj
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: { message: 'Failed to update profile' } });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const userObj = (req as any).user.toObject();
  const sub = await Subscription.findOne({ companyId: userObj.companyId });
  if (sub) userObj.subscription = { status: sub.status, planId: sub.planId };
  if (userObj.companyId) {
     const company = await Company.findById(userObj.companyId).select('name');
     if (company) userObj.companyName = company.name;
  }
  res.json({ user: userObj });
};

export const getSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const tokens = await RefreshToken.find({ userId: user._id, revokedAt: { $exists: false } }).sort({ createdAt: -1 });
    
    res.json({
      sessions: tokens.map(t => ({
        id: t._id,
        createdAt: t.createdAt,
        expiresAt: t.expiresAt,
        isActive: t.isActive,
        isExpired: t.isExpired
      }))
    });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch sessions' } });
  }
};

export const revokeSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (user.isDemoUser) {
      res.status(403).json({ error: { message: 'Write operations are disabled in demo mode.' } });
      return;
    }
    const token = await RefreshToken.findOne({ _id: req.params.id, userId: user._id });
    if (!token) {
      res.status(404).json({ error: { message: 'Session not found' } });
      return;
    }
    
    token.revokedAt = new Date();
    await token.save();
    
    await AuditLog.create({
      companyId: user.companyId,
      userId: user._id,
      action: 'REVOKE_SESSION',
      resource: 'User',
      details: 'Revoked a session'
    });

    res.json({ message: 'Session revoked' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to revoke session' } });
  }
};

// M17 Workflows
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { email, token } = req.body;
  if (!email || !token) {
    res.status(400).json({ error: { message: 'Email and token required' } });
    return;
  }
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ error: { message: 'Invalid or expired token' } });
      return;
    }

    const tokenDoc = await VerificationToken.findOne({
      userId: user._id,
      type: TokenType.VERIFY_EMAIL,
      usedAt: { $exists: false },
      expiresAt: { $gt: new Date() }
    });

    if (!tokenDoc) {
      res.status(400).json({ error: { message: 'Invalid or expired token' } });
      return;
    }

    const isValid = await bcrypt.compare(token, tokenDoc.tokenHash);
    if (!isValid) {
      res.status(400).json({ error: { message: 'Invalid or expired token' } });
      return;
    }

    tokenDoc.usedAt = new Date();
    await tokenDoc.save();

    user.isEmailVerified = true;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

export const resendVerification = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  // Always return generic response
  res.json({ message: 'If an account exists, a verification email has been sent.' });

  try {
    const user = await User.findOne({ email });
    if (!user || user.isEmailVerified) return;

    // Rate limit: check if a token was created recently
    const recentToken = await VerificationToken.findOne({
      userId: user._id,
      type: TokenType.VERIFY_EMAIL,
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) } // 1 minute
    });
    if (recentToken) return;

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(rawToken, 10);
    await VerificationToken.create({
      userId: user._id,
      tokenHash,
      type: TokenType.VERIFY_EMAIL,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${rawToken}&email=${encodeURIComponent(user.email)}`;
    await sendEmail(
      user.email,
      'Verify your TrackSentra Account',
      `Please verify your email by clicking the following link:\n\n${verifyUrl}`
    );
  } catch (error) {
    console.error(error);
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  res.json({ message: 'If the email exists, a reset link will be sent.' });

  try {
    const user = await User.findOne({ email });
    if (!user) return;

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(rawToken, 10);
    
    await VerificationToken.create({
      userId: user._id,
      tokenHash,
      type: TokenType.RESET_PASSWORD,
      expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;
    await sendEmail(
      user.email,
      'Reset your TrackSentra Password',
      `You requested a password reset. Click the link to set a new password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`
    );
  } catch (error) {
    console.error(error);
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) {
    res.status(400).json({ error: { message: 'Email, token, and new password are required' } });
    return;
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ error: { message: 'Invalid or expired token' } });
      return;
    }

    const tokenDoc = await VerificationToken.findOne({
      userId: user._id,
      type: TokenType.RESET_PASSWORD,
      usedAt: { $exists: false },
      expiresAt: { $gt: new Date() }
    });

    if (!tokenDoc) {
      res.status(400).json({ error: { message: 'Invalid or expired token' } });
      return;
    }

    const isValid = await bcrypt.compare(token, tokenDoc.tokenHash);
    if (!isValid) {
      res.status(400).json({ error: { message: 'Invalid or expired token' } });
      return;
    }

    tokenDoc.usedAt = new Date();
    await tokenDoc.save();

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Invalidate all existing sessions
    await RefreshToken.updateMany({ userId: user._id }, { revokedAt: new Date() });

    res.json({ message: 'Password reset successful. Please log in.' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

export const activateGuard = async (req: Request, res: Response): Promise<void> => {
  const { email, token, password } = req.body;
  if (!email || !token || !password) {
    res.status(400).json({ error: { message: 'Email, token, and password are required' } });
    return;
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ error: { message: 'Invalid or expired token' } });
      return;
    }

    const tokenDoc = await VerificationToken.findOne({
      userId: user._id,
      type: TokenType.GUARD_ACTIVATION,
      usedAt: { $exists: false },
      expiresAt: { $gt: new Date() }
    });

    if (!tokenDoc) {
      res.status(400).json({ error: { message: 'Invalid or expired token' } });
      return;
    }

    const isValid = await bcrypt.compare(token, tokenDoc.tokenHash);
    if (!isValid) {
      res.status(400).json({ error: { message: 'Invalid or expired token' } });
      return;
    }

    tokenDoc.usedAt = new Date();
    await tokenDoc.save();

    user.passwordHash = await bcrypt.hash(password, 10);
    user.status = 'active'; // Activate user
    user.isEmailVerified = true;
    await user.save();

    // Activate guard record
    const { Guard } = require('../models/Guard');
    const guard = await Guard.findOne({ userId: user._id });
    if (guard) {
      guard.status = 'active';
      await guard.save();
    }

    res.json({ message: 'Account activated successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};
