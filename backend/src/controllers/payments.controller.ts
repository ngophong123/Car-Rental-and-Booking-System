import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { getIO } from '../socket';
import { redisClient } from '../redis';
import { logAudit } from '../utils/audit.util';

// 1. Customer initiates payment with security checks & idempotency
export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const { bookingId, method, transactionCode, clientTimestamp } = req.body;
    const idempotencyKey = (req.headers['idempotency-key'] as string)?.trim();

    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || req.ip || 'Unknown';

    // 1. Idempotency Check: Prevent duplicate payment creation
    if (idempotencyKey) {
      const existingIdempotentPayment = await prisma.payment.findFirst({
        where: { idempotencyKey },
        include: { booking: true },
      });
      if (existingIdempotentPayment) {
        res.status(200).json({
          success: true,
          message: 'Yêu cầu thanh toán đã được tiếp nhận trước đó (Idempotent replay).',
          data: { payment: existingIdempotentPayment },
        });
        return;
      }
    }

    // 2. Replay Attack & Timestamp Check (15-minute validity window)
    if (clientTimestamp && Math.abs(Date.now() - Number(clientTimestamp)) > 15 * 60 * 1000) {
      res.status(400).json({
        success: false,
        message: 'Phiên giao dịch đã hết hạn bảo mật (quá 15 phút). Vui lòng làm mới trang và quét lại mã QR!',
        data: null,
      });
      return;
    }

    // 3. Redis Anti-Spam Rate Limiter (Max 5 attempts / 5 mins per user)
    try {
      const userRateKey = `payment:rate:${userId}`;
      const currentAttempts = await redisClient.incr(userRateKey);
      if (currentAttempts === 1) {
        await redisClient.expire(userRateKey, 300);
      }
      if (currentAttempts > 5) {
        res.status(429).json({
          success: false,
          message: 'Cảnh báo bảo mật: Bạn đã gửi quá nhiều yêu cầu thanh toán trong thời gian ngắn. Vui lòng thử lại sau 5 phút!',
          data: null,
        });
        return;
      }
    } catch (e) {
      console.warn('Redis rate limit check error:', e);
    }

    // 4. Redis Cooldown per booking (30 seconds anti-double click)
    try {
      const cooldownKey = `payment:cooldown:${bookingId}`;
      const isCooldown = await redisClient.get(cooldownKey);
      if (isCooldown) {
        res.status(429).json({
          success: false,
          message: 'Yêu cầu thanh toán của bạn đang được xử lý. Vui lòng đợi 30 giây trước khi thao tác lại!',
          data: null,
        });
        return;
      }
      await redisClient.set(cooldownKey, '1', 'EX', 30);
    } catch (e) {
      console.warn('Redis cooldown check error:', e);
    }

    // 5. Validate booking ownership and status
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true, vehicle: true },
    });
    if (!booking || booking.customerId !== userId) {
      res.status(404).json({ success: false, message: 'Không tìm thấy chuyến đi hợp lệ của bạn', data: null });
      return;
    }

    if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
      res.status(400).json({ success: false, message: 'Chuyến đi ở trạng thái hiện tại không thể thanh toán', data: null });
      return;
    }

    // 6. Sanitize transaction code
    let sanitizedTxCode: string | null = null;
    if (typeof transactionCode === 'string' && transactionCode.trim().length > 0) {
      sanitizedTxCode = transactionCode.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50);
    }

    // 7. Upsert Payment with Idempotency Key
    let payment = await prisma.payment.findUnique({ where: { bookingId } });

    if (payment) {
      if (payment.status === 'COMPLETED' || payment.status === 'PAID') {
        res.status(400).json({ success: false, message: 'Đơn hàng này đã được xác nhận thanh toán hoàn tất trước đó', data: null });
        return;
      }
      payment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          method: method || payment.method,
          transactionId: sanitizedTxCode || payment.transactionId,
          idempotencyKey: idempotencyKey || payment.idempotencyKey,
        },
      });
    } else {
      payment = await prisma.payment.create({
        data: {
          bookingId,
          amount: booking.totalAmount,
          method: method || 'BANK_TRANSFER',
          transactionId: sanitizedTxCode || `MK-${Date.now().toString(36).toUpperCase()}`,
          idempotencyKey: idempotencyKey || null,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Đã gửi thông báo thanh toán thành công. Quản trị viên đang đối soát!',
      data: { payment },
    });

    // Notify Admin via Socket.IO
    try {
      getIO().to('admin').emit('payment:created', {
        bookingId,
        paymentId: payment.id,
        amount: payment.amount,
        method: payment.method,
        transactionId: payment.transactionId,
        customerName: booking.customer.name || booking.customer.email,
        vehicleName: booking.vehicle.name,
        clientIp,
        timestamp: Date.now(),
      });
    } catch (e) {
      console.error('Socket error', e);
    }
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xử lý thanh toán', data: null });
  }
};

// 2. Admin Get Payments with Server Pagination, Financial Metrics & Filters
export const getPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const search = (req.query.search as string)?.trim();
    const status = req.query.status as string;
    const method = req.query.method as string;
    const dateRange = req.query.dateRange as string;
    const minAmount = req.query.minAmount ? Number(req.query.minAmount) : undefined;
    const maxAmount = req.query.maxAmount ? Number(req.query.maxAmount) : undefined;

    const where: any = {};

    // Status filter
    if (status && status !== 'ALL') {
      if (status === 'PAID') {
        where.status = { in: ['PAID', 'COMPLETED'] };
      } else {
        where.status = status;
      }
    }

    // Method filter
    if (method && method !== 'ALL' && ['CASH', 'BANK_TRANSFER', 'ONLINE'].includes(method)) {
      where.method = method;
    }

    // Amount range filter
    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) where.amount.gte = minAmount;
      if (maxAmount !== undefined) where.amount.lte = maxAmount;
    }

    // Search query across transactionId, bookingId, customer name/email/phone
    if (search && search.length > 0) {
      where.OR = [
        { transactionId: { contains: search, mode: 'insensitive' } },
        { bookingId: { contains: search, mode: 'insensitive' } },
        { booking: { customer: { name: { contains: search, mode: 'insensitive' } } } },
        { booking: { customer: { email: { contains: search, mode: 'insensitive' } } } },
        { booking: { customer: { phone: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    // Date range filter
    const now = new Date();
    if (dateRange === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      where.createdAt = { gte: startOfDay };
    } else if (dateRange === 'this_week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      where.createdAt = { gte: startOfWeek };
    } else if (dateRange === 'this_month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      where.createdAt = { gte: startOfMonth };
    }

    const total = await prisma.payment.count({ where });

    // Financial Metrics Calculation across all payments
    const allPaymentsForMetrics = await prisma.payment.findMany({
      select: {
        amount: true,
        status: true,
        createdAt: true,
        paidAt: true,
        refunds: { select: { amount: true } },
      },
    });

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalRevenue = 0;
    let revenueToday = 0;
    let revenueThisMonth = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let failedCount = 0;
    let refundedCount = 0;

    for (const p of allPaymentsForMetrics) {
      const isPaid = p.status === 'PAID' || p.status === 'COMPLETED';
      const isRefunded = p.status === 'REFUNDED' || p.status === 'PARTIALLY_REFUNDED';
      const refundSum = p.refunds.reduce((sum, r) => sum + r.amount, 0);

      if (isPaid) {
        paidCount++;
        const netAmount = p.amount - refundSum;
        totalRevenue += netAmount;

        const effectiveDate = p.paidAt || p.createdAt;
        if (effectiveDate >= startOfToday) {
          revenueToday += netAmount;
        }
        if (effectiveDate >= startOfThisMonth) {
          revenueThisMonth += netAmount;
        }
      } else if (p.status === 'PENDING') {
        pendingCount++;
      } else if (p.status === 'FAILED') {
        failedCount++;
      } else if (isRefunded) {
        refundedCount++;
        const netAmount = Math.max(0, p.amount - refundSum);
        totalRevenue += netAmount;
      }
    }

    // Paginated Payments Query
    const payments = await prisma.payment.findMany({
      where,
      include: {
        booking: {
          include: {
            customer: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
            vehicle: { select: { id: true, name: true, licensePlate: true, image: true } },
          },
        },
        refunds: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
        metrics: {
          totalRevenue,
          revenueToday,
          revenueThisMonth,
          paidCount,
          pendingCount,
          failedCount,
          refundedCount,
        },
      },
    });
  } catch (error) {
    console.error('Error retrieving payments:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách thanh toán', data: null });
  }
};

// 3. Admin Get Single Payment Detail
export const getPaymentDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            customer: { select: { id: true, name: true, email: true, phone: true, avatar: true, status: true } },
            vehicle: { select: { id: true, name: true, brand: true, model: true, licensePlate: true, image: true, seatCount: true } },
            service: { select: { id: true, name: true } },
          },
        },
        refunds: {
          include: {
            admin: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!payment) {
      res.status(404).json({ success: false, message: 'Không tìm thấy thông tin thanh toán', data: null });
      return;
    }

    res.status(200).json({ success: true, data: { payment } });
  } catch (error) {
    console.error('Error fetching payment detail:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy chi tiết thanh toán', data: null });
  }
};

// 4. Admin Confirms Payment (State Machine Transition PENDING -> PAID)
export const confirmPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const admin = (req as any).user;

    const payment = await prisma.$transaction(async (tx) => {
      const p = await tx.payment.findUnique({ where: { id }, include: { booking: true } });
      if (!p) throw new Error('NOT_FOUND');

      if (p.status === 'PAID' || p.status === 'COMPLETED') {
        throw new Error('ALREADY_PAID');
      }

      const updatedPayment = await tx.payment.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
        },
        include: {
          booking: {
            include: {
              customer: { select: { id: true, name: true, email: true } },
              vehicle: { select: { name: true, licensePlate: true } },
            },
          },
        },
      });

      // Update booking to CONFIRMED
      if (p.booking.status === 'PENDING') {
        await tx.booking.update({
          where: { id: p.bookingId },
          data: { status: 'CONFIRMED' },
        });
      }

      return updatedPayment;
    });

    // Audit Log
    await logAudit({
      adminId: admin?.userId,
      adminEmail: admin?.email,
      action: 'PAYMENT_CONFIRM',
      resource: 'PAYMENT',
      resourceId: id,
      details: { amount: payment.amount, bookingId: payment.bookingId },
      req,
    });

    // Notify Customer
    try {
      getIO().to(`user:${payment.booking.customerId}`).emit('payment:confirmed', {
        bookingId: payment.bookingId,
        amount: payment.amount,
        message: 'Thanh toán của bạn đã được xác nhận thành công!',
      });
      getIO().to('admin').emit('payment:updated', { paymentId: payment.id, status: 'COMPLETED' });
    } catch (e) { }

    res.status(200).json({
      success: true,
      message: 'Đã xác nhận thanh toán thành công. Lịch trình chuyến xe đã được duyệt!',
      data: { payment },
    });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') {
      res.status(404).json({ success: false, message: 'Không tìm thấy bản ghi thanh toán', data: null });
      return;
    }
    if (error.message === 'ALREADY_PAID') {
      res.status(400).json({ success: false, message: 'Giao dịch này đã được xác nhận hoàn tất trước đó', data: null });
      return;
    }
    console.error('Error confirming payment:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xác nhận thanh toán', data: null });
  }
};

// 5. Admin Updates Payment Status with Strict State Machine Verification
export const updatePaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const admin = (req as any).user;

    const currentPayment = await prisma.payment.findUnique({ where: { id } });
    if (!currentPayment) {
      res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch thanh toán', data: null });
      return;
    }

    // Validate State Transitions
    const currentStatus = currentPayment.status;

    // Reject transition from PAID/COMPLETED back to PENDING
    if ((currentStatus === 'PAID' || currentStatus === 'COMPLETED') && status === 'PENDING') {
      res.status(400).json({
        success: false,
        message: 'Lỗi quy trình: Giao dịch đã thu tiền thành công không được chuyển lùi về trạng thái Chờ (Pending)',
        data: null,
      });
      return;
    }

    // Transition from REFUNDED to PENDING or PAID is invalid
    if (currentStatus === 'REFUNDED' && (status === 'PENDING' || status === 'PAID')) {
      res.status(400).json({
        success: false,
        message: 'Giao dịch đã hoàn tiền không thể tái kích hoạt',
        data: null,
      });
      return;
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        status,
        paidAt: (status === 'PAID' || status === 'COMPLETED') && !currentPayment.paidAt ? new Date() : currentPayment.paidAt,
      },
    });

    await logAudit({
      adminId: admin?.userId,
      adminEmail: admin?.email,
      action: 'PAYMENT_STATUS_CHANGE',
      resource: 'PAYMENT',
      resourceId: id,
      details: { previousStatus: currentStatus, newStatus: status, note },
      req,
    });

    res.status(200).json({
      success: true,
      message: `Đã cập nhật trạng thái thanh toán thành ${status}`,
      data: { payment: updated },
    });
  } catch (error: any) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi cập nhật trạng thái thanh toán', data: null });
  }
};

// 6. Admin Issues a Refund (Transactional & Audited)
export const refundPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;
    const admin = (req as any).user;

    const refundAmount = Number(amount);
    if (!refundAmount || refundAmount <= 0) {
      res.status(400).json({ success: false, message: 'Số tiền hoàn phải lớn hơn 0', data: null });
      return;
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { refunds: true, booking: true },
    });

    if (!payment) {
      res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch thanh toán', data: null });
      return;
    }

    // Must be in paid status
    if (payment.status !== 'PAID' && payment.status !== 'COMPLETED' && payment.status !== 'PARTIALLY_REFUNDED') {
      res.status(400).json({
        success: false,
        message: 'Chỉ có thể hoàn tiền cho giao dịch đã thanh toán thành công',
        data: null,
      });
      return;
    }

    // Check remaining refundable balance
    const alreadyRefunded = payment.refunds.reduce((sum, r) => sum + r.amount, 0);
    const maxRefundable = payment.amount - alreadyRefunded;

    if (refundAmount > maxRefundable) {
      res.status(400).json({
        success: false,
        message: `Số tiền hoàn vượt quá số dư giao dịch có thể hoàn (Tối đa: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(maxRefundable)})`,
        data: null,
      });
      return;
    }

    const isFullyRefunded = (alreadyRefunded + refundAmount) >= payment.amount;

    // Database Transaction: Create Refund + Update Payment Status
    const result = await prisma.$transaction(async (tx) => {
      const newRefund = await tx.refund.create({
        data: {
          paymentId: payment.id,
          amount: refundAmount,
          reason,
          adminId: admin.userId,
          status: 'COMPLETED',
        },
      });

      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: isFullyRefunded ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        },
        include: { refunds: true },
      });

      return { newRefund, updatedPayment };
    });

    await logAudit({
      adminId: admin?.userId,
      adminEmail: admin?.email,
      action: 'PAYMENT_REFUND',
      resource: 'PAYMENT',
      resourceId: id,
      details: { refundAmount, reason, isFullyRefunded },
      req,
    });

    try {
      getIO().to('admin').emit('payment:refunded', {
        paymentId: payment.id,
        bookingId: payment.bookingId,
        refundAmount,
        reason,
      });
    } catch (e) { }

    res.status(201).json({
      success: true,
      message: `Đã xử lý hoàn tiền ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(refundAmount)} thành công!`,
      data: result,
    });
  } catch (error: any) {
    console.error('Error refunding payment:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xử lý hoàn tiền', data: null });
  }
};

// 7. Export Payments to UTF-8 CSV (Safe columns only, Excel compatible)
export const exportPaymentsCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        booking: {
          include: {
            customer: { select: { name: true, email: true, phone: true } },
            vehicle: { select: { name: true, licensePlate: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    // CSV Headers
    const headers = [
      'Mã giao dịch',
      'Mã chuyến',
      'Khách hàng',
      'Email',
      'Số điện thoại',
      'Xe',
      'Biển số',
      'Số tiền (VNĐ)',
      'Phương thức',
      'Trạng thái',
      'Thời gian tạo',
      'Thời gian nộp tiền',
    ];

    const rows = payments.map((p) => [
      `"${p.transactionId || p.id}"`,
      `"${p.bookingId}"`,
      `"${(p.booking.customer.name || '').replace(/"/g, '""')}"`,
      `"${p.booking.customer.email || ''}"`,
      `"${p.booking.customer.phone || ''}"`,
      `"${(p.booking.vehicle.name || '').replace(/"/g, '""')}"`,
      `"${p.booking.vehicle.licensePlate || ''}"`,
      p.amount,
      `"${p.method}"`,
      `"${p.status}"`,
      `"${p.createdAt.toISOString()}"`,
      `"${p.paidAt ? p.paidAt.toISOString() : ''}"`,
    ]);

    // UTF-8 BOM (\uFEFF) ensures Vietnamese accents display flawlessly in Microsoft Excel
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=minhkhoa-payments-${Date.now()}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting payments CSV:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tạo file báo cáo CSV', data: null });
  }
};
