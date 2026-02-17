# Drivest Admin Dashboard

**Next.js-based admin dashboard** for managing the Drivest platform. This web application provides administrators with tools to manage users, car listings, view analytics, and handle support tickets.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Pages & Routes](#pages--routes)
- [API Integration](#api-integration)
- [Deployment](#deployment)

---

## 🎯 Overview

The Admin Dashboard is a comprehensive web interface built with Next.js 15 that allows administrators to:

- Manage users (approve, reject, edit, delete)
- Manage car listings
- View analytics and reports
- Handle support tickets
- Monitor platform activity

---

## ✨ Features

- ✅ **User Management**
  - View all users
  - Approve/reject pending users
  - Edit user details
  - Delete users
  - Reset user passwords

- ✅ **Car Listings Management**
  - View all car listings
  - Search and filter cars
  - Delete listings

- ✅ **Analytics Dashboard**
  - Total users count
  - Total income statistics
  - Active listings count
  - Growth charts
  - Income charts

- ✅ **Support Management**
  - View all support tickets
  - Manage help center content

- ✅ **Authentication**
  - Secure login/logout
  - Session management
  - Protected routes

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15.5.3
- **React:** 19.1.0
- **Styling:** Tailwind CSS 4
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Icons:** React Icons, Lucide React
- **UI Components:** Radix UI
- **State Management:** React Hooks
- **Real-time:** Pusher JS

---

## 📦 Installation

### Prerequisites

- Node.js >= 18.x
- npm or yarn

### Setup Steps

1. **Navigate to the directory:**
```bash
cd Admin-Dashboard
```

2. **Install dependencies:**
```bash
npm install
# or
yarn install
```

3. **Create environment file:**
```bash
cp .env.example .env
```

4. **Configure environment variables** (see [Environment Variables](#environment-variables))

5. **Run development server:**
```bash
npm run dev
# or
yarn dev
```

6. **Open in browser:**
```
http://localhost:3000
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.drivestai.com

# Pusher Configuration (for real-time features)
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
```

---

## 📁 Project Structure

```
Admin-Dashboard/
├── app/
│   ├── (protected)/          # Protected routes (require auth)
│   │   ├── dashboard/        # Dashboard page
│   │   ├── user/             # User management
│   │   ├── listings/        # Car listings management
│   │   ├── help/             # Help center
│   │   ├── reports/          # Reports page
│   │   ├── profile/          # Admin profile
│   │   └── layout.js         # Protected layout
│   ├── component/            # Reusable components
│   │   ├── Sidebar.jsx       # Navigation sidebar
│   │   ├── Topbar.jsx        # Top navigation bar
│   │   ├── Header.jsx        # Page headers
│   │   ├── Container.jsx     # Container component
│   │   ├── IncomeBar.jsx     # Income chart component
│   │   └── GrowthBar.jsx     # Growth chart component
│   ├── checkmail/            # Email check page
│   ├── forgotpassword/       # Password reset
│   ├── register/             # Admin registration
│   ├── setpassword/          # Set password page
│   ├── page.js               # Login page
│   ├── layout.js             # Root layout
│   └── globals.css           # Global styles
├── components/
│   └── ui/                   # UI components (Radix UI)
├── lib/
│   ├── auth.js              # Authentication utilities
│   ├── pusherClient.js      # Pusher client setup
│   └── utils.js             # Utility functions
├── middleware.js            # Next.js middleware
├── middleware2.js           # Additional middleware
├── public/                  # Static assets
├── package.json
└── README.md
```

---

## 🚀 Usage

### Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Lint

```bash
npm run lint
```

---

## 📄 Pages & Routes

### Public Routes

- `/` - Login page
- `/register` - Admin registration
- `/forgotpassword` - Password reset request
- `/setpassword` - Set new password
- `/checkmail` - Email verification check

### Protected Routes (Require Authentication)

- `/dashboard` - Main dashboard with analytics
- `/user/management` - User management page
- `/listings/management` - Car listings management
- `/help/center` - Help center management
- `/reports` - Reports and analytics
- `/profile` - Admin profile page
- `/notifications` - Notifications page
- `/verification` - User verification page

---

## 🔌 API Integration

The dashboard integrates with the backend API:

### Base Configuration

```javascript
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.drivestai.com";
```

### Authentication

All protected routes require authentication token stored in cookies/localStorage.

### Example API Calls

```javascript
// Get all users
const response = await axios.get(`${API_BASE}/admin/user-list`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

// Approve user
await axios.put(`${API_BASE}/admin/approved-user/${userId}`, {}, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

---

## 🎨 Key Components

### Sidebar
Navigation sidebar with menu items:
- Dashboard
- User Management
- Listings Management
- Help Center
- Settings

### Topbar
Top navigation bar with:
- User profile dropdown
- Logout functionality
- Notifications

### Dashboard
Main dashboard showing:
- Total users card
- Total income card
- Active listings card
- Growth charts
- Income charts
- Pending items table

---

## 🔒 Authentication Flow

1. Admin logs in at `/`
2. Credentials are verified with backend API
3. JWT token is stored in cookies/localStorage
4. Middleware checks for token on protected routes
5. Token is included in API requests
6. On logout, token is removed

---

## 📊 Analytics Features

### Dashboard Metrics

- **Total Users:** Count of all registered users
- **Total Income:** Revenue from subscriptions
- **Active Listings:** Number of active car listings
- **Growth Charts:** User growth over time
- **Income Charts:** Revenue trends

### Charts

- Line charts for growth trends
- Bar charts for income analysis
- Real-time data updates

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Manual Deployment

```bash
# Build the project
npm run build

# Start production server
npm start
```

### Environment Variables for Production

Make sure to set:
- `NEXT_PUBLIC_API_BASE_URL` - Production API URL
- `NEXT_PUBLIC_PUSHER_KEY` - Pusher key
- `NEXT_PUBLIC_PUSHER_CLUSTER` - Pusher cluster

---

## 🐛 Troubleshooting

### Common Issues

1. **Authentication errors:**
   - Check if token is being stored correctly
   - Verify API base URL is correct
   - Check CORS settings on backend

2. **Build errors:**
   - Clear `.next` folder: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

3. **API connection issues:**
   - Verify backend is running
   - Check network connectivity
   - Verify API base URL in `.env`

---

## 📝 Notes

- The dashboard uses Next.js App Router (app directory)
- All protected routes are in `app/(protected)/` directory
- Authentication is handled via middleware
- Real-time features use Pusher for notifications

---

## 🔗 Related Documentation

- [Backend API Documentation](../drivest-ai/README.md)
- [Main Project README](../README.md)

---

**Built with Next.js 15 & React 19**
