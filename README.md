You are a senior Full-Stack Engineer, Software Architect, UI/UX Engineer and DevOps Engineer.

I want you to help me build a production-quality portfolio project called:

"Minh Khoa Transportation & Vehicle Rental Management System"

This is a full-stack web application for a transportation company that provides:

- Tourist vehicle rental
- Airport pickup/drop-off
- Wedding transportation
- Employee transportation
- Student transportation
- Business/work transportation
- 4-seat, 7-seat, 16-seat, 29-seat and 45-seat vehicles

The goal of this project is NOT to build a simple company introduction website.

The goal is to build a realistic transportation booking and fleet management system that can be used as a strong Full-Stack Developer portfolio project.

==================================================
1. IMPORTANT DEVELOPMENT RULES
==================================================

Follow these rules throughout the entire project.

1. Do NOT build everything at once.

Build the project in clearly separated phases.

Phase 1:
Project architecture + infrastructure

Phase 2:
Public company website

Phase 3:
Authentication + authorization

Phase 4:
Vehicle/fleet management

Phase 5:
Booking system

Phase 6:
Driver management

Phase 7:
Admin dashboard

Phase 8:
Real-time booking with Socket.IO

Phase 9:
Redis integration

Phase 10:
Notifications + payment-ready architecture

Phase 11:
Testing

Phase 12:
Docker + production deployment configuration

After completing each phase:
- Explain what was implemented
- Explain the files created/modified
- Explain how to run it
- Explain how to test it
- Identify possible issues
- Wait for confirmation before making major architectural changes

Do NOT skip directly to later phases.

2. Before writing code:
- Inspect the current project structure.
- If the project is empty, create the project structure.
- Do not overwrite existing files unnecessarily.
- Do not delete existing code without explaining why.
- Reuse existing code when appropriate.

3. Do not use fake architecture just to make the project look complicated.

Every technology must have a real purpose.

4. Prefer clean, maintainable and understandable code over extremely complex code.

5. Use TypeScript throughout frontend and backend.

6. Use environment variables for secrets and configuration.

7. NEVER hardcode:
- JWT secrets
- database passwords
- API keys
- payment credentials
- private keys

8. Add proper validation on both frontend and backend.

9. Add proper error handling.

10. Use consistent API response formats.

11. Use meaningful naming conventions.

12. Add comments only when they explain non-obvious logic.

13. Do not create unnecessary files.

14. Before implementing a feature, briefly explain:
- What problem it solves
- Database changes
- API changes
- Frontend changes
- Important business logic

==================================================
2. TECHNOLOGY STACK
==================================================

Frontend:

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zustand
- React Hook Form
- Zod

Backend:

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt
- Socket.IO

Infrastructure:

- Docker
- Docker Compose
- Redis
- Nginx

Testing:

- Jest
- Supertest
- React Testing Library
- Playwright if appropriate

Code quality:

- ESLint
- Prettier
- Husky if useful

Version control:

- Git
- GitHub

==================================================
3. HIGH-LEVEL ARCHITECTURE
==================================================

Use this architecture:

                         CLIENT
                           |
                           v
                    Next.js Frontend
                           |
                           | HTTP / REST API
                           v
                    Node.js + Express
                           |
             +-------------+-------------+
             |             |             |
             v             v             v
        PostgreSQL       Redis       Socket.IO
             |
             v
       Persistent Data


Docker Compose should eventually contain:

- frontend
- backend
- postgres
- redis
- nginx

Do not add services that are not necessary.

==================================================
4. PROJECT STRUCTURE
==================================================

Prefer a monorepo structure:

project-root/

  apps/
    web/
      Next.js application

    api/
      Node.js + Express API

  packages/
    shared/
      shared TypeScript types
      validation schemas
      constants

  docker/
    nginx/

  docs/

  docker-compose.yml

  .env.example

  README.md

  package.json

Use a clean modular backend architecture.

Suggested backend:

apps/api/src/

  config/
  controllers/
  services/
  repositories/
  routes/
  middleware/
  validators/
  schemas/
  utils/
  types/
  sockets/
  jobs/
  lib/
  app.ts
  server.ts

Frontend:

apps/web/

  app/
  components/
  features/
  hooks/
  lib/
  services/
  stores/
  types/
  validators/

Do not blindly follow this structure if another structure is clearly better.
Explain architectural decisions when changing it.

==================================================
5. USER ROLES
==================================================

The system must support:

ADMIN
STAFF
DRIVER
CUSTOMER

Permissions:

ADMIN:
- Full system access
- Manage users
- Manage vehicles
- Manage drivers
- Manage services
- Manage bookings
- Manage pricing
- View analytics
- Manage system configuration

STAFF:
- Manage bookings
- View customers
- Assign vehicles
- Assign drivers
- View vehicle availability
- Update booking status

DRIVER:
- View assigned trips
- View customer information required for the trip
- Update trip status
- View schedule

CUSTOMER:
- Register
- Login
- View vehicles
- Search available vehicles
- Create booking
- View booking history
- View booking details
- Cancel eligible bookings
- Receive notifications

Implement proper Role-Based Access Control.

Never rely only on frontend role checking.

The backend must enforce authorization.

==================================================
6. AUTHENTICATION
==================================================

Implement:

- Register
- Login
- Logout
- Access token
- Refresh token
- Password hashing using bcrypt
- Protected routes
- Role-based authorization

Use secure token handling.

Do not store plaintext passwords.

Implement:

POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me

Return consistent API responses.

Example:

{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {},
    "accessToken": "..."
  },
  "errors": null
}

For validation errors:

{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "errors": {}
}

==================================================
7. DATABASE DESIGN
==================================================

Use PostgreSQL + Prisma.

Main entities:

User
Role
Vehicle
VehicleType
Driver
Service
Booking
BookingStatus
Payment
Notification
Review
RefreshToken
VehicleMaintenance
Trip

Potential relationships:

User
  |
  +---- Customer
  |
  +---- Driver

Vehicle
  |
  +---- VehicleType
  |
  +---- VehicleMaintenance
  |
  +---- Booking

Booking
  |
  +---- Customer
  +---- Vehicle
  +---- Driver
  +---- Service
  +---- Payment
  +---- Trip
  +---- Notifications

==================================================
8. VEHICLE MODEL
==================================================

Vehicle fields should include appropriate fields such as:

- id
- name
- brand
- model
- licensePlate
- seatCount
- year
- image
- description
- basePrice
- status
- createdAt
- updatedAt

Vehicle status:

AVAILABLE
BOOKED
IN_TRIP
MAINTENANCE
INACTIVE

Vehicle types:

4_SEAT
7_SEAT
16_SEAT
29_SEAT
45_SEAT

Admin must be able to:

- Create vehicle
- Update vehicle
- Delete/deactivate vehicle
- Upload vehicle image
- Change status
- Search vehicles
- Filter by seat count
- Filter by status

==================================================
9. DRIVER MANAGEMENT
==================================================

Driver fields:

- id
- userId
- fullName
- phone
- licenseNumber
- licenseType
- licenseExpiryDate
- status
- createdAt
- updatedAt

Driver statuses:

AVAILABLE
ASSIGNED
ON_TRIP
OFF_DUTY

Admin/Staff can:

- Add driver
- Update driver
- Assign driver
- View driver schedule
- View trip history
- Deactivate driver

==================================================
10. SERVICES
==================================================

Services:

1. Tourist vehicle rental
2. Airport transfer
3. Wedding transportation
4. Employee transportation
5. Student transportation
6. Business transportation

Service model:

- id
- name
- slug
- description
- image
- basePrice
- active
- createdAt
- updatedAt

==================================================
11. BOOKING SYSTEM
==================================================

This is the core feature.

Customer should be able to enter:

- Pickup location
- Destination
- Service type
- Vehicle type
- Number of passengers
- Start date
- Start time
- End date
- End time
- Additional notes

Example:

Pickup:
Hanoi

Destination:
Noi Bai International Airport

Service:
Airport Transfer

Passengers:
8

Vehicle:
16-seat

Date:
2026-09-15

Time:
08:00

==================================================
12. VEHICLE AVAILABILITY
==================================================

The backend must check vehicle availability.

A vehicle must NOT be available if another confirmed booking overlaps with the requested time.

Do not rely on frontend checks.

Availability must be checked on the backend.

Important:

Two customers may attempt to book the same vehicle at almost exactly the same time.

The backend must protect against double booking.

Use appropriate database transaction / locking / constraint strategy.

The booking process should be atomic:

1. Validate request
2. Check customer
3. Find available vehicle
4. Check time conflict
5. Create booking
6. Assign vehicle
7. Commit transaction

If something fails:
- Roll back the transaction

==================================================
13. BOOKING STATUS
==================================================

Booking statuses:

PENDING
CONFIRMED
ASSIGNED
DRIVER_ACCEPTED
IN_PROGRESS
COMPLETED
CANCELLED
REJECTED

Booking lifecycle:

PENDING
   ↓
CONFIRMED
   ↓
ASSIGNED
   ↓
DRIVER_ACCEPTED
   ↓
IN_PROGRESS
   ↓
COMPLETED

Possible cancellation:

PENDING → CANCELLED

CONFIRMED → CANCELLED

Implement business rules so users cannot arbitrarily change status.

==================================================
14. BOOKING API
==================================================

Suggested APIs:

GET    /api/bookings
GET    /api/bookings/:id
POST   /api/bookings
PATCH  /api/bookings/:id
POST   /api/bookings/:id/cancel

Admin/Staff:

PATCH /api/bookings/:id/confirm
PATCH /api/bookings/:id/assign-vehicle
PATCH /api/bookings/:id/assign-driver
PATCH /api/bookings/:id/reject

Driver:

PATCH /api/bookings/:id/accept
PATCH /api/bookings/:id/start
PATCH /api/bookings/:id/complete

Add proper authorization.

==================================================
15. PRICING SYSTEM
==================================================

Do not hardcode prices directly inside React components.

Pricing should come from backend/database.

Basic pricing concept:

totalPrice =
basePrice
+ distanceFee
+ serviceFee
+ extraTimeFee
+ additionalFee

Design the pricing service so it can be extended later.

For example:

calculateBookingPrice()

should be isolated from the controller.

==================================================
16. CUSTOMER WEBSITE
==================================================

Create a professional transportation company website.

Pages:

/
 /about
 /services
 /services/[slug]
 /vehicles
 /vehicles/[id]
 /booking
 /contact
 /login
 /register
 /my-bookings
 /my-bookings/[id]

Homepage sections:

Hero
Services
Vehicle categories
Why choose us
How booking works
Featured vehicles
Customer reviews
Contact CTA
Footer

The design should look like a real transportation company website.

Do NOT make it look like a generic template.

Use:

- clean layout
- professional typography
- responsive design
- mobile friendly
- good spacing
- strong CTA buttons
- vehicle cards
- service cards
- booking form

==================================================
17. BOOKING UI
==================================================

Create a multi-step booking experience.

Step 1:
Enter trip information

Step 2:
Show available vehicles

Step 3:
Select vehicle

Step 4:
Review booking

Step 5:
Confirm booking

Example:

STEP 1
Trip details

STEP 2
Available vehicles

STEP 3
Select vehicle

STEP 4
Confirmation

STEP 5
Success

Show price calculation clearly.

==================================================
18. ADMIN DASHBOARD
==================================================

Create:

/admin

Dashboard sections:

Overview
Bookings
Vehicles
Drivers
Customers
Services
Payments
Reviews
Reports
Settings

Dashboard cards:

- Today's bookings
- Pending bookings
- Active trips
- Available vehicles
- Vehicles in maintenance
- Monthly revenue
- Total customers

Add charts for:

- Revenue
- Bookings
- Popular services
- Vehicle utilization

Use a professional dashboard UI.

==================================================
19. VEHICLE MANAGEMENT UI
==================================================

Admin page:

/admin/vehicles

Features:

- Table
- Search
- Pagination
- Filter
- Sort
- Create
- Edit
- Delete/deactivate
- Change status

Vehicle table:

Vehicle
License Plate
Seats
Price
Status
Current Driver
Actions

==================================================
20. DRIVER DASHBOARD
==================================================

Driver should have a separate dashboard.

Example:

/driver

Display:

Today's trips
Upcoming trips
Completed trips

Trip card:

Customer
Pickup
Destination
Time
Vehicle

Actions:

Accept trip
Start trip
Complete trip

==================================================
21. CUSTOMER DASHBOARD
==================================================

Customer dashboard:

/dashboard

Display:

Upcoming booking
Booking history
Current booking status
Profile

Booking card:

Booking ID
Service
Vehicle
Driver
Date
Time
Status
Price

==================================================
22. REAL-TIME FEATURES
==================================================

Use Socket.IO.

Real-time features:

1. Vehicle availability
2. Booking status
3. Driver status
4. Admin notifications
5. Customer booking updates

Example:

Customer A books:

Ford Transit

Customer B is currently viewing available vehicles.

When Customer A successfully books the vehicle:

Customer B should receive a real-time update.

Example event:

vehicle:availability_changed

Frontend should update without page refresh.

==================================================
23. SOCKET.IO ARCHITECTURE
==================================================

Use rooms where appropriate.

Possible rooms:

user:{userId}
booking:{bookingId}
admin
driver:{driverId}

Events:

booking:created
booking:confirmed
booking:cancelled
booking:assigned
booking:status_changed
vehicle:availability_changed
driver:status_changed
notification:new

Do not put business logic directly inside socket handlers.

Socket handlers should call services.

==================================================
24. REDIS
==================================================

Use Redis only where it provides real value.

Potential use cases:

- caching vehicle availability
- session-related temporary data if necessary
- rate limiting
- Socket.IO adapter for horizontal scaling
- temporary booking state

Do not introduce Redis everywhere just to make the project look advanced.

Explain every Redis use case.

==================================================
25. NOTIFICATIONS
==================================================

Implement in-app notifications.

Notification model:

- id
- userId
- type
- title
- message
- read
- createdAt

Examples:

Customer:

"Your booking has been confirmed."

Driver:

"You have been assigned a new trip."

Admin:

"New booking received."

Implement:

GET /api/notifications
PATCH /api/notifications/:id/read
PATCH /api/notifications/read-all

Use Socket.IO for real-time notification delivery.

==================================================
26. PAYMENT ARCHITECTURE
==================================================

Do not integrate a real payment provider initially.

Create a payment-ready architecture.

Payment statuses:

PENDING
PAID
FAILED
REFUNDED

Payment methods:

CASH
BANK_TRANSFER
ONLINE

Create a Payment service abstraction so a real provider can be integrated later.

==================================================
27. REVIEW SYSTEM
==================================================

After completed trips, customers can leave reviews.

Review:

- rating 1-5
- comment
- customer
- booking
- createdAt

Only customers who completed a booking can review.

Prevent duplicate reviews for the same booking.

==================================================
28. GOOGLE MAPS / LOCATION
==================================================

Design the booking system so pickup and destination can later support map integration.

Initially:
- Store pickup text
- Store destination text
- Store latitude/longitude optionally

Do NOT require a paid API during initial development.

Create an abstraction for map/distance services.

==================================================
29. SECURITY
==================================================

Implement:

- password hashing
- JWT authentication
- refresh token rotation where appropriate
- authorization middleware
- input validation
- rate limiting
- CORS
- Helmet
- secure cookies if used
- SQL injection protection through Prisma
- request size limits
- proper error handling

Never expose:

- passwords
- password hashes
- refresh token secrets
- internal errors
- database credentials

==================================================
30. ERROR HANDLING
==================================================

Create centralized backend error handling.

Use appropriate HTTP status codes.

Examples:

400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
500 Internal Server Error

Handle booking conflicts using:

409 Conflict

Example:

{
  "success": false,
  "message": "The selected vehicle is no longer available.",
  "data": null,
  "errors": null
}

==================================================
31. API DOCUMENTATION
==================================================

Document the API.

Use Swagger/OpenAPI if appropriate.

Document:

- Authentication
- Users
- Vehicles
- Drivers
- Services
- Bookings
- Payments
- Notifications

Each endpoint should include:

- method
- URL
- request body
- query parameters
- response
- authentication requirement
- possible errors

==================================================
32. DATABASE SEED
==================================================

Create seed data.

Example accounts:

Admin
admin@example.com

Staff
staff@example.com

Driver
driver@example.com

Customer
customer@example.com

Use environment variables or clearly documented development credentials.

NEVER use real production passwords.

Seed:

- users
- vehicles
- drivers
- services
- sample bookings
- sample reviews

Make the seed realistic.

==================================================
33. DOCKER
==================================================

Create Docker setup.

Services:

frontend
backend
postgres
redis
nginx

Create:

Dockerfile for frontend
Dockerfile for backend
docker-compose.yml
.env.example

Development command should ideally be simple.

Example:

docker compose up -d

Then:

docker compose logs -f

Document everything in README.

==================================================
34. ENVIRONMENT VARIABLES
==================================================

Create:

.env.example

Include variables such as:

DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
ACCESS_TOKEN_EXPIRES_IN=
REFRESH_TOKEN_EXPIRES_IN=
REDIS_URL=
NEXT_PUBLIC_API_URL=
SOCKET_URL=

Do not commit .env files.

Update .gitignore.

==================================================
35. TESTING
==================================================

Add tests for important business logic.

Backend:

- authentication
- registration
- login
- vehicle availability
- booking creation
- booking cancellation
- double booking prevention
- authorization

Frontend:

- booking form
- vehicle selection
- authentication UI
- dashboard components

E2E:

- customer login
- search vehicle
- create booking
- view booking

The most important test is:

Two users cannot successfully book the same vehicle for overlapping time periods.

==================================================
36. UI/UX REQUIREMENTS
==================================================

The UI must be:

- professional
- responsive
- accessible
- clean
- modern
- consistent

Use shadcn/ui components where appropriate.

Important states:

Loading
Empty
Error
Success
Disabled
Unauthorized
Not found

Do not leave pages blank during loading.

Use skeleton loaders when appropriate.

Forms must show validation errors clearly.

==================================================
37. RESPONSIVE DESIGN
==================================================

Support:

Mobile
Tablet
Desktop

Admin dashboard should also work on smaller screens.

Navigation should become mobile-friendly.

Tables should have responsive behavior.

==================================================
38. SEO
==================================================

For public pages implement:

- metadata
- title
- description
- Open Graph metadata
- semantic HTML
- sitemap if appropriate
- robots.txt

Use Next.js SEO capabilities.

==================================================
39. LOGGING
==================================================

Backend should have structured logging.

Log:

- HTTP requests
- important errors
- booking events
- authentication failures

Never log:

- passwords
- JWT secrets
- sensitive credentials

==================================================
40. README
==================================================

Create a professional README.

It should contain:

Project overview
Features
Architecture
Tech stack
Database architecture
Folder structure
Environment setup
Installation
Docker setup
Development commands
API documentation
Testing
Deployment
Screenshots section
Future improvements

Include architecture diagrams using Mermaid if useful.

==================================================
41. GIT WORKFLOW
==================================================

Use meaningful commits.

Example:

feat(auth): implement JWT authentication

feat(vehicle): implement fleet management

feat(booking): implement vehicle availability

feat(realtime): implement booking socket events

fix(booking): prevent overlapping vehicle bookings

docs: update setup instructions

==================================================
42. PORTFOLIO QUALITY
==================================================

The final project should demonstrate:

Frontend development
Backend development
Database design
REST API
Authentication
Authorization
Business logic
Real-time communication
Caching
Docker
Testing
DevOps concepts
Responsive UI
Clean architecture

This project should be something I can confidently show during a Full-Stack Developer interview.

==================================================
43. IMPORTANT BUSINESS LOGIC
==================================================

The most important business rule is:

A vehicle cannot have two overlapping CONFIRMED/ASSIGNED/DRIVER_ACCEPTED/IN_PROGRESS bookings.

Example:

Vehicle A:

09:00 → 12:00

Another booking:

10:00 → 11:00

This must be rejected.

But:

09:00 → 12:00

Another booking:

12:00 → 15:00

can be allowed depending on the defined business rule.

Implement this carefully.

Do not rely only on frontend validation.

==================================================
44. DEVELOPMENT APPROACH
==================================================

When I ask you to implement a feature:

Step 1:
Explain the feature.

Step 2:
Identify affected files.

Step 3:
Identify database changes.

Step 4:
Implement backend.

Step 5:
Implement frontend.

Step 6:
Add validation.

Step 7:
Add error handling.

Step 8:
Add tests.

Step 9:
Run/build/test the project.

Step 10:
Report the result.

Do not claim something works if you did not actually test it.

If a command fails:
- inspect the error
- identify the root cause
- fix it
- run the command again

==================================================
45. DO NOT OVERENGINEER
==================================================

Avoid unnecessary:

- microservices
- Kubernetes
- Kafka
- RabbitMQ
- GraphQL
- event sourcing
- CQRS

unless there is a clear reason.

This is a portfolio project but it should still resemble a realistic small/medium business application.

Prefer:

Modular Monolith

over:

Microservices

==================================================
46. PROJECT PHASES
==================================================

Implement in this order.

PHASE 1:
Architecture
Monorepo
Next.js
Express
PostgreSQL
Prisma
Docker
Environment configuration

PHASE 2:
Public website
Homepage
Services
Vehicles
About
Contact

PHASE 3:
Authentication
Register
Login
Logout
JWT
Refresh token
RBAC

PHASE 4:
Vehicle management
Vehicle CRUD
Vehicle status
Vehicle types
Images

PHASE 5:
Booking system
Booking form
Vehicle availability
Price calculation
Booking lifecycle
Double-booking protection

PHASE 6:
Driver system
Driver CRUD
Driver assignment
Driver dashboard
Trip status

PHASE 7:
Admin dashboard
Statistics
Bookings
Vehicles
Drivers
Customers
Services
Reports

PHASE 8:
Real-time
Socket.IO
Booking updates
Vehicle availability
Notifications

PHASE 9:
Redis
Caching
Rate limiting
Socket.IO scaling support

PHASE 10:
Payment-ready architecture
Payment records
Payment status
Payment abstraction

PHASE 11:
Testing
Unit tests
Integration tests
E2E tests

PHASE 12:
Production
Docker
Nginx
CI/CD
Production environment configuration
Deployment documentation

==================================================
47. STARTING INSTRUCTION
==================================================

DO NOT immediately build the entire application.

Start with PHASE 1 only.

First:

1. Inspect the current workspace.
2. Determine whether the project is empty or already contains code.
3. Propose the final folder structure.
4. Explain the architecture.
5. Initialize the monorepo.
6. Set up:
   - Next.js
   - Express
   - TypeScript
   - PostgreSQL
   - Prisma
   - Docker Compose
7. Create .env.example.
8. Configure Git.
9. Create README.
10. Verify that frontend and backend can run.
11. Verify PostgreSQL connection.
12. Run Prisma migration if appropriate.
13. Run lint/build checks.

Do NOT implement authentication, booking, admin dashboard, Socket.IO or Redis yet.

At the end of PHASE 1, give me:

- What was created
- Folder structure
- Commands used
- How to start the project
- How to stop Docker
- Database connection information
- What remains for PHASE 2
- Any warnings/errors

Then wait for my instruction before proceeding.