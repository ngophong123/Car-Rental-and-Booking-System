import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalCustomers,
      availableVehicles,
      maintenanceVehicles,
      pendingBookings,
      todaysBookings,
      activeTrips,
      monthlyRevenueResult
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
      prisma.vehicle.count({ where: { status: 'MAINTENANCE' } }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({
        where: {
          createdAt: { gte: today }
        }
      }),
      prisma.booking.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.booking.aggregate({
        where: {
          status: { in: ['COMPLETED', 'CONFIRMED'] },
          createdAt: { gte: firstDayOfMonth }
        },
        _sum: {
          totalAmount: true
        }
      })
    ]);

    const stats = {
      totalCustomers,
      availableVehicles,
      maintenanceVehicles,
      pendingBookings,
      todaysBookings,
      activeTrips,
      monthlyRevenue: monthlyRevenueResult._sum.totalAmount || 0
    };

    res.status(200).json({ success: true, message: 'Stats retrieved', data: { stats } });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy số liệu thống kê', data: null });
  }
};

export const getDashboardCharts = async (req: Request, res: Response): Promise<void> => {
  try {
    // Generate data for the last 7 days
    const days = 7;
    const chartData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const startOfDay = new Date();
      startOfDay.setDate(startOfDay.getDate() - i);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(startOfDay);
      endOfDay.setHours(23, 59, 59, 999);

      const [bookingsCount, revenueSum] = await Promise.all([
        prisma.booking.count({
          where: {
            createdAt: { gte: startOfDay, lte: endOfDay }
          }
        }),
        prisma.booking.aggregate({
          where: {
            status: { in: ['COMPLETED', 'CONFIRMED'] },
            createdAt: { gte: startOfDay, lte: endOfDay }
          },
          _sum: { totalAmount: true }
        })
      ]);

      chartData.push({
        date: startOfDay.toISOString().split('T')[0],
        bookings: bookingsCount,
        revenue: revenueSum._sum.totalAmount || 0
      });
    }

    res.status(200).json({ success: true, message: 'Chart data retrieved', data: { chartData } });
  } catch (error) {
    console.error('Error fetching dashboard charts:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi tải biểu đồ', data: null });
  }
};
