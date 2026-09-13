import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { logAudit } from '../utils/audit.util';

// 1. Get Customers List with Server Pagination, Search & Filters
export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const search = (req.query.search as string)?.trim();
    const status = req.query.status as string;
    const dateRange = req.query.dateRange as string;
    const sortBy = req.query.sortBy as string;

    // Prisma Where Clause
    const where: any = {
      role: 'CUSTOMER',
      isDeleted: false,
    };

    // Status Filter
    if (status && status !== 'ALL' && ['ACTIVE', 'SUSPENDED', 'BLOCKED'].includes(status)) {
      where.status = status;
    }

    // Search Query across name, email, phone safely
    if (search && search.length > 0) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Date Range Filter
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

    // Order By
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'oldest') {
      orderBy = { createdAt: 'asc' };
    }

    // Total Count
    const total = await prisma.user.count({ where });

    // Summary Metrics
    const [totalCustomers, activeCount, suspendedCount, blockedCount, newThisMonthCount] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER', isDeleted: false } }),
      prisma.user.count({ where: { role: 'CUSTOMER', status: 'ACTIVE', isDeleted: false } }),
      prisma.user.count({ where: { role: 'CUSTOMER', status: 'SUSPENDED', isDeleted: false } }),
      prisma.user.count({ where: { role: 'CUSTOMER', status: 'BLOCKED', isDeleted: false } }),
      prisma.user.count({
        where: {
          role: 'CUSTOMER',
          isDeleted: false,
          createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
        },
      }),
    ]);

    // Query Users with Bookings Summary
    const rawCustomers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        status: true,
        isDeleted: true,
        createdAt: true,
        lastLoginAt: true,
        bookings: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    // Transform and calculate spending
    let customers = rawCustomers.map((u) => {
      const totalBookings = u.bookings.length;
      const completedBookings = u.bookings.filter((b) => b.status === 'COMPLETED').length;
      const totalSpent = u.bookings
        .filter((b) => b.status === 'COMPLETED' || b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS')
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      const { bookings, ...rest } = u;
      return {
        ...rest,
        totalBookings,
        completedBookings,
        totalSpent,
      };
    });

    // Custom Sorting for in-memory aggregated fields if requested
    if (sortBy === 'most_bookings') {
      customers.sort((a, b) => b.totalBookings - a.totalBookings);
    } else if (sortBy === 'highest_spending') {
      customers.sort((a, b) => b.totalSpent - a.totalSpent);
    }

    res.status(200).json({
      success: true,
      data: {
        customers,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
        summary: {
          totalCustomers,
          activeCount,
          suspendedCount,
          blockedCount,
          newThisMonthCount,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi tải danh sách khách hàng', data: null });
  }
};

// 2. Get Customer Detail with Complete Booking & Payment History
export const getCustomerDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const customer = await prisma.user.findFirst({
      where: { id, role: 'CUSTOMER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        status: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        bookings: {
          include: {
            vehicle: {
              select: {
                id: true,
                name: true,
                licensePlate: true,
                image: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
              },
            },
            payment: {
              select: {
                id: true,
                amount: true,
                method: true,
                status: true,
                transactionId: true,
                createdAt: true,
                paidAt: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      res.status(404).json({ success: false, message: 'Không tìm thấy thông tin khách hàng', data: null });
      return;
    }

    // Aggregate statistics
    const totalBookings = customer.bookings.length;
    const completedBookings = customer.bookings.filter((b) => b.status === 'COMPLETED').length;
    const cancelledBookings = customer.bookings.filter((b) => b.status === 'CANCELLED' || b.status === 'REJECTED').length;
    const totalSpending = customer.bookings
      .filter((b) => b.status === 'COMPLETED' || b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const averageBookingValue = totalBookings > 0 ? Math.round(totalSpending / totalBookings) : 0;

    // Extract payments across all bookings
    const payments = customer.bookings
      .filter((b) => b.payment !== null)
      .map((b) => ({
        ...b.payment!,
        bookingId: b.id,
        vehicleName: b.vehicle.name,
      }));

    res.status(200).json({
      success: true,
      data: {
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          avatar: customer.avatar,
          status: customer.status,
          isDeleted: customer.isDeleted,
          createdAt: customer.createdAt,
          lastLoginAt: customer.lastLoginAt,
        },
        statistics: {
          totalBookings,
          completedBookings,
          cancelledBookings,
          totalSpending,
          averageBookingValue,
        },
        bookingHistory: customer.bookings.map((b) => ({
          id: b.id,
          vehicle: b.vehicle,
          service: b.service,
          pickupLocation: b.pickupLocation,
          destination: b.destination,
          startDate: b.startDate,
          endDate: b.endDate,
          totalAmount: b.totalAmount,
          status: b.status,
          paymentStatus: b.payment?.status || 'PENDING',
          createdAt: b.createdAt,
        })),
        paymentHistory: payments,
      },
    });
  } catch (error: any) {
    console.error('Error fetching customer detail:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy chi tiết khách hàng', data: null });
  }
};

// 3. Update Customer Information (Name, Phone, Email, Status)
export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, status } = req.body;
    const admin = (req as any).user;

    const existing = await prisma.user.findFirst({ where: { id, role: 'CUSTOMER' } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng', data: null });
      return;
    }

    // Check email duplication if changed
    if (email && email.toLowerCase() !== existing.email.toLowerCase()) {
      const duplicateEmail = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (duplicateEmail) {
        res.status(400).json({ success: false, message: 'Email này đã được sử dụng bởi tài khoản khác', data: null });
        return;
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        email: email !== undefined ? email.toLowerCase() : existing.email,
        phone: phone !== undefined ? phone : existing.phone,
        status: status !== undefined ? status : existing.status,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        status: true,
        updatedAt: true,
      },
    });

    // Audit Log
    await logAudit({
      adminId: admin?.userId,
      adminEmail: admin?.email,
      action: 'CUSTOMER_UPDATE',
      resource: 'CUSTOMER',
      resourceId: id,
      details: { before: { name: existing.name, email: existing.email, phone: existing.phone, status: existing.status }, after: updated },
      req,
    });

    res.status(200).json({
      success: true,
      message: `Đã cập nhật thông tin khách hàng ${updated.name || updated.email} thành công`,
      data: { customer: updated },
    });
  } catch (error: any) {
    console.error('Error updating customer:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi cập nhật khách hàng', data: null });
  }
};

// 4. Update Customer Status (Suspend, Activate, Block)
export const updateCustomerStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const admin = (req as any).user;

    const customer = await prisma.user.findFirst({ where: { id, role: 'CUSTOMER' } });
    if (!customer) {
      res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng', data: null });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, name: true, email: true, status: true },
    });

    const actionName = status === 'SUSPENDED' ? 'CUSTOMER_SUSPEND' : status === 'BLOCKED' ? 'CUSTOMER_BLOCK' : 'CUSTOMER_ACTIVATE';

    await logAudit({
      adminId: admin?.userId,
      adminEmail: admin?.email,
      action: actionName,
      resource: 'CUSTOMER',
      resourceId: id,
      details: { previousStatus: customer.status, newStatus: status, reason },
      req,
    });

    const statusText = status === 'ACTIVE' ? 'Kích hoạt' : status === 'SUSPENDED' ? 'Tạm dừng' : 'Khoá';

    res.status(200).json({
      success: true,
      message: `Đã ${statusText} tài khoản khách hàng thành công`,
      data: { customer: updated },
    });
  } catch (error: any) {
    console.error('Error changing customer status:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi cập nhật trạng thái', data: null });
  }
};

// 5. Delete Customer (Soft-Delete with Data Integrity Guard)
export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const admin = (req as any).user;

    const customer = await prisma.user.findFirst({
      where: { id, role: 'CUSTOMER' },
      include: { bookings: { select: { id: true } } },
    });

    if (!customer) {
      res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng', data: null });
      return;
    }

    // Always perform soft-delete to preserve business integrity and history
    await prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        status: 'BLOCKED',
      },
    });

    await logAudit({
      adminId: admin?.userId,
      adminEmail: admin?.email,
      action: 'CUSTOMER_SOFT_DELETE',
      resource: 'CUSTOMER',
      resourceId: id,
      details: { totalBookingsPreserved: customer.bookings.length },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Đã vô hiệu hoá tài khoản khách hàng an toàn. Toàn bộ lịch sử đặt xe và thanh toán được bảo lưu.',
      data: null,
    });
  } catch (error: any) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xoá khách hàng', data: null });
  }
};
