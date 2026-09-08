import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { getIO } from '../socket';
import { redisClient } from '../redis';

// Customer initiates payment with security checks
export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const { bookingId, method, transactionCode, clientTimestamp, deviceFingerprint } = req.body;

    // Client IP & User Agent for audit logging
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || req.ip || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // 1. Replay Attack & Timestamp Check (15-minute validity window)
    if (clientTimestamp && Math.abs(Date.now() - Number(clientTimestamp)) > 15 * 60 * 1000) {
      res.status(400).json({ 
        success: false, 
        message: 'Phiên giao dịch đã hết hạn bảo mật (quá 15 phút). Vui lòng làm mới trang và quét lại mã QR!', 
        data: null 
      });
      return;
    }

    // 2. Redis Anti-Spam Rate Limiter (Max 5 attempts / 5 mins per user)
    try {
      const userRateKey = `payment:rate:${userId}`;
      const currentAttempts = await redisClient.incr(userRateKey);
      if (currentAttempts === 1) {
        await redisClient.expire(userRateKey, 300); // 5 minutes
      }
      if (currentAttempts > 5) {
        res.status(429).json({ 
          success: false, 
          message: 'Cảnh báo bảo mật: Bạn đã gửi quá nhiều yêu cầu thanh toán trong thời gian ngắn. Vui lòng thử lại sau 5 phút!', 
          data: null 
        });
        return;
      }
    } catch (e) {
      console.warn('Redis rate limit check error:', e);
    }

    // 3. Redis Cooldown per booking (30 seconds anti-double click & spam)
    try {
      const cooldownKey = `payment:cooldown:${bookingId}`;
      const isCooldown = await redisClient.get(cooldownKey);
      if (isCooldown) {
        res.status(429).json({ 
          success: false, 
          message: 'Yêu cầu thanh toán của bạn đang được xử lý. Vui lòng đợi 30 giây trước khi thao tác lại!', 
          data: null 
        });
        return;
      }
      // Set 30s cooldown
      await redisClient.set(cooldownKey, '1', 'EX', 30);
    } catch (e) {
      console.warn('Redis cooldown check error:', e);
    }

    // 4. Validate booking ownership and status
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.customerId !== userId) {
      res.status(404).json({ success: false, message: 'Không tìm thấy chuyến đi hợp lệ của bạn', data: null });
      return;
    }

    if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
      res.status(400).json({ success: false, message: 'Chuyến đi ở trạng thái hiện tại không thể thanh toán', data: null });
      return;
    }

    // 5. Sanitize transaction code (e.g. FT2409... or MOMO...)
    let sanitizedTxCode: string | null = null;
    if (typeof transactionCode === 'string' && transactionCode.trim().length > 0) {
      sanitizedTxCode = transactionCode.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50);
    }

    // 6. Check if payment already exists
    let payment = await prisma.payment.findUnique({ where: { bookingId } });

    if (payment) {
      if (payment.status === 'COMPLETED') {
        res.status(400).json({ success: false, message: 'Đơn hàng này đã được xác nhận thanh toán hoàn tất trước đó', data: null });
        return;
      }
      // Update method & transactionId if provided
      payment = await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          method: method || payment.method,
          transactionId: sanitizedTxCode || payment.transactionId
        }
      });
    } else {
      payment = await prisma.payment.create({
        data: {
          bookingId,
          amount: booking.totalAmount,
          method: method || 'BANK_TRANSFER',
          transactionId: sanitizedTxCode || `MK-${Date.now().toString(36).toUpperCase()}`
        }
      });
    }

    res.status(201).json({ 
      success: true, 
      message: 'Đã gửi thông báo thanh toán thành công. Quản trị viên đang đối soát!', 
      data: { payment } 
    });

    // 7. Audit log & Notify Admin via Socket with security telemetry
    console.log(`[PAYMENT AUDIT] User: ${userId} | Booking: ${bookingId} | Amount: ${payment.amount} | IP: ${clientIp} | TxCode: ${payment.transactionId}`);
    try {
      getIO().to('admin').emit('payment:created', { 
        bookingId, 
        paymentId: payment.id, 
        amount: payment.amount,
        method: payment.method,
        transactionId: payment.transactionId,
        customerName: (req as any).user?.name || (req as any).user?.email,
        clientIp,
        timestamp: Date.now()
      });
    } catch (e) {
      console.error('Socket error', e);
    }
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xử lý thanh toán', data: null });
  }
};

// Admin confirms payment
export const confirmPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // payment ID

    const payment = await prisma.$transaction(async (tx) => {
      const p = await tx.payment.findUnique({ where: { id }, include: { booking: true } });
      if (!p) throw new Error('NOT_FOUND');

      const updatedPayment = await tx.payment.update({
        where: { id },
        data: { status: 'COMPLETED' },
        include: { booking: true }
      });

      // Optionally, update booking status to CONFIRMED if it was PENDING
      if (p.booking.status === 'PENDING') {
        await tx.booking.update({
          where: { id: p.bookingId },
          data: { status: 'CONFIRMED' }
        });
      }

      return updatedPayment;
    });

    res.status(200).json({ success: true, message: 'Payment confirmed', data: { payment } });

    // Notify Customer
    try {
      getIO().to(`user:${payment.booking.customerId}`).emit('payment:confirmed', { bookingId: payment.bookingId });
    } catch (e) { }

  } catch (error: any) {
    if (error.message === 'NOT_FOUND') {
      res.status(404).json({ success: false, message: 'Payment not found', data: null });
      return;
    }
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

// Get all payments (Admin)
export const getPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        booking: {
          include: {
            customer: { select: { name: true, email: true } },
            vehicle: { select: { name: true, licensePlate: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, message: 'Payments retrieved', data: { payments } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};
