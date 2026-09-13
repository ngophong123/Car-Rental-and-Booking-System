import { Request, Response } from 'express';
import { prisma } from '../prisma';
import bcrypt from 'bcrypt';

export const getAllDrivers = async (req: Request, res: Response): Promise<void> => {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        user: { select: { email: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, message: 'Drivers retrieved', data: { drivers } });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách tài xế', data: null });
  }
};

export const createDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, fullName, phone, licenseNumber, licenseType, licenseExpiryDate } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Địa chỉ email đã được đăng ký trong hệ thống', data: null });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const driver = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name: fullName,
          role: 'DRIVER'
        }
      });

      return await tx.driver.create({
        data: {
          userId: user.id,
          fullName,
          phone,
          licenseNumber,
          licenseType,
          licenseExpiryDate: new Date(licenseExpiryDate)
        }
      });
    });

    res.status(201).json({ success: true, message: 'Driver created', data: { driver } });
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi tạo hồ sơ tài xế', data: null });
  }
};

export const updateDriverStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const driver = await prisma.driver.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.status(200).json({ success: true, message: 'Driver status updated', data: { driver } });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Không tìm thấy tài xế', data: null });
      return;
    }
    console.error('Error updating driver status:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi cập nhật trạng thái tài xế', data: null });
  }
};
