import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { getIO } from '../socket';

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vehicleId, serviceId, pickupLocation, destination, passengerCount, startDate, endDate, notes } = req.body;
    const customerId = (req as any).user.userId;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ success: false, message: 'Định dạng ngày tháng không hợp lệ', data: null });
      return;
    }

    if (start >= end) {
      res.status(400).json({ success: false, message: 'Thời gian bắt đầu phải trước thời gian kết thúc', data: null });
      return;
    }

    // Past date check with 5 minutes clock drift margin
    const minAllowedStart = new Date(Date.now() - 5 * 60 * 1000);
    if (start < minAllowedStart) {
      res.status(400).json({ success: false, message: 'Thời gian bắt đầu chuyến đi không thể ở trong quá khứ', data: null });
      return;
    }

    // Maximum trip duration (e.g. 90 days)
    const maxTripMs = 90 * 24 * 3600 * 1000;
    if (end.getTime() - start.getTime() > maxTripMs) {
      res.status(400).json({ success: false, message: 'Thời gian thuê xe tối đa không được vượt quá 90 ngày', data: null });
      return;
    }

    // Atomic Booking Transaction with Serializable Isolation to eliminate race conditions
    const booking = await prisma.$transaction(async (tx) => {
      // 1. Check vehicle existence and availability
      const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId } });
      if (!vehicle) {
        throw new Error('VEHICLE_NOT_FOUND');
      }
      if (vehicle.status !== 'AVAILABLE') {
        throw new Error('VEHICLE_NOT_AVAILABLE');
      }

      // 2. Validate passenger count against vehicle capacity
      const passengers = Number(passengerCount);
      if (passengers > vehicle.seatCount) {
        throw new Error('EXCEEDS_CAPACITY');
      }

      // 3. Check service existence and active status
      const service = await tx.service.findUnique({ where: { id: serviceId } });
      if (!service || !service.active) {
        throw new Error('SERVICE_NOT_FOUND');
      }

      // 4. Overlapping booking check (startDate < end AND endDate > start)
      const overlappingBookings = await tx.booking.findMany({
        where: {
          vehicleId,
          status: {
            in: ['PENDING', 'CONFIRMED', 'ASSIGNED', 'DRIVER_ACCEPTED', 'IN_PROGRESS']
          },
          AND: [
            { startDate: { lt: end } },
            { endDate: { gt: start } }
          ]
        }
      });

      if (overlappingBookings.length > 0) {
        throw new Error('VEHICLE_UNAVAILABLE');
      }

      // 5. Calculate total amount strictly from database rates
      const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
      const totalAmount = (service.basePrice || 0) + (vehicle.basePrice || 0) * days;

      // 6. Create booking
      return await tx.booking.create({
        data: {
          customerId,
          vehicleId,
          serviceId,
          pickupLocation,
          destination,
          passengerCount: passengers,
          startDate: start,
          endDate: end,
          notes: notes ? String(notes).trim().slice(0, 1000) : null,
          totalAmount,
          status: 'PENDING'
        }
      });
    }, {
      isolationLevel: 'Serializable'
    });

    res.status(201).json({ success: true, message: 'Đặt chuyến thành công', data: { booking } });

    // Notify admins via socket
    try {
      getIO().to('admin').emit('booking:created', {
        bookingId: booking.id,
        customerId
      });
    } catch (e) {
      console.warn('Socket emit error on booking:created:', e);
    }
  } catch (error: any) {
    if (error.message === 'VEHICLE_NOT_FOUND') {
      res.status(404).json({ success: false, message: 'Không tìm thấy xe yêu cầu', data: null });
      return;
    }
    if (error.message === 'VEHICLE_NOT_AVAILABLE') {
      res.status(400).json({ success: false, message: 'Xe hiện không khả dụng để đặt (đang bảo dưỡng hoặc ngưng hoạt động)', data: null });
      return;
    }
    if (error.message === 'EXCEEDS_CAPACITY') {
      res.status(400).json({ success: false, message: 'Số lượng hành khách vượt quá số chỗ ngồi của xe', data: null });
      return;
    }
    if (error.message === 'SERVICE_NOT_FOUND') {
      res.status(404).json({ success: false, message: 'Dịch vụ đã chọn không tồn tại hoặc đã ngừng hoạt động', data: null });
      return;
    }
    if (error.message === 'VEHICLE_UNAVAILABLE') {
      res.status(400).json({ success: false, message: 'Xe đã có người đặt trong khoảng thời gian này. Vui lòng chọn khung giờ khác!', data: null });
      return;
    }
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi tạo đơn đặt xe', data: null });
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

    if (role === 'CUSTOMER' && booking.customerId !== userId) {
      res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập đơn đặt xe này', data: null });
      return;
    }

    if (role === 'DRIVER') {
      const driver = await prisma.driver.findUnique({ where: { userId } });
      if (!driver || booking.driverId !== driver.id) {
        res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập đơn đặt xe này', data: null });
        return;
      }
    }

    res.status(200).json({ success: true, message: 'Booking retrieved', data: { booking } });
  } catch (error) {
    console.error('Error fetching booking by id:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', data: null });
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

