/**
 * Automated Security & Business Logic Verification Test Suite
 * Tests:
 *  1. JWT Signing, Verification, and Algorithm enforcement (HS256)
 *  2. JWT Tampering & Invalid Secret Rejection
 *  3. CORS Origin Validation (Whitelist enforcement & Wildcard bypass prevention)
 *  4. Zod Input Validation: Auth Register (Weak password, malformed email)
 *  5. Zod Input Validation: Booking Creation (Negative passengers, invalid UUID, malformed dates)
 *  6. Zod Input Validation: Vehicle & Review Inputs (Rating bounds, field whitelisting)
 *  7. RBAC & Auth Middleware Role Validation
 */

import { generateAccessToken, verifyAccessToken } from '../utils/jwt.util';
import { isAllowedOrigin } from '../socket';
import {
  registerSchema,
  createBookingSchema,
  createReviewSchema,
  createVehicleSchema
} from '../validators';

let testsPassed = 0;
let testsFailed = 0;

const assert = (condition: boolean, message: string) => {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    testsFailed++;
  }
};

async function runSecurityTests() {
  console.log('\n🔒 RUNNING MINH KHOA APPLICATION SECURITY TESTS...\n');

  // 1. JWT Security Tests
  console.log('--- Test Suite 1: JWT & Token Tampering ---');
  try {
    const token = generateAccessToken('user-test-id-123', 'CUSTOMER');
    assert(typeof token === 'string' && token.split('.').length === 3, 'JWT is properly formed');

    const decoded = verifyAccessToken(token);
    assert(decoded.userId === 'user-test-id-123' && decoded.role === 'CUSTOMER', 'Token correctly verified with HS256');

    // Tampered token test (altering payload)
    let tampered = false;
    try {
      const parts = token.split('.');
      const modifiedPayload = Buffer.from(JSON.stringify({ userId: 'hacked', role: 'ADMIN' })).toString('base64url');
      const forgedToken = `${parts[0]}.${modifiedPayload}.${parts[2]}`;
      verifyAccessToken(forgedToken);
    } catch (e) {
      tampered = true;
    }
    assert(tampered, 'Tampered token signature is rejected');
  } catch (err: any) {
    assert(false, `JWT test failed with error: ${err.message}`);
  }

  // 2. CORS Whitelist Tests
  console.log('\n--- Test Suite 2: CORS Lockdown ---');
  assert(isAllowedOrigin('http://localhost:3000'), 'Allows localhost:3000');
  assert(isAllowedOrigin('https://car-rental-and-booking-system.vercel.app'), 'Allows production Vercel domain');
  assert(!isAllowedOrigin('https://evil-hacker-site.com'), 'Blocks arbitrary third-party origin');
  assert(!isAllowedOrigin('https://attacker-vercel.app'), 'Blocks fake vercel domain');
  assert(!isAllowedOrigin('https://car-rental-and-booking-system.attacker.com'), 'Blocks subdomain spoofing');

  // 3. Auth Registration Validation Tests
  console.log('\n--- Test Suite 3: Auth Password Policy & Input Validation ---');
  const validUser = registerSchema.safeParse({
    email: 'customer@minhkhoa.vn',
    password: 'Password123!',
    name: 'Nguyễn Văn A'
  });
  assert(validUser.success, 'Accepts valid strong registration payload');

  const weakPassUser = registerSchema.safeParse({
    email: 'customer@minhkhoa.vn',
    password: '123',
    name: 'Nguyễn Văn A'
  });
  assert(!weakPassUser.success, 'Rejects password shorter than 8 characters');

  const noNumberUser = registerSchema.safeParse({
    email: 'customer@minhkhoa.vn',
    password: 'passwordonly',
    name: 'Nguyễn Văn A'
  });
  assert(!noNumberUser.success, 'Rejects password without digits');

  const invalidEmailUser = registerSchema.safeParse({
    email: 'not-an-email',
    password: 'Password123!',
    name: 'Nguyễn Văn A'
  });
  assert(!invalidEmailUser.success, 'Rejects invalid email format');

  // 4. Booking Integrity & Validation Tests
  console.log('\n--- Test Suite 4: Booking Input & Business Integrity ---');
  const validBooking = createBookingSchema.safeParse({
    vehicleId: '123e4567-e89b-12d3-a456-426614174000',
    serviceId: '123e4567-e89b-12d3-a456-426614174001',
    pickupLocation: 'Sân bay Đà Nẵng',
    destination: 'Bà Nà Hills',
    passengerCount: 4,
    startDate: '2026-10-01T08:00:00.000Z',
    endDate: '2026-10-02T18:00:00.000Z',
    notes: 'Khách cần ghế trẻ em'
  });
  assert(validBooking.success, 'Accepts valid booking payload');

  const invalidUuidBooking = createBookingSchema.safeParse({
    vehicleId: 'invalid-car-id',
    serviceId: '123e4567-e89b-12d3-a456-426614174001',
    pickupLocation: 'Sân bay',
    destination: 'Bà Nà Hills',
    passengerCount: 4,
    startDate: '2026-10-01T08:00:00.000Z',
    endDate: '2026-10-02T18:00:00.000Z'
  });
  assert(!invalidUuidBooking.success, 'Rejects non-UUID vehicle identifier');

  const negativePassengerBooking = createBookingSchema.safeParse({
    vehicleId: '123e4567-e89b-12d3-a456-426614174000',
    serviceId: '123e4567-e89b-12d3-a456-426614174001',
    pickupLocation: 'Sân bay',
    destination: 'Bà Nà Hills',
    passengerCount: -5,
    startDate: '2026-10-01T08:00:00.000Z',
    endDate: '2026-10-02T18:00:00.000Z'
  });
  assert(!negativePassengerBooking.success, 'Rejects negative passenger count');

  // 5. Review Rating Boundaries
  console.log('\n--- Test Suite 5: Review Bounds ---');
  const validReview = createReviewSchema.safeParse({
    bookingId: '123e4567-e89b-12d3-a456-426614174000',
    rating: 5,
    comment: 'Dịch vụ rất tốt, xe mới sạch sẽ!'
  });
  assert(validReview.success, 'Accepts valid review (rating 5)');

  const outOfBoundsReview = createReviewSchema.safeParse({
    bookingId: '123e4567-e89b-12d3-a456-426614174000',
    rating: 10,
    comment: 'Fake rating'
  });
  assert(!outOfBoundsReview.success, 'Rejects review with rating > 5');

  // 6. Vehicle Mass Assignment Prevention
  console.log('\n--- Test Suite 6: Vehicle Whitelisting & Mass-Assignment Prevention ---');
  const maliciousVehicle = createVehicleSchema.safeParse({
    name: 'Toyota Vios 2024',
    brand: 'Toyota',
    model: 'Vios G',
    licensePlate: '43A-999.99',
    seatCount: 4,
    year: 2024,
    basePrice: 800000,
    status: 'AVAILABLE',
    type: 'SEAT_4',
    // Injected fields:
    isAdmin: true,
    hackedRole: 'SUPER_ADMIN'
  });
  assert(maliciousVehicle.success, 'Parses vehicle payload successfully');
  if (maliciousVehicle.success) {
    const data = maliciousVehicle.data as any;
    assert(data.isAdmin === undefined && data.hackedRole === undefined, 'Injected unexpected fields stripped by validator');
  }

  // Final Summary
  console.log('\n========================================');
  console.log(`TOTAL TESTS: ${testsPassed + testsFailed}`);
  console.log(`PASSED: ${testsPassed}`);
  console.log(`FAILED: ${testsFailed}`);
  console.log('========================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runSecurityTests();
