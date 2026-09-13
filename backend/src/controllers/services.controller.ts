import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getAllServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const services = await prisma.service.findMany({ where: { active: true }, orderBy: { createdAt: 'asc' } });
    res.status(200).json({ success: true, message: 'Services retrieved', data: { services } });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách dịch vụ', data: null });
  }
};

export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!service) {
      res.status(404).json({ success: false, message: 'Không tìm thấy dịch vụ', data: null });
      return;
    }
    res.status(200).json({ success: true, message: 'Service retrieved', data: { service } });
  } catch (error) {
    console.error('Error fetching service by id:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: null });
  }
};

export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, description, image, basePrice, active } = req.body;
    const service = await prisma.service.create({
      data: {
        name,
        slug,
        description,
        image,
        basePrice: basePrice !== undefined ? Number(basePrice) : 0,
        active: active !== undefined ? Boolean(active) : true
      }
    });
    res.status(201).json({ success: true, message: 'Service created', data: { service } });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ success: false, message: 'Đường dẫn định danh (slug) dịch vụ đã tồn tại', data: null });
      return;
    }
    console.error('Error creating service:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi tạo dịch vụ', data: null });
  }
};

export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, description, image, basePrice, active } = req.body;
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (slug !== undefined) data.slug = slug;
    if (description !== undefined) data.description = description;
    if (image !== undefined) data.image = image;
    if (basePrice !== undefined) data.basePrice = Number(basePrice);
    if (active !== undefined) data.active = Boolean(active);

    const service = await prisma.service.update({ where: { id: req.params.id }, data });
    res.status(200).json({ success: true, message: 'Service updated', data: { service } });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ success: false, message: 'Slug dịch vụ đã tồn tại', data: null });
      return;
    }
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Không tìm thấy dịch vụ để cập nhật', data: null });
      return;
    }
    console.error('Error updating service:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi cập nhật dịch vụ', data: null });
  }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.service.update({ where: { id: req.params.id }, data: { active: false } });
    res.status(200).json({ success: true, message: 'Service deleted (deactivated)', data: null });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Không tìm thấy dịch vụ để xoá', data: null });
      return;
    }
    console.error('Error deleting service:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xoá dịch vụ', data: null });
  }
};
