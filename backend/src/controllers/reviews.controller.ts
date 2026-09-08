import { Request, Response } from 'express';
import { prisma } from '../prisma';

// Customer creates a review
export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      res.status(400).json({ success: false, message: 'bookingId and rating are required', data: null });
      return;
    }

    // Verify booking belongs to user and is COMPLETED
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.customerId !== userId) {
      res.status(404).json({ success: false, message: 'Booking not found', data: null });
      return;
    }

    if (booking.status !== 'COMPLETED') {
      res.status(400).json({ success: false, message: 'Cannot review an uncompleted trip', data: null });
      return;
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({ where: { bookingId } });
    if (existingReview) {
      res.status(400).json({ success: false, message: 'Review already exists for this trip', data: null });
      return;
    }

    const review = await prisma.review.create({
      data: {
        bookingId,
        vehicleId: booking.vehicleId,
        customerId: userId,
        rating: Number(rating),
        comment
      },
      include: {
        customer: { select: { name: true } },
        vehicle: { select: { name: true } }
      }
    });

    res.status(201).json({ success: true, message: 'Review submitted successfully', data: { review } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', data: null });
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
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};
