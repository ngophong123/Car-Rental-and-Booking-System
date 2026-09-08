import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const getAllServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const services = await prisma.service.findMany({ where: { active: true }, orderBy: { createdAt: 'asc' } });
    res.status(200).json({ success: true, message: 'Services retrieved', data: { services } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found', data: null });
      return;
    }
    res.status(200).json({ success: true, message: 'Service retrieved', data: { service } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const service = await prisma.service.create({ data });
    res.status(201).json({ success: true, message: 'Service created', data: { service } });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ success: false, message: 'Service slug already exists', data: null });
      return;
    }
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const service = await prisma.service.update({ where: { id: req.params.id }, data });
    res.status(200).json({ success: true, message: 'Service updated', data: { service } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.service.update({ where: { id: req.params.id }, data: { active: false } });
    res.status(200).json({ success: true, message: 'Service deleted (deactivated)', data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};
