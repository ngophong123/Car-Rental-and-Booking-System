import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { getIO } from '../socket';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vehicleId, serviceId, pickupLocation, destination, passengerCount, startDate, endDate, notes } = req.body;
    const customerId = (req as any).user.userId;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      res.status(400).json({ success: false, message: 'Start date must be before end date', data: null });
      return;
    }

    // Double Booking Check using Prisma Transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Find overlapping bookings for this vehicle that are not cancelled or rejected
      const overlappingBookings = await tx.booking.findMany({
        where: {
          vehicleId,
          status: {
            in: ['PENDING', 'CONFIRMED', 'ASSIGNED', 'DRIVER_ACCEPTED', 'IN_PROGRESS']
          },
          OR: [
            {
              startDate: { lte: end },
              endDate: { gte: start }
            }
          ]
        }
      });

      if (overlappingBookings.length > 0) {
        throw new Error('VEHICLE_UNAVAILABLE');
      }

      // Calculate total amount (simplified for now, ideally depends on service basePrice and days)
      const service = await tx.service.findUnique({ where: { id: serviceId } });
      const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId } });

      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) || 1;
      const totalAmount = (service?.basePrice || 0) + (vehicle?.basePrice || 0) * days;

      // Create Booking
      return await tx.booking.create({
        data: {
          customerId,
          vehicleId,
          serviceId,
          pickupLocation,
          destination,
          passengerCount: Number(passengerCount),
          startDate: start,
          endDate: end,
          notes,
          totalAmount,
          status: 'PENDING'
        }
      });
    });

    res.status(201).json({ success: true, message: 'Booking created successfully', data: { booking } });

    // Emit to admins
    try {
      getIO().to('admin').emit('booking:created', {
        bookingId: booking.id,
        customerId
      });
    } catch (e) {
      console.error('Socket error', e);
    }
  } catch (error: any) {
    if (error.message === 'VEHICLE_UNAVAILABLE') {
      res.status(400).json({ success: false, message: 'Xe đã được đặt trong khoảng thời gian này', data: null });
      return;
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const getBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, userId } = (req as any).user;

    let where: any = {};
    if (role === 'CUSTOMER') {
      where = { customerId: userId };
    } else if (role === 'DRIVER') {
      const driver = await prisma.driver.findUnique({ where: { userId } });
      if (!driver) {
        res.status(404).json({ success: false, message: 'Driver profile not found', data: null });
        return;
      }
      where = { driverId: driver.id };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: { select: { name: true, email: true } },
        vehicle: { select: { name: true, licensePlate: true, id: true } },
        service: { select: { name: true } },
        driver: { select: { fullName: true, phone: true } },
        payment: true,
        review: true
      },
      orderBy: { startDate: 'asc' }
    });

    res.status(200).json({ success: true, message: 'Bookings retrieved', data: { bookings } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, userId } = (req as any).user;
    const bookingId = req.params.id;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: { select: { name: true, email: true, id: true } },
        vehicle: { select: { name: true, licensePlate: true } },
        service: { select: { name: true } },
        driver: { select: { fullName: true, phone: true } }
      }
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found', data: null });
      return;
    }

    if (role !== 'ADMIN' && role !== 'STAFF' && booking.customerId !== userId) {
      res.status(403).json({ success: false, message: 'Access denied', data: null });
      return;
    }

    res.status(200).json({ success: true, message: 'Booking retrieved', data: { booking } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.status(200).json({ success: true, message: 'Booking status updated', data: { booking } });

    // Emit to customer
    try {
      getIO().to(`user:${booking.customerId}`).emit('booking:status_changed', {
        bookingId: booking.id,
        status: booking.status
      });
    } catch (e) {
      console.error('Socket error', e);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, role } = (req as any).user;

    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found', data: null });
      return;
    }

    if (role !== 'ADMIN' && role !== 'STAFF' && booking.customerId !== userId) {
      res.status(403).json({ success: false, message: 'Access denied', data: null });
      return;
    }

    if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
      res.status(400).json({ success: false, message: 'Cannot cancel booking at this stage', data: null });
      return;
    }

    await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' }
    });

    res.status(200).json({ success: true, message: 'Booking cancelled successfully', data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const assignDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const { driverId } = req.body;

    const booking = await prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.booking.update({
        where: { id: req.params.id },
        data: {
          driverId,
          status: 'ASSIGNED'
        }
      });

      await tx.driver.update({
        where: { id: driverId },
        data: { status: 'ASSIGNED' }
      });

      return updatedBooking;
    });

    res.status(200).json({ success: true, message: 'Driver assigned successfully', data: { booking } });

    // Emit to customer and driver
    try {
      const io = getIO();
      io.to(`user:${booking.customerId}`).emit('booking:assigned', {
        bookingId: booking.id,
        driverId
      });
      // Driver uses their user ID for the socket room. We need the driver's user account ID.
      const driverRecord = await prisma.driver.findUnique({ where: { id: driverId } });
      if (driverRecord?.userId) {
        io.to(`user:${driverRecord.userId}`).emit('booking:assigned', {
          bookingId: booking.id
        });
      }
    } catch (e) {
      console.error('Socket error', e);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const updateDriverTripStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const { status } = req.body; // expected: DRIVER_ACCEPTED, IN_PROGRESS, COMPLETED
    const bookingId = req.params.id;

    // Validate valid actions
    if (!['DRIVER_ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status', data: null });
      return;
    }

    const booking = await prisma.$transaction(async (tx) => {
      // Ensure the driver owns this booking
      const driver = await tx.driver.findUnique({ where: { userId } });
      if (!driver) throw new Error('NOT_FOUND_DRIVER');

      const existingBooking = await tx.booking.findUnique({ where: { id: bookingId } });
      if (!existingBooking || existingBooking.driverId !== driver.id) {
        throw new Error('ACCESS_DENIED');
      }

      // Update Booking
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { status }
      });

      // Update Driver status based on booking status
      let driverStatus = driver.status;
      if (status === 'IN_PROGRESS') driverStatus = 'ON_TRIP';
      if (status === 'COMPLETED') driverStatus = 'AVAILABLE';
      if (status === 'DRIVER_ACCEPTED') driverStatus = 'ASSIGNED'; // still assigned but acknowledged

      await tx.driver.update({
        where: { id: driver.id },
        data: { status: driverStatus }
      });

      return updatedBooking;
    });

    res.status(200).json({ success: true, message: 'Trip status updated', data: { booking } });

    // Emit socket event to admin and customer
    try {
      const io = getIO();
      io.to('admin').emit('booking:status_changed', { bookingId, status });
      io.to(`user:${booking.customerId}`).emit('booking:status_changed', { bookingId, status });
    } catch (e) {
      console.error('Socket error', e);
    }
  } catch (error: any) {
    if (error.message === 'NOT_FOUND_DRIVER' || error.message === 'ACCESS_DENIED') {
      res.status(403).json({ success: false, message: 'Access denied', data: null });
      return;
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

