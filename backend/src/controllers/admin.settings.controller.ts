import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../prisma';
import { logAudit } from '../utils/audit.util';

// Default system settings for Minh Khoa Car Rental
const DEFAULT_SETTINGS = {
  general: {
    companyName: 'Minh Khoa – Car Rental & Travel',
    logo: '/images/logo.png',
    websiteTitle: 'Minh Khoa | Cho Thuê Xe Tự Lái & Có Tài Xế Chuyên Nghiệp',
    websiteDescription: 'Dịch vụ cho thuê xe ô tô 4 - 45 chỗ đời mới, giao xe tận nơi, thủ tục đơn giản, uy tín hàng đầu.',
    hotline: '0988 888 888',
    email: 'contact@minhkhoa.com',
    address: 'Số 68 Đường Cầu Giấy, Quận Cầu Giấy, Hà Nội',
    workingHours: '06:00 - 23:00 (Hàng ngày, kể cả Lễ Tết)',
  },
  contact: {
    hotline: '0988 888 888',
    email: 'support@minhkhoa.com',
    facebook: 'https://facebook.com/minhkhoacarrental',
    zalo: 'https://zalo.me/0988888888',
    googleMaps: 'https://maps.google.com/?q=Hanoi',
    address: 'Số 68 Đường Cầu Giấy, Hà Nội',
  },
  booking: {
    minBookingDurationDays: 1,
    maxBookingDurationDays: 30,
    advanceBookingDays: 90,
    cancellationPolicy: 'Miễn phí hủy chuyến trước 24 giờ nhận xe. Hủy trong vòng 24h tính phí 30% giá trị hợp đồng.',
    lateReturnPolicyHourlyFee: 100000,
    requireAdminApproval: true,
    allowSelfDrive: true,
    allowDriverService: true,
  },
  payment: {
    cashEnabled: true,
    bankTransferEnabled: true,
    cardEnabled: false,
    eWalletEnabled: false,
    bankName: 'Ngân hàng Quân Đội (MB Bank)',
    accountName: 'CONG TY TNHH MINH KHOA TRAVEL',
    accountNumber: '0988888888',
    branch: 'Chi nhánh Cầu Giấy - Hà Nội',
    qrCodeUrl: '/images/qr-bank.png',
  },
  notifications: {
    emailBookingConfirmation: true,
    emailBookingCancellation: true,
    emailPaymentConfirmation: true,
    emailAdminAlerts: true,
  },
  security: {
    minPasswordLength: 8,
    requireUppercase: false,
    requireNumber: true,
    requireSpecialChar: false,
    sessionTimeoutMinutes: 60,
    maxLoginAttempts: 5,
    twoFactorEnabled: false,
  },
};

// URL sanitizer to prevent javascript: or malicious injection
const sanitizeUrl = (url?: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^javascript:/i.test(trimmed) || /^data:text\/html/i.test(trimmed)) {
    return '';
  }
  return trimmed;
};

// 1. Get Settings across all sections
export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawSettings = await prisma.systemSetting.findMany();
    const settingsMap: Record<string, any> = { ...DEFAULT_SETTINGS };

    for (const item of rawSettings) {
      if (item.value && typeof item.value === 'object') {
        settingsMap[item.key] = {
          ...settingsMap[item.key],
          ...(item.value as Record<string, any>),
        };
      }
    }

    res.status(200).json({
      success: true,
      data: { settings: settingsMap },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy cấu hình hệ thống', data: null });
  }
};

// 2. Update Specific Settings Section
export const updateSettingsSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { section } = req.params;
    const admin = (req as any).user;
    let payload = req.body;

    const validSections = ['general', 'contact', 'booking', 'payment', 'notifications', 'security'];
    if (!validSections.includes(section)) {
      res.status(400).json({ success: false, message: 'Phân hệ cài đặt không hợp lệ', data: null });
      return;
    }

    // Sanitize URLs in contact or general
    if (payload.facebook) payload.facebook = sanitizeUrl(payload.facebook);
    if (payload.zalo) payload.zalo = sanitizeUrl(payload.zalo);
    if (payload.googleMaps) payload.googleMaps = sanitizeUrl(payload.googleMaps);
    if (payload.logo) payload.logo = sanitizeUrl(payload.logo);

    // Validate booking duration non-negative
    if (section === 'booking') {
      if (payload.minBookingDurationDays < 1) payload.minBookingDurationDays = 1;
      if (payload.maxBookingDurationDays < payload.minBookingDurationDays) {
        payload.maxBookingDurationDays = payload.minBookingDurationDays;
      }
      if (payload.lateReturnPolicyHourlyFee < 0) payload.lateReturnPolicyHourlyFee = 0;
    }

    const updated = await prisma.systemSetting.upsert({
      where: { key: section },
      update: {
        value: payload,
        updatedBy: admin?.email || admin?.userId || 'admin',
      },
      create: {
        key: section,
        value: payload,
        updatedBy: admin?.email || admin?.userId || 'admin',
      },
    });

    await logAudit({
      adminId: admin?.userId,
      adminEmail: admin?.email,
      action: 'SETTINGS_UPDATE',
      resource: 'SETTING',
      resourceId: section,
      details: payload,
      req,
    });

    res.status(200).json({
      success: true,
      message: `Đã lưu cài đặt cho mục "${section.toUpperCase()}" thành công`,
      data: { section: updated.key, value: updated.value },
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lưu cấu hình', data: null });
  }
};

// 3. Get Audit Logs with Server Pagination and Filters
export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 15));
    const skip = (page - 1) * limit;

    const action = req.query.action as string;
    const resource = req.query.resource as string;
    const search = (req.query.search as string)?.trim();

    const where: any = {};

    if (action && action !== 'ALL') {
      where.action = action;
    }
    if (resource && resource !== 'ALL') {
      where.resource = resource;
    }
    if (search && search.length > 0) {
      where.OR = [
        { adminEmail: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { resourceId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi tải nhật ký kiểm toán', data: null });
  }
};

// 4. Get Current Admin Profile
export const getAdminProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ người dùng', data: null });
      return;
    }

    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy hồ sơ admin', data: null });
  }
};

// 5. Update Admin Profile (Name, Email, Phone, Avatar)
export const updateAdminProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const { name, email, phone, avatar } = req.body;

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản', data: null });
      return;
    }

    // Check duplicate email
    if (email && email.toLowerCase() !== existing.email.toLowerCase()) {
      const duplicate = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (duplicate) {
        res.status(400).json({ success: false, message: 'Email này đã được sử dụng', data: null });
        return;
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name !== undefined ? name : existing.name,
        email: email !== undefined ? email.toLowerCase() : existing.email,
        phone: phone !== undefined ? phone : existing.phone,
        avatar: avatar !== undefined ? avatar : existing.avatar,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
      },
    });

    await logAudit({
      adminId: userId,
      adminEmail: updated.email,
      action: 'ADMIN_PROFILE_UPDATE',
      resource: 'ADMIN_PROFILE',
      resourceId: userId,
      details: { name: updated.name, email: updated.email },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Đã cập nhật thông tin tài khoản thành công',
      data: { user: updated },
    });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi cập nhật thông tin', data: null });
  }
};

// 6. Change Admin Password (Strict Current Password Check & Hashing)
export const changeAdminPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản', data: null });
      return;
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác', data: null });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await logAudit({
      adminId: userId,
      adminEmail: user.email,
      action: 'ADMIN_PASSWORD_CHANGE',
      resource: 'ADMIN_PROFILE',
      resourceId: userId,
      details: { timestamp: new Date().toISOString() },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Đổi mật khẩu thành công! Mật khẩu mới đã được áp dụng an toàn.',
      data: null,
    });
  } catch (error) {
    console.error('Error changing admin password:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi đổi mật khẩu', data: null });
  }
};
