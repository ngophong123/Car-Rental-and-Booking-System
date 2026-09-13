import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { clearCache } from '../middlewares/cache.middleware';

export const getAllVehicles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, type, minSeats, maxSeats } = req.query as any;

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (minSeats !== undefined) where.seatCount = { gte: Number(minSeats) };
    if (maxSeats !== undefined) where.seatCount = { ...where.seatCount, lte: Number(maxSeats) };

    const vehicles = await prisma.vehicle.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.status(200).json({ success: true, message: 'Vehicles retrieved', data: { vehicles } });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách xe', data: null });
  }
};

export const getVehicleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
    if (!vehicle) {
      res.status(404).json({ success: false, message: 'Không tìm thấy phương tiện', data: null });
      return;
    }
    res.status(200).json({ success: true, message: 'Vehicle retrieved', data: { vehicle } });
  } catch (error) {
    console.error('Error fetching vehicle by id:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: null });
  }
};

export const createVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, brand, model, licensePlate, seatCount, year, image, description, basePrice, status, type } = req.body;
    const vehicle = await prisma.vehicle.create({
      data: {
        name,
        brand,
        model,
        licensePlate,
        seatCount,
        year,
        image,
        description,
        basePrice,
        status,
        type
      }
    });
    await clearCache('vehicles');
    res.status(201).json({ success: true, message: 'Vehicle created', data: { vehicle } });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ success: false, message: 'Biển số xe đã tồn tại trong hệ thống', data: null });
      return;
    }
    console.error('Error creating vehicle:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi tạo xe', data: null });
  }
};

export const updateVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, brand, model, licensePlate, seatCount, year, image, description, basePrice, status, type } = req.body;
    
    // Construct clean update object with only defined fields
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (brand !== undefined) data.brand = brand;
    if (model !== undefined) data.model = model;
    if (licensePlate !== undefined) data.licensePlate = licensePlate;
    if (seatCount !== undefined) data.seatCount = seatCount;
    if (year !== undefined) data.year = year;
    if (image !== undefined) data.image = image;
    if (description !== undefined) data.description = description;
    if (basePrice !== undefined) data.basePrice = basePrice;
    if (status !== undefined) data.status = status;
    if (type !== undefined) data.type = type;

    const vehicle = await prisma.vehicle.update({ where: { id: req.params.id }, data });
    await clearCache('vehicles');
    res.status(200).json({ success: true, message: 'Vehicle updated', data: { vehicle } });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ success: false, message: 'Biển số xe đã tồn tại', data: null });
      return;
    }
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Không tìm thấy xe để cập nhật', data: null });
      return;
    }
    console.error('Error updating vehicle:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi cập nhật xe', data: null });
  }
};

export const deleteVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.vehicle.delete({ where: { id: req.params.id } });
    await clearCache('vehicles');
    res.status(200).json({ success: true, message: 'Vehicle deleted', data: null });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Không tìm thấy xe để xoá', data: null });
      return;
    }
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xoá xe', data: null });
  }
};
