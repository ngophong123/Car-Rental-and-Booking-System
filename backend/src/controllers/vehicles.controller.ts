import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { clearCache } from '../middlewares/cache.middleware';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const getAllVehicles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, type, minSeats, maxSeats } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (minSeats) where.seatCount = { gte: Number(minSeats) };
    if (maxSeats) where.seatCount = { ...where.seatCount, lte: Number(maxSeats) };

    const vehicles = await prisma.vehicle.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.status(200).json({ success: true, message: 'Vehicles retrieved', data: { vehicles } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const getVehicleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
    if (!vehicle) {
      res.status(404).json({ success: false, message: 'Vehicle not found', data: null });
      return;
    }
    res.status(200).json({ success: true, message: 'Vehicle retrieved', data: { vehicle } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const createVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const vehicle = await prisma.vehicle.create({ data });
    await clearCache('vehicles');
    res.status(201).json({ success: true, message: 'Vehicle created', data: { vehicle } });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ success: false, message: 'License plate already exists', data: null });
      return;
    }
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const updateVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const vehicle = await prisma.vehicle.update({ where: { id: req.params.id }, data });
    await clearCache('vehicles');
    res.status(200).json({ success: true, message: 'Vehicle updated', data: { vehicle } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const deleteVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.vehicle.delete({ where: { id: req.params.id } });
    await clearCache('vehicles');
    res.status(200).json({ success: true, message: 'Vehicle deleted', data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};
