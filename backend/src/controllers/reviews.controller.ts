import { Request, Response } from 'express';
import { prisma } from '../prisma';

// Customer creates a review
export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const { bookingId, rating, comment } = req.body;

    const parsedRating = Math.min(5, Math.max(1, Math.round(Number(rating))));
    const sanitizedComment = comment ? String(comment).trim().slice(0, 1000) : null;

    // Verify booking belongs to user and is COMPLETED
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.customerId !== userId) {
      res.status(404).json({ success: false, message: 'Không tìm thấy chuyến đi của bạn', data: null });
      return;
    }

    if (booking.status !== 'COMPLETED') {
      res.status(400).json({ success: false, message: 'Chỉ có thể đánh giá chuyến đi đã hoàn thành', data: null });
      return;
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({ where: { bookingId } });
    if (existingReview) {
      res.status(400).json({ success: false, message: 'Bạn đã gửi đánh giá cho chuyến đi này rồi', data: null });
      return;
    }

    const review = await prisma.review.create({
      data: {
        bookingId,
        vehicleId: booking.vehicleId,
        customerId: userId,
        rating: parsedRating,
        comment: sanitizedComment
      },
      include: {
        customer: { select: { name: true } },
        vehicle: { select: { name: true } }
      }
    });

    res.status(201).json({ success: true, message: 'Đánh giá đã được gửi thành công', data: { review } });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi gửi đánh giá', data: null });
  }
};

// Get reviews for a vehicle
export const getVehicleReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vehicleId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { vehicleId },
      include: {
        customer: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, message: 'Reviews retrieved', data: { reviews } });
  } catch (error) {
    console.error('Error fetching vehicle reviews:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy đánh giá', data: null });
  }
};
