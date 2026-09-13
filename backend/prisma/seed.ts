import { prisma } from '../src/prisma';
import bcrypt from 'bcrypt';
import { VehicleType, VehicleStatus } from '@prisma/client';

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Admin
  const adminPassword = await bcrypt.hash('ledung123@', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin123@gmail.com' },
    update: { password: adminPassword, role: 'ADMIN', name: 'Admin' },
    create: {
      email: 'admin123@gmail.com',
      password: adminPassword,
      role: 'ADMIN',
      name: 'Admin'
    }
  });
  console.log('✅ Admin user created/updated:', admin.email);

  // 2. Seed Customer
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@minhkhoa.com' },
    update: { password: customerPassword, role: 'CUSTOMER', name: 'Nguyễn Văn Khách' },
    create: {
      email: 'customer@minhkhoa.com',
      password: customerPassword,
      role: 'CUSTOMER',
      name: 'Nguyễn Văn Khách'
    }
  });
  console.log('✅ Customer user created/updated:', customer.email);

  // 3. Seed Services
  const servicesData = [
    {
      name: 'Thuê xe tự lái',
      slug: 'thue-xe-tu-lai',
      description: 'Dịch vụ thuê xe tự lái theo ngày hoặc dài hạn, giao xe tận nơi nhanh chóng, thủ tục đơn giản.',
      basePrice: 0,
      active: true
    },
    {
      name: 'Thuê xe có tài xế',
      slug: 'thue-xe-co-tai-xe',
      description: 'Tài xế chuyên nghiệp, lịch sự, thông thạo lộ trình, phục vụ tận tình chu đáo.',
      basePrice: 300000,
      active: true
    },
    {
      name: 'Đưa đón sân bay',
      slug: 'dua-don-san-bay',
      description: 'Dịch vụ đưa đón sân bay đúng giờ, đón tiễn tận sảnh, giá cố định không phụ phí.',
      basePrice: 200000,
      active: true
    },
    {
      name: 'Thuê xe du lịch & sự kiện',
      slug: 'thue-xe-du-lich-su-kien',
      description: 'Phục vụ tour du lịch, cưới hỏi, công tác liên tỉnh với dàn xe đời mới sang trọng.',
      basePrice: 500000,
      active: true
    }
  ];

  for (const s of servicesData) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: s,
      create: s
    });
  }
  console.log('✅ Services seeded successfully');

  // 4. Seed Vehicles
  const vehiclesData = [
    {
      name: 'Toyota Vios G 2023',
      brand: 'Toyota',
      model: 'Vios G',
      licensePlate: '51K-888.66',
      seatCount: 4,
      year: 2023,
      type: VehicleType.SEAT_4,
      basePrice: 700000,
      status: VehicleStatus.AVAILABLE,
      description: 'Sedan 4 chỗ nhỏ gọn, tiết kiệm nhiên liệu, phù hợp di chuyển trong đô thị và gia đình nhỏ.',
      image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Honda City RS 2024',
      brand: 'Honda',
      model: 'City RS',
      licensePlate: '51K-999.28',
      seatCount: 4,
      year: 2024,
      type: VehicleType.SEAT_4,
      basePrice: 750000,
      status: VehicleStatus.AVAILABLE,
      description: 'Thiết kế thể thao, nội thất tiện nghi, hệ thống an toàn Honda Sensing.',
      image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Kia Carnival VIP 7 Chỗ',
      brand: 'Kia',
      model: 'Carnival Royal',
      licensePlate: '51L-123.45',
      seatCount: 7,
      year: 2024,
      type: VehicleType.SEAT_7,
      basePrice: 1800000,
      status: VehicleStatus.AVAILABLE,
      description: 'MPV hạng sang cao cấp nhất, ghế thương gia, nội thất đẳng cấp dành cho VIP và gia đình.',
      image: '/images/cars/kia-carnival-black.jpg'
    },
    {
      name: 'Toyota Innova 7 Chỗ',
      brand: 'Toyota',
      model: 'Innova',
      licensePlate: '30F-045.60',
      seatCount: 7,
      year: 2023,
      type: VehicleType.SEAT_7,
      basePrice: 900000,
      status: VehicleStatus.AVAILABLE,
      description: 'MPV 7 chỗ rộng rãi, gầm cao, máy êm, phù hợp cho gia đình đông người và du lịch.',
      image: '/images/cars/toyota-innova-7seat.jpg'
    },
    {
      name: 'Toyota Fortuner Đội Xe',
      brand: 'Toyota',
      model: 'Fortuner Legender',
      licensePlate: '30G-721.22',
      seatCount: 7,
      year: 2023,
      type: VehicleType.SEAT_7,
      basePrice: 1300000,
      status: VehicleStatus.AVAILABLE,
      description: 'Dàn xe SUV 7 chỗ hiện đại, động cơ dầu mạnh mẽ, sang trọng và tiện nghi.',
      image: '/images/cars/toyota-fortuner-black-fleet.jpg'
    },
    {
      name: 'Toyota Fortuner Legender 2023',
      brand: 'Toyota',
      model: 'Fortuner Legender',
      licensePlate: '51L-678.90',
      seatCount: 7,
      year: 2023,
      type: VehicleType.SEAT_7,
      basePrice: 1300000,
      status: VehicleStatus.AVAILABLE,
      description: 'SUV 7 chỗ hầm hố, động cơ dầu mạnh mẽ, sang trọng phục vụ công tác và du lịch.',
      image: '/images/cars/toyota-fortuner-black-fleet.jpg'
    },
    {
      name: 'Ford Transit Luxury 16 Chỗ (Đen)',
      brand: 'Ford',
      model: 'Transit Luxury',
      licensePlate: '29F-050.78',
      seatCount: 16,
      year: 2024,
      type: VehicleType.SEAT_16,
      basePrice: 1600000,
      status: VehicleStatus.AVAILABLE,
      description: 'Xe du lịch 16 chỗ màu đen sang trọng đỗ sảnh resort, ghế da ngả êm ái, phục vụ VIP.',
      image: '/images/cars/ford-transit-black.jpg'
    },
    {
      name: 'Ford Transit 16 Chỗ (Bạc Showroom)',
      brand: 'Ford',
      model: 'Transit Mid',
      licensePlate: '29F-025.75',
      seatCount: 16,
      year: 2024,
      type: VehicleType.SEAT_16,
      basePrice: 1500000,
      status: VehicleStatus.AVAILABLE,
      description: 'Xe du lịch 16 chỗ màu bạc mới xuất xưởng, máy dầu bốc êm, trang bị hiện đại.',
      image: '/images/cars/ford-transit-silver-showroom.jpg'
    },
    {
      name: 'Ford Transit 16 Chỗ Xe Hợp Đồng',
      brand: 'Ford',
      model: 'Transit Standard',
      licensePlate: '29H-883.26',
      seatCount: 16,
      year: 2023,
      type: VehicleType.SEAT_16,
      basePrice: 1400000,
      status: VehicleStatus.AVAILABLE,
      description: 'Xe hợp đồng đưa đón đoàn, tour du lịch, công nhân viên và học sinh uy tín.',
      image: '/images/cars/ford-transit-silver-front.jpg'
    },
    {
      name: 'Ford Everest Titanium 4x4',
      brand: 'Ford',
      model: 'Everest Titanium',
      licensePlate: '51K-555.99',
      seatCount: 7,
      year: 2023,
      type: VehicleType.SEAT_7,
      basePrice: 1500000,
      status: VehicleStatus.AVAILABLE,
      description: 'Đỉnh cao SUV 7 chỗ, công nghệ dẫn đầu phân khúc, êm ái cách âm tuyệt hảo.',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Mercedes-Benz C300 AMG',
      brand: 'Mercedes-Benz',
      model: 'C300 AMG',
      licensePlate: '51K-666.88',
      seatCount: 4,
      year: 2023,
      type: VehicleType.SEAT_4,
      basePrice: 2500000,
      status: VehicleStatus.AVAILABLE,
      description: 'Xe sang cao cấp phục vụ đối tác, sự kiện, tiệc cưới, cảm giác lái đỉnh cao.',
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80'
    }
  ];

  for (const v of vehiclesData) {
    await prisma.vehicle.upsert({
      where: { licensePlate: v.licensePlate },
      update: v,
      create: v
    });
  }
  console.log('✅ Vehicles seeded successfully');

  // 5. Seed Bookings for Admin demonstration
  const sampleVehicle1 = await prisma.vehicle.findFirst({ where: { licensePlate: '51K-666.88' } });
  const sampleVehicle2 = await prisma.vehicle.findFirst({ where: { licensePlate: '51K-555.99' } });
  const sampleService = await prisma.service.findFirst();

  if (sampleVehicle1 && sampleVehicle2 && sampleService) {
    // Booking 1: Confirmed
    const b1 = await prisma.booking.upsert({
      where: { id: 'booking-demo-001' },
      update: {},
      create: {
        id: 'booking-demo-001',
        customerId: customer.id,
        vehicleId: sampleVehicle1.id,
        serviceId: sampleService.id,
        pickupLocation: 'Sảnh T1, Sân bay Quốc tế Nội Bài, Hà Nội',
        destination: 'Khách sạn Lotte, Liễu Giai, Ba Đình, Hà Nội',
        passengerCount: 2,
        startDate: new Date(Date.now() + 86400000),
        endDate: new Date(Date.now() + 172800000),
        totalAmount: 2500000,
        status: 'CONFIRMED',
        notes: 'Khách yêu cầu xe sạch mùi và có sạc điện thoại.'
      }
    });

    // Booking 2: Completed with payment for revenue display
    const b2 = await prisma.booking.upsert({
      where: { id: 'booking-demo-002' },
      update: {},
      create: {
        id: 'booking-demo-002',
        customerId: customer.id,
        vehicleId: sampleVehicle2.id,
        serviceId: sampleService.id,
        pickupLocation: 'Quận Cầu Giấy, TP. Hà Nội',
        destination: 'Sapa, Lào Cai (Chuyến đi gia đình 3 ngày)',
        passengerCount: 5,
        startDate: new Date(Date.now() - 259200000),
        endDate: new Date(Date.now() - 86400000),
        totalAmount: 4500000,
        status: 'COMPLETED',
        notes: 'Khách đi gia đình có trẻ nhỏ, lái xe cẩn thận.'
      }
    });

    // Payment for Booking 2
    await prisma.payment.upsert({
      where: { bookingId: b2.id },
      update: {},
      create: {
        bookingId: b2.id,
        amount: 4500000,
        method: 'BANK_TRANSFER',
        status: 'COMPLETED',
        paidAt: new Date(Date.now() - 250000000),
        transactionId: 'MB-TRANS-987654',
      }
    });

    console.log('✅ Sample bookings & payments seeded successfully');
  }

  // 6. Seed Additional Diverse Customers & Payments for Admin Showcase
  const customerList = [
    { name: 'Trần Thị Mai Phương', email: 'phuong.tran@gmail.com', phone: '0912345678', status: 'ACTIVE' as const },
    { name: 'Lê Hoàng Long', email: 'long.le@viettel.vn', phone: '0987654321', status: 'ACTIVE' as const },
    { name: 'Phạm Minh Tuấn', email: 'tuan.pham@fpt.com', phone: '0933221100', status: 'SUSPENDED' as const },
    { name: 'Đặng Thùy Dương', email: 'duong.dang@vinhomes.vn', phone: '0944556677', status: 'BLOCKED' as const },
    { name: 'Vũ Quốc Cường', email: 'cuong.vu@techcombank.com.vn', phone: '0977889900', status: 'ACTIVE' as const },
  ];

  const transitVehicle = await prisma.vehicle.findFirst({ where: { licensePlate: '29F-050.78' } });
  const innovaVehicle = await prisma.vehicle.findFirst({ where: { licensePlate: '30F-045.60' } });
  const fortunerVehicle = await prisma.vehicle.findFirst({ where: { licensePlate: '30G-721.22' } });

  for (let i = 0; i < customerList.length; i++) {
    const c = customerList[i];
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: { name: c.name, phone: c.phone, status: c.status, isDeleted: false },
      create: {
        email: c.email,
        name: c.name,
        phone: c.phone,
        status: c.status,
        role: 'CUSTOMER',
        password: customerPassword,
        lastLoginAt: new Date(Date.now() - (i + 1) * 3600000 * 24),
      }
    });

    // Seed bookings for active customers
    if (c.status === 'ACTIVE' && sampleService && innovaVehicle && transitVehicle) {
      const selectedVehicle = i % 2 === 0 ? transitVehicle : innovaVehicle;
      const amount = i % 2 === 0 ? 3200000 : 1800000;
      const bId = `booking-extra-00${i + 1}`;

      const newBooking = await prisma.booking.upsert({
        where: { id: bId },
        update: {},
        create: {
          id: bId,
          customerId: user.id,
          vehicleId: selectedVehicle.id,
          serviceId: sampleService.id,
          pickupLocation: 'Khu đô thị Vinhomes Ocean Park, Gia Lâm, Hà Nội',
          destination: 'Hạ Long, Quảng Ninh (2 ngày 1 đêm)',
          passengerCount: 4,
          startDate: new Date(Date.now() - (i + 2) * 86400000),
          endDate: new Date(Date.now() - (i + 1) * 86400000),
          totalAmount: amount,
          status: i === 0 ? 'COMPLETED' : i === 1 ? 'COMPLETED' : 'CONFIRMED',
        }
      });

      // Seed payment
      const pStatus = i === 0 ? 'COMPLETED' : i === 1 ? 'REFUNDED' : 'PENDING';
      const createdPayment = await prisma.payment.upsert({
        where: { bookingId: newBooking.id },
        update: { status: pStatus },
        create: {
          bookingId: newBooking.id,
          amount,
          method: 'BANK_TRANSFER',
          status: pStatus,
          paidAt: pStatus !== 'PENDING' ? new Date(Date.now() - (i + 2) * 80000000) : null,
          transactionId: `FT-${Date.now().toString(36).toUpperCase()}-${i + 10}`,
        }
      });

      // If refunded, seed refund record
      if (pStatus === 'REFUNDED') {
        const existingRefund = await prisma.refund.findFirst({ where: { paymentId: createdPayment.id } });
        if (!existingRefund) {
          await prisma.refund.create({
            data: {
              paymentId: createdPayment.id,
              amount,
              reason: 'Khách hàng thay đổi kế hoạch chuyến đi trước 48 giờ theo chính sách hủy miễn phí',
              adminId: admin.id,
              status: 'COMPLETED',
            }
          });
        }
      }
    }
  }
  console.log('✅ Rich customer & payment history seeded successfully');

  // 7. Seed Initial System Settings
  const defaultSettings = [
    {
      key: 'general',
      value: {
        companyName: 'Minh Khoa – Car Rental & Travel',
        logo: '/images/logo.png',
        websiteTitle: 'Minh Khoa | Cho Thuê Xe Tự Lái & Có Tài Xế Chuyên Nghiệp',
        websiteDescription: 'Dịch vụ cho thuê xe ô tô 4 - 45 chỗ đời mới, giao xe tận nơi, thủ tục đơn giản, uy tín hàng đầu.',
        hotline: '0988 888 888',
        email: 'contact@minhkhoa.com',
        address: 'Số 68 Đường Cầu Giấy, Quận Cầu Giấy, Hà Nội',
        workingHours: '06:00 - 23:00 (Hàng ngày, kể cả Lễ Tết)',
      }
    },
    {
      key: 'contact',
      value: {
        hotline: '0988 888 888',
        email: 'support@minhkhoa.com',
        facebook: 'https://facebook.com/minhkhoacarrental',
        zalo: 'https://zalo.me/0988888888',
        googleMaps: 'https://maps.google.com/?q=Hanoi',
        address: 'Số 68 Đường Cầu Giấy, Hà Nội',
      }
    },
    {
      key: 'booking',
      value: {
        minBookingDurationDays: 1,
        maxBookingDurationDays: 30,
        advanceBookingDays: 90,
        cancellationPolicy: 'Miễn phí hủy chuyến trước 24 giờ nhận xe. Hủy trong vòng 24h tính phí 30% giá trị hợp đồng.',
        lateReturnPolicyHourlyFee: 100000,
        requireAdminApproval: true,
        allowSelfDrive: true,
        allowDriverService: true,
      }
    },
    {
      key: 'payment',
      value: {
        cashEnabled: true,
        bankTransferEnabled: true,
        cardEnabled: false,
        eWalletEnabled: false,
        bankName: 'Ngân hàng Quân Đội (MB Bank)',
        accountName: 'CONG TY TNHH MINH KHOA TRAVEL',
        accountNumber: '0988888888',
        branch: 'Chi nhánh Cầu Giấy - Hà Nội',
        qrCodeUrl: '/images/qr-bank.png',
      }
    },
    {
      key: 'notifications',
      value: {
        emailBookingConfirmation: true,
        emailBookingCancellation: true,
        emailPaymentConfirmation: true,
        emailAdminAlerts: true,
      }
    },
    {
      key: 'security',
      value: {
        minPasswordLength: 8,
        requireUppercase: false,
        requireNumber: true,
        requireSpecialChar: false,
        sessionTimeoutMinutes: 60,
        maxLoginAttempts: 5,
        twoFactorEnabled: false,
      }
    }
  ];

  for (const s of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value, updatedBy: admin.email }
    });
  }
  console.log('✅ System settings initialized');

  // 8. Seed Sample Audit Logs
  const sampleLogs = [
    { action: 'ADMIN_LOGIN', resource: 'AUTH', details: { method: 'EMAIL_PASSWORD' }, adminEmail: admin.email, adminId: admin.id },
    { action: 'VEHICLE_UPDATE', resource: 'VEHICLE', resourceId: 'transit-16', details: { name: 'Ford Transit Luxury 16 Chỗ (Đen)' }, adminEmail: admin.email, adminId: admin.id },
    { action: 'PAYMENT_CONFIRM', resource: 'PAYMENT', resourceId: 'MB-TRANS-987654', details: { amount: 4500000 }, adminEmail: admin.email, adminId: admin.id },
    { action: 'SETTINGS_UPDATE', resource: 'SETTING', resourceId: 'booking', details: { minBookingDurationDays: 1 }, adminEmail: admin.email, adminId: admin.id },
  ];

  for (const log of sampleLogs) {
    await prisma.auditLog.create({
      data: {
        ...log,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      }
    });
  }
  console.log('✅ Sample audit logs seeded');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
