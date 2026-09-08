import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const getAllDrivers = async (req: Request, res: Response): Promise<void> => {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        user: { select: { email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, message: 'Drivers retrieved', data: { drivers } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const createDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, fullName, phone, licenseNumber, licenseType, licenseExpiryDate } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email already in use', data: null });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
    res.status(500).json({ success: false, message: 'Server error', data: null });
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};
