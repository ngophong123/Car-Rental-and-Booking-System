import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../prisma';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.util';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email already exists', data: null });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'CUSTOMER'
      }
    });

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshTokenStr = generateRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        token: refreshTokenStr,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    res.cookie('refreshToken', refreshTokenStr, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        accessToken
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password', data: null });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password', data: null });
      return;
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshTokenStr = generateRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        token: refreshTokenStr,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    res.cookie('refreshToken', refreshTokenStr, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        accessToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshTokenStr = req.cookies.refreshToken;
    if (!refreshTokenStr) {
      res.status(401).json({ success: false, message: 'Refresh token not found', data: null });
      return;
    }

    const tokenRecord = await prisma.refreshToken.findUnique({ where: { token: refreshTokenStr } });
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      if (tokenRecord) {
        await prisma.refreshToken.delete({ where: { token: refreshTokenStr } });
      }
      res.status(401).json({ success: false, message: 'Invalid or expired refresh token', data: null });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: tokenRecord.userId } });
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found', data: null });
      return;
    }

    const accessToken = generateAccessToken(user.id, user.role);
    res.status(200).json({
      success: true,
      message: 'Token refreshed',
      data: { accessToken }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshTokenStr = req.cookies.refreshToken;
    if (refreshTokenStr) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshTokenStr } });
    }
    
    res.clearCookie('refreshToken');
    res.status(200).json({ success: true, message: 'Logged out successfully', data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user will be populated by auth.middleware.ts
    const userId = (req as any).user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true, role: true } });
    
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found', data: null });
      return;
    }

    res.status(200).json({ success: true, message: 'User data retrieved', data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};
