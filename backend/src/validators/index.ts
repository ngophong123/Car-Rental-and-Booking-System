import { z } from 'zod';

// ==================== AUTH VALIDATORS ====================
export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email({ message: 'Địa chỉ email không đúng định dạng' }),
  password: z
    .string()
    .min(8, { message: 'Mật khẩu phải có tối thiểu 8 ký tự' })
    .max(100, { message: 'Mật khẩu không được vượt quá 100 ký tự' })
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, { message: 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số' }),
  name: z.string().trim().min(2, { message: 'Tên phải có ít nhất 2 ký tự' }).max(100, { message: 'Tên tối đa 100 ký tự' })
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email({ message: 'Địa chỉ email không hợp lệ' }),
  password: z.string().min(1, { message: 'Vui lòng nhập mật khẩu' })
});

// ==================== BOOKING VALIDATORS ====================
export const createBookingSchema = z.object({
  vehicleId: z.string().uuid({ message: 'Mã phương tiện không hợp lệ' }),
  serviceId: z.string().uuid({ message: 'Mã dịch vụ không hợp lệ' }),
  pickupLocation: z.string().trim().min(2, { message: 'Điểm đón phải có ít nhất 2 ký tự' }).max(250),
  destination: z.string().trim().min(2, { message: 'Điểm đến phải có ít nhất 2 ký tự' }).max(250),
  passengerCount: z.coerce.number().int().min(1, { message: 'Số hành khách tối thiểu là 1' }).max(60, { message: 'Số hành khách tối đa là 60' }),
  startDate: z.string().datetime({ message: 'Thời gian bắt đầu không hợp lệ (ISO format)' }),
  endDate: z.string().datetime({ message: 'Thời gian kết thúc không hợp lệ (ISO format)' }),
  notes: z.string().trim().max(1000, { message: 'Ghi chú tối đa 1000 ký tự' }).optional().nullable()
});

export const updateBookingStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'ASSIGNED',
    'DRIVER_ACCEPTED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'REJECTED'
  ], { message: 'Trạng thái đặt xe không hợp lệ' })
});

export const assignDriverSchema = z.object({
  driverId: z.string().uuid({ message: 'Mã tài xế không hợp lệ' })
});

export const driverTripStatusSchema = z.object({
  status: z.enum(['DRIVER_ACCEPTED', 'IN_PROGRESS', 'COMPLETED'], {
    message: 'Trạng thái chuyến đi của tài xế không hợp lệ'
  })
});

// ==================== VEHICLE VALIDATORS ====================
export const createVehicleSchema = z.object({
  name: z.string().trim().min(2).max(100),
  brand: z.string().trim().min(1).max(50),
  model: z.string().trim().min(1).max(50),
  licensePlate: z.string().trim().min(4).max(20).toUpperCase(),
  seatCount: z.coerce.number().int().min(2).max(60),
  year: z.coerce.number().int().min(1990).max(2035),
  image: z.string().trim().max(10000000, { message: 'Dung lượng ảnh vượt quá giới hạn' }).refine(
    (val) => !val || val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:image/'),
    { message: 'Ảnh xe phải là đường dẫn URL hoặc ảnh tải lên hợp lệ' }
  ).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  basePrice: z.coerce.number().min(0, { message: 'Giá thuê phải lớn hơn hoặc bằng 0' }),
  status: z.enum(['AVAILABLE', 'BOOKED', 'IN_TRIP', 'MAINTENANCE', 'INACTIVE']).default('AVAILABLE'),
  type: z.enum(['SEAT_4', 'SEAT_7', 'SEAT_16', 'SEAT_29', 'SEAT_45']).default('SEAT_4')
});

export const updateVehicleSchema = createVehicleSchema.partial();

export const vehicleQuerySchema = z.object({
  status: z.enum(['AVAILABLE', 'BOOKED', 'IN_TRIP', 'MAINTENANCE', 'INACTIVE']).optional(),
  type: z.enum(['SEAT_4', 'SEAT_7', 'SEAT_16', 'SEAT_29', 'SEAT_45']).optional(),
  minSeats: z.coerce.number().int().min(1).optional(),
  maxSeats: z.coerce.number().int().max(60).optional()
});

// ==================== DRIVER VALIDATORS ====================
export const createDriverSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).regex(/^(?=.*[a-zA-Z])(?=.*\d)/),
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^[0-9+() -]{9,20}$/, { message: 'Số điện thoại không hợp lệ' }),
  licenseNumber: z.string().trim().min(4).max(50),
  licenseType: z.string().trim().min(2).max(20),
  licenseExpiryDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/))
});

export const updateDriverStatusSchema = z.object({
  status: z.enum(['AVAILABLE', 'ASSIGNED', 'ON_TRIP', 'OFF_DUTY'])
});

// ==================== SERVICE VALIDATORS ====================
export const createServiceSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(100).toLowerCase().regex(/^[a-z0-9-]+$/, { message: 'Slug chỉ chứa chữ thường, số và dấu gạch ngang' }),
  description: z.string().trim().max(2000).optional().nullable(),
  image: z.string().trim().url().optional().nullable(),
  basePrice: z.coerce.number().min(0).default(0),
  active: z.boolean().default(true)
});

export const updateServiceSchema = createServiceSchema.partial();

// ==================== REVIEW VALIDATORS ====================
export const createReviewSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5, { message: 'Đánh giá phải từ 1 đến 5 sao' }),
  comment: z.string().trim().max(1000).optional().nullable()
});

// ==================== PAYMENT VALIDATORS ====================
export const createPaymentSchema = z.object({
  bookingId: z.string().uuid(),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'ONLINE']).default('BANK_TRANSFER'),
  transactionCode: z.string().trim().max(50).regex(/^[a-zA-Z0-9_-]*$/, { message: 'Mã giao dịch chỉ chứa chữ, số, gạch ngang' }).optional().nullable(),
  clientTimestamp: z.coerce.number().optional(),
  deviceFingerprint: z.string().trim().max(200).optional()
});

// ==================== AI CHAT VALIDATORS ====================
export const aiChatSchema = z.object({
  message: z.string().trim().min(1, { message: 'Tin nhắn không được để trống' }).max(1000, { message: 'Tin nhắn tối đa 1000 ký tự' })
});

// ==================== COMMON PARAMS VALIDATORS ====================
export const uuidParamSchema = z.object({
  id: z.string().uuid({ message: 'Định danh ID phải theo chuẩn UUID' })
});

// ==================== ADMIN CUSTOMER VALIDATORS ====================
export const adminCustomerQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional(),
  status: z.enum(['ALL', 'ACTIVE', 'SUSPENDED', 'BLOCKED']).default('ALL'),
  dateRange: z.enum(['all', 'today', 'this_week', 'this_month', 'custom']).default('all'),
  sortBy: z.enum(['newest', 'oldest', 'most_bookings', 'highest_spending']).default('newest')
});

export const updateCustomerSchema = z.object({
  name: z.string().trim().min(2, { message: 'Tên phải từ 2 ký tự' }).max(100).optional(),
  email: z.string().trim().toLowerCase().email({ message: 'Email không đúng định dạng' }).optional(),
  phone: z.string().trim().regex(/^[0-9+() -]{9,20}$/, { message: 'Số điện thoại không hợp lệ' }).optional().nullable(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'BLOCKED']).optional()
});

export const updateCustomerStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'BLOCKED'], { message: 'Trạng thái không hợp lệ' }),
  reason: z.string().trim().max(500).optional()
});

// ==================== ADMIN PAYMENT VALIDATORS ====================
export const adminPaymentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional(),
  status: z.enum(['ALL', 'PENDING', 'PAID', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED']).default('ALL'),
  method: z.enum(['ALL', 'CASH', 'BANK_TRANSFER', 'ONLINE']).default('ALL'),
  dateRange: z.enum(['all', 'today', 'this_week', 'this_month', 'custom']).default('all'),
  minAmount: z.coerce.number().min(0).optional(),
  maxAmount: z.coerce.number().min(0).optional()
});

export const updatePaymentStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'], { message: 'Trạng thái không hợp lệ' }),
  note: z.string().trim().max(500).optional()
});

export const refundPaymentSchema = z.object({
  amount: z.coerce.number().positive({ message: 'Số tiền hoàn phải lớn hơn 0' }),
  reason: z.string().trim().min(3, { message: 'Vui lòng nhập lý do hoàn tiền từ 3 ký tự' }).max(500)
});

// ==================== ADMIN PROFILE & SECURITY VALIDATORS ====================
export const adminChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Vui lòng nhập mật khẩu hiện tại' }),
  newPassword: z.string().min(8, { message: 'Mật khẩu mới tối thiểu 8 ký tự' }).regex(/^(?=.*[a-zA-Z])(?=.*\d)/, { message: 'Mật khẩu phải chứa ít nhất chữ và số' }),
  confirmPassword: z.string().min(1, { message: 'Vui lòng xác nhận mật khẩu mới' })
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Xác nhận mật khẩu mới không khớp',
  path: ['confirmPassword']
});

export const adminUpdateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  avatar: z.string().trim().max(10000000).optional().nullable(),
  phone: z.string().trim().regex(/^[0-9+() -]{9,20}$/, { message: 'Số điện thoại không hợp lệ' }).optional().nullable()
});

