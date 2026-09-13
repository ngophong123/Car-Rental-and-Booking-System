import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../prisma';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.util';

// Helper for strict, secure HTTP-only cookies
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Địa chỉ email đã được sử dụng', data: null });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

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

    res.cookie('refreshToken', refreshTokenStr, getCookieOptions());

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      data: {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        accessToken
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi đăng ký', data: null });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác', data: null });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác', data: null });
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

    res.cookie('refreshToken', refreshTokenStr, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        accessToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi đăng nhập', data: null });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshTokenStr = req.cookies?.refreshToken;
    if (!refreshTokenStr) {
      res.status(401).json({ success: false, message: 'Không tìm thấy phiên làm việc hợp lệ', data: null });
      return;
    }

    // Refresh Token Rotation (RTR): atomically verify, delete old token, and issue new token
    const result = await prisma.$transaction(async (tx) => {
      const tokenRecord = await tx.refreshToken.findUnique({ 
        where: { token: refreshTokenStr },
        include: { user: true }
      });

      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        if (tokenRecord) {
          await tx.refreshToken.delete({ where: { token: refreshTokenStr } });
        }
        return null;
      }

      // Delete the used refresh token (prevent replay)
      await tx.refreshToken.delete({ where: { token: refreshTokenStr } });

      // Generate new token pair
      const newAccessToken = generateAccessToken(tokenRecord.user.id, tokenRecord.user.role);
      const newRefreshToken = generateRefreshToken(tokenRecord.user.id);

      await tx.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: tokenRecord.user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      return { newAccessToken, newRefreshToken };
    });

    if (!result) {
      res.clearCookie('refreshToken', getCookieOptions());
      res.status(401).json({ success: false, message: 'Phiên làm việc đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.', data: null });
      return;
    }

    res.cookie('refreshToken', result.newRefreshToken, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Làm mới phiên thành công',
      data: { accessToken: result.newAccessToken }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi làm mới phiên', data: null });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshTokenStr = req.cookies?.refreshToken;
    if (refreshTokenStr) {
      try {
        await prisma.refreshToken.deleteMany({ where: { token: refreshTokenStr } });
      } catch (e) {
        // Ignore deletion error if already deleted
      }
    }
    
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    
    res.status(200).json({ success: true, message: 'Đăng xuất thành công', data: null });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi đăng xuất', data: null });
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const user = await prisma.user.findUnique({ 
      where: { id: userId }, 
      select: { id: true, email: true, name: true, role: true } 
    });
    
    if (!user) {
      res.status(404).json({ success: false, message: 'Không tìm thấy người dùng', data: null });
      return;
    }

    res.status(200).json({ success: true, message: 'User data retrieved', data: { user } });
  } catch (error) {
    console.error('Me endpoint error:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: null });
  }
};
