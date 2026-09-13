import { prisma } from '../src/prisma';
import bcrypt from 'bcrypt';
import { VehicleType, VehicleStatus } from '@prisma/client';

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Admin
  const adminPassword = await bcrypt.hash('ledung123@', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin123' },
    update: { password: adminPassword, role: 'ADMIN', name: 'Admin' },
    create: {
      email: 'admin123',
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
      name: 'Mitsubishi Xpander Premium 2023',
      brand: 'Mitsubishi',
      model: 'Xpander Premium',
      licensePlate: '51L-123.45',
      seatCount: 7,
      year: 2023,
      type: VehicleType.SEAT_7,
      basePrice: 900000,
      status: VehicleStatus.AVAILABLE,
      description: 'MPV 7 chỗ rộng rãi, gầm cao, máy êm, phù hợp cho gia đình đông người và du lịch.',
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
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
      description: 'SUV 7 chỗ hầm hố, động cơ dầu mạnh mẽ, vượt mọi địa hình, sang trọng đẳng cấp.',
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'
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
        transactionId: 'VNPAY-TRANS-987654'
      }
    });

    console.log('✅ Sample bookings & payments seeded successfully');
  }

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
