# Driving School Booking System

## Overview
This project is a web-based booking system for a driving school that allows users to schedule lessons without requiring authentication. The booking process includes selecting an available time slot, filling out a form, making a payment via Stripe, and receiving a confirmation. The system integrates with Calendly for scheduling and uses MongoDB Atlas for storing dynamic business data.

## Tech Stack
- **Frontend:** Next.js (React-based framework, styled with Tailwind CSS)
- **Backend:** Next.js API Routes
- **Database:** MongoDB Atlas (Mongoose for ODM)
- **Scheduling:** Calendly
- **Payments:** Stripe

## Features
- Multi-step booking process
- Integration with Calendly for scheduling
- Secure payment processing with Stripe
- Email confirmations
- Responsive design for all devices

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB Atlas account
- Stripe account (test mode)
- Calendly account

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/driving-school-booking.git
cd driving-school-booking
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file in the project root with the following variables:
```
# MongoDB
MONGODB_URI=your_mongodb_atlas_connection_string

# Next.js
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Email (Nodemailer)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email_username
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=noreply@drivingschool.com
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

### Project Structure
```
/ (Root)
├── /public          # Static files
├── /src             # Main source code
│   ├── /app         # Next.js App Router
│   │   ├── /api     # API Routes
│   │   │   ├── /booking    # Booking endpoints
│   │   │   ├── /payments   # Payment endpoints
│   │   │   └── /schedules  # Schedule endpoints
│   │   ├── /booking    # Booking pages
│   │   │   ├── /confirmation  # Booking confirmation page
│   │   │   └── /cancel       # Booking cancellation page
│   │   ├── /contact    # Contact page
│   │   ├── /faq        # FAQ page
│   │   ├── /plans      # Plans/pricing page
│   │   └── /page.tsx   # Home page
│   ├── /components   # Reusable components
│   │   ├── /ui       # Basic UI components
│   │   ├── /forms    # Form components
│   │   ├── /layout   # Layout components
│   ├── /lib          # Utility functions
│   │   ├── /db       # MongoDB configuration
│   │   ├── /stripe   # Stripe configuration
│   │   ├── /calendly # Calendly configuration
│   ├── /models       # Mongoose models
│   ├── /hooks        # Custom React hooks
│   ├── /utils        # Utility functions
│   ├── /types        # TypeScript types/interfaces
├── tailwind.config.js # Tailwind configuration
├── next.config.js    # Next.js configuration
├── tsconfig.json     # TypeScript configuration
├── package.json      # Project dependencies
├── LICENSE           # MIT License
└── README.md         # Documentation
```

## API Routes

### Booking API
- `POST /api/booking` - Create a new booking
- `GET /api/booking` - Get all bookings (admin only)

### Payments API
- `POST /api/payments/webhook` - Stripe webhook for payment confirmations

### Schedules API
- `GET /api/schedules` - Get available time slots

## Deployment

This project can be deployed to Vercel with the following steps:

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Configure the environment variables in the Vercel dashboard
4. Deploy the project

## License

This project is licensed under the MIT License - see the LICENSE file for details.
