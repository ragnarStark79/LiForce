# 🩸 LifeForce - Blood Donation Platform

## Team Documentation Guide

**Last Updated:** December 8, 2025  
**Version:** 1.0.0

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [Project Structure](#-project-structure)
4. [Getting Started](#-getting-started)
5. [User Roles & Features](#-user-roles--features)
6. [Frontend Architecture](#-frontend-architecture)
7. [Backend Architecture](#-backend-architecture)
8. [Database Models](#-database-models)
9. [API Endpoints](#-api-endpoints)
10. [Real-time Features](#-real-time-features)
11. [Authentication Flow](#-authentication-flow)
12. [Coding Conventions](#-coding-conventions)
13. [Common Tasks](#-common-tasks)
14. [Troubleshooting](#-troubleshooting)

---

## 🎯 Project Overview

**LifeForce** is a modern full-stack web application designed to improve communication and management between blood donors, hospital staff, and hospital administrators. The platform facilitates blood donation scheduling, blood request management, inventory tracking, and real-time communication.

### Key Features
- 🔐 Role-based authentication (User, Staff, Admin)
- 💉 Blood donation scheduling and tracking
- 🩸 Blood request management
- 📊 Inventory management
- 💬 Real-time chat system
- 🔔 Real-time notifications
- 📈 Analytics and reporting
- 🏥 Hospital management

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI Framework |
| Vite | 5.0.8 | Build Tool & Dev Server |
| Tailwind CSS | 4.1.17 | Styling |
| React Router DOM | 6.20.1 | Client-side Routing |
| Axios | 1.6.2 | HTTP Client |
| Socket.io-client | 4.6.0 | Real-time Communication |
| Zustand | 4.4.7 | State Management |
| date-fns | 2.30.0 | Date Utilities |
| react-hot-toast | 2.4.1 | Toast Notifications |
| react-icons | 5.5.0 | Icon Library |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | - | Runtime Environment |
| Express | 4.18.2 | Web Framework |
| MongoDB | - | Database |
| Mongoose | 8.0.3 | MongoDB ODM |
| JWT | 9.0.2 | Authentication |
| bcryptjs | 2.4.3 | Password Hashing |
| Socket.io | 4.6.0 | Real-time Events |
| Nodemailer | 6.9.7 | Email Service |
| express-validator | 7.0.1 | Input Validation |

---

## 📁 Project Structure

```
LifeForce/
├── 📄 package.json              # Root workspace configuration
├── 📄 README.md                 # Project readme
├── 📄 PROJECT_STATUS.md         # Development progress tracking
├── 📄 QUICKSTART.md             # Quick setup guide
├── 📄 TEAM_DOCUMENTATION.md     # This file
│
├── 📂 client/                   # React Frontend Application
│   ├── 📄 index.html            # HTML entry point
│   ├── 📄 package.json          # Frontend dependencies
│   ├── 📄 vite.config.js        # Vite configuration
│   │
│   └── 📂 src/
│       ├── 📄 main.jsx          # React entry point with providers
│       ├── 📄 App.jsx           # Main app component
│       │
│       ├── 📂 assets/           # Static assets
│       │   ├── 📂 icons/        # Icon files
│       │   └── 📂 illustrations/ # Illustration files
│       │
│       ├── 📂 components/       # Reusable UI Components
│       │   ├── 📂 admin/        # Admin-specific components
│       │   │   ├── ActivityLogList.jsx
│       │   │   ├── MetricsOverview.jsx
│       │   │   ├── ProfileUpdateApprovalTable.jsx
│       │   │   └── StaffApprovalTable.jsx
│       │   │
│       │   ├── 📂 chat/         # Chat components
│       │   │   ├── ChatMessage.jsx
│       │   │   ├── ChatSidebar.jsx
│       │   │   └── ChatWindow.jsx
│       │   │
│       │   ├── 📂 common/       # Shared UI components
│       │   │   ├── Avatar.jsx
│       │   │   ├── Badge.jsx
│       │   │   ├── Button.jsx
│       │   │   ├── Card.jsx
│       │   │   ├── Checkbox.jsx
│       │   │   ├── Input.jsx
│       │   │   ├── LoadingSpinner.jsx
│       │   │   ├── Modal.jsx
│       │   │   ├── NotificationSystem.jsx
│       │   │   ├── Pagination.jsx
│       │   │   ├── Select.jsx
│       │   │   ├── Tabs.jsx
│       │   │   └── Toast.jsx
│       │   │
│       │   ├── 📂 navigation/   # Navigation components
│       │   │   ├── Navbar.jsx
│       │   │   ├── RoleSidebar.jsx
│       │   │   └── Sidebar.jsx
│       │   │
│       │   ├── 📂 staff/        # Staff-specific components
│       │   │   ├── InventoryStatusCard.jsx
│       │   │   └── StaffRequestTable.jsx
│       │   │
│       │   └── 📂 user/         # User-specific components
│       │       ├── DonationTimeline.jsx
│       │       ├── FeedbackForm.jsx
│       │       └── HospitalCard.jsx
│       │
│       ├── 📂 context/          # React Context Providers
│       │   ├── AuthContext.jsx      # Authentication state
│       │   ├── SocketContext.jsx    # Socket.io connection
│       │   └── ThemeContext.jsx     # Theme management
│       │
│       ├── 📂 hooks/            # Custom React Hooks
│       │   ├── useAuth.js           # Authentication hook
│       │   ├── usePagination.js     # Pagination logic
│       │   ├── useSocket.js         # Socket.io hook
│       │   └── useTheme.js          # Theme hook
│       │
│       ├── 📂 layouts/          # Page Layouts
│       │   ├── AuthLayout.jsx       # Login/Register pages
│       │   ├── DashboardLayout.jsx  # Dashboard with sidebar
│       │   └── PublicLayout.jsx     # Public pages
│       │
│       ├── 📂 pages/            # Page Components
│       │   ├── 📂 admin/        # Admin pages
│       │   │   ├── AdminAnalyticsPage.jsx
│       │   │   ├── AdminDashboardPage.jsx
│       │   │   ├── AdminHospitalsPage.jsx
│       │   │   ├── AdminSettingsPage.jsx
│       │   │   ├── AdminStaffApprovalsPage.jsx
│       │   │   └── AdminUsersPage.jsx
│       │   │
│       │   ├── 📂 auth/         # Authentication pages
│       │   │   ├── ForgotPasswordPage.jsx
│       │   │   ├── LoginPage.jsx
│       │   │   ├── RegisterStaffPage.jsx
│       │   │   ├── RegisterUserPage.jsx
│       │   │   ├── ResetPasswordPage.jsx
│       │   │   └── VerifyEmailPage.jsx
│       │   │
│       │   ├── 📂 landing/      # Public landing page
│       │   │   └── LandingPage.jsx
│       │   │
│       │   ├── 📂 staff/        # Staff pages
│       │   │   ├── StaffBloodRequestsPage.jsx
│       │   │   ├── StaffChatPage.jsx
│       │   │   ├── StaffDashboardPage.jsx
│       │   │   ├── StaffDonationSchedulesPage.jsx
│       │   │   ├── StaffInventoryPage.jsx
│       │   │   ├── StaffPatientsPage.jsx
│       │   │   └── StaffProfilePage.jsx
│       │   │
│       │   └── 📂 user/         # User/Donor pages
│       │       ├── DonationSchedulePage.jsx
│       │       ├── UserBloodRequestsPage.jsx
│       │       ├── UserChatPage.jsx
│       │       ├── UserDashboardPage.jsx
│       │       ├── UserDonationsPage.jsx
│       │       ├── UserProfilePage.jsx
│       │       └── UserSettingsPage.jsx
│       │
│       ├── 📂 routes/           # Route Configuration
│       │   ├── index.jsx            # Main route definitions
│       │   ├── ProtectedRoute.jsx   # Auth guard
│       │   └── RoleBasedRoute.jsx   # Role-based guard
│       │
│       ├── 📂 services/         # API Service Layer
│       │   ├── adminService.js      # Admin API calls
│       │   ├── apiClient.js         # Axios instance
│       │   ├── authService.js       # Auth API calls
│       │   ├── bloodService.js      # Blood API calls
│       │   ├── chatService.js       # Chat API calls
│       │   ├── hospitalService.js   # Hospital API calls
│       │   ├── staffService.js      # Staff API calls
│       │   └── userService.js       # User API calls
│       │
│       ├── 📂 styles/           # CSS Styles
│       │   ├── animations.css       # Custom animations
│       │   ├── index.css            # Main stylesheet
│       │   └── theme.css            # Theme variables
│       │
│       └── 📂 utils/            # Utility Functions
│           ├── constants.js         # App constants
│           ├── formatters.js        # Data formatting
│           ├── roles.js             # Role utilities
│           └── validators.js        # Form validation
│
└── 📂 server/                   # Node.js Backend Application
    ├── 📄 package.json          # Backend dependencies
    ├── 📄 server.js             # Server entry with Socket.io
    │
    └── 📂 src/
        ├── 📄 app.js            # Express app setup
        │
        ├── 📂 config/           # Configuration
        │   ├── db.js                # MongoDB connection
        │   └── env.js               # Environment variables
        │
        ├── 📂 controllers/      # Route Controllers
        │   ├── adminController.js   # Admin logic
        │   ├── authController.js    # Auth logic
        │   ├── bloodController.js   # Blood management
        │   ├── chatController.js    # Chat logic
        │   ├── hospitalController.js # Hospital logic
        │   ├── staffController.js   # Staff logic
        │   └── userController.js    # User logic
        │
        ├── 📂 middleware/       # Express Middleware
        │   ├── authMiddleware.js    # JWT verification
        │   ├── errorMiddleware.js   # Error handling
        │   ├── roleMiddleware.js    # Role authorization
        │   └── validateRequest.js   # Input validation
        │
        ├── 📂 models/           # Mongoose Models
        │   ├── BloodRequest.js      # Blood request schema
        │   ├── ChatMessage.js       # Chat message schema
        │   ├── Conversation.js      # Conversation schema
        │   ├── Donation.js          # Donation schema
        │   ├── DonationSchedule.js  # Scheduling schema
        │   ├── Hospital.js          # Hospital schema
        │   ├── Inventory.js         # Inventory schema
        │   ├── Notification.js      # Notification schema
        │   ├── Patient.js           # Patient schema
        │   └── User.js              # User schema
        │
        ├── 📂 routes/           # API Routes
        │   ├── adminRoutes.js       # /api/admin/*
        │   ├── authRoutes.js        # /api/auth/*
        │   ├── bloodRoutes.js       # /api/blood/*
        │   ├── chatRoutes.js        # /api/chat/*
        │   ├── hospitalRoutes.js    # /api/hospitals/*
        │   ├── index.js             # Route aggregation
        │   ├── staffRoutes.js       # /api/staff/*
        │   └── userRoutes.js        # /api/user/*
        │
        ├── 📂 seed/             # Database Seeders
        │   ├── assignHospitalToStaff.js
        │   └── createInitialAdmin.js
        │
        ├── 📂 services/         # Business Logic Services
        │   ├── emailService.js      # Email sending
        │   └── notificationService.js # Notifications
        │
        ├── 📂 sockets/          # Socket.io Handlers
        │   ├── chatSocket.js        # Chat events
        │   ├── index.js             # Socket initialization
        │   └── notificationSocket.js # Notification events
        │
        ├── 📂 utils/            # Utility Functions
        │   ├── constants.js         # Backend constants
        │   ├── generateStaffId.js   # Staff ID generator
        │   ├── generateTokens.js    # JWT generation
        │   └── logger.js            # Logging utility
        │
        └── 📂 validations/      # Validation Schemas
            └── index.js             # Validation rules
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn**
- **Git**

### Step 1: Clone & Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd LifeForce

# Install all dependencies (root, client, and server)
npm run install:all

# OR install separately
npm install
cd client && npm install
cd ../server && npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5001

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/liforce

# JWT Secrets (use strong random strings)
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
SOCKET_CORS_ORIGIN=http://localhost:5173

# Email Configuration (optional - for sending emails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### Step 3: Start MongoDB

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas and update MONGODB_URI in .env
```

### Step 4: Seed Initial Admin User

```bash
cd server
npm run seed
```

This creates an admin user with:
- 📧 **Email:** admin@liforce.com
- 🔑 **Password:** Admin@123456

⚠️ **Change this password immediately after first login!**

### Step 5: Start Development Servers

```bash
# From root directory - runs both client and server
npm run dev

# OR run separately in different terminals:
# Terminal 1 - Frontend
cd client && npm run dev

# Terminal 2 - Backend
cd server && npm run dev
```

### Step 6: Access the Application

| URL | Description |
|-----|-------------|
| http://localhost:5173 | Frontend Application |
| http://localhost:5001 | Backend API |
| http://localhost:5001/health | API Health Check |

---

## 👥 User Roles & Features

### 1. USER (Blood Donor)
Regular users who can donate blood and request blood.

| Feature | Description |
|---------|-------------|
| Dashboard | Personal stats, recent activity, quick actions |
| Profile | Manage personal info, blood group, contact details |
| Blood Requests | Create and track blood requests |
| Donations | View donation history and schedule new donations |
| Schedule Donation | Book donation appointments at hospitals |
| Chat | Real-time messaging with hospital staff |
| Settings | Account settings, notifications, privacy |

### 2. STAFF (Hospital Employee)
Hospital staff members who manage blood operations.

| Feature | Description |
|---------|-------------|
| Dashboard | Workload stats, pending tasks, today's schedule |
| Blood Requests | Manage incoming blood requests, assign, update status |
| Inventory | View and update blood inventory |
| Patients | Manage patient records (CRUD) |
| Donation Schedules | Handle donor appointments |
| Chat | Communicate with users and admins |
| Profile | Manage profile (changes require admin approval) |

### 3. ADMIN (Hospital Administrator)
System administrators with full control.

| Feature | Description |
|---------|-------------|
| Dashboard | System overview, pending approvals, activity |
| Staff Approvals | Approve/reject staff registrations |
| Staff Management | View, suspend, reactivate staff members |
| User Management | Manage all users in the system |
| Hospital Management | CRUD operations for hospitals |
| Analytics | System-wide statistics and trends |
| Settings | System configuration, theme settings |

---

## 🎨 Frontend Architecture

### Component Hierarchy

```
main.jsx
└── Providers (Auth, Theme, Socket, Notification)
    └── RouterProvider
        ├── PublicLayout
        │   └── LandingPage
        │
        ├── AuthLayout
        │   ├── LoginPage
        │   ├── RegisterUserPage
        │   ├── RegisterStaffPage
        │   └── ...
        │
        └── DashboardLayout (Protected)
            ├── Navbar
            ├── RoleSidebar
            └── Outlet (Page Content)
                ├── User Pages (role: USER)
                ├── Staff Pages (role: STAFF)
                └── Admin Pages (role: ADMIN)
```

### State Management

| Context | Purpose |
|---------|---------|
| AuthContext | User authentication state, login/logout/register |
| SocketContext | Socket.io connection, real-time events |
| ThemeContext | Light/dark theme management |
| NotificationContext | In-app notifications |

### Service Layer Pattern

All API calls go through service files:

```javascript
// Example: Using userService
import { userService } from '../services/userService';

// In component
const data = await userService.getDashboard();
const history = await userService.getDonationHistory();
```

### Common Components Usage

```jsx
// Button variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Danger</Button>

// Input with validation
<Input
  name="email"
  label="Email"
  type="email"
  value={email}
  onChange={handleChange}
  error={errors.email}
/>

// Card container
<Card className="p-6">
  <h2>Card Title</h2>
  <p>Card content</p>
</Card>

// Badge for status
<Badge variant="success">Approved</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Rejected</Badge>

// Modal dialog
<Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Modal Title">
  <p>Modal content</p>
</Modal>
```

---

## 🔧 Backend Architecture

### Request Flow

```
Client Request
    ↓
Express Router (/api/*)
    ↓
Auth Middleware (JWT verification)
    ↓
Role Middleware (role check)
    ↓
Validation Middleware (input validation)
    ↓
Controller (business logic)
    ↓
Model (database operation)
    ↓
Response to Client
```

### Middleware Stack

```javascript
// Example route with all middleware
router.put('/profile', 
  authMiddleware,           // Verify JWT token
  roleMiddleware('STAFF'),  // Check role
  validateRequest(rules),   // Validate input
  updateProfile             // Controller function
);
```

### Controller Pattern

```javascript
// Example controller function
export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Business logic here
    const data = await SomeModel.find({ userId });
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
};
```

---

## 📊 Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: 'USER' | 'STAFF' | 'ADMIN',
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-',
  status: 'PENDING' | 'ACTIVE' | 'APPROVED' | 'REJECTED' | 'SUSPENDED',
  hospitalId: ObjectId (for STAFF),
  staffId: String (auto-generated for STAFF),
  position: String (for STAFF),
  // ... more fields
}
```

### BloodRequest Model
```javascript
{
  userId: ObjectId,
  hospitalId: ObjectId,
  patientName: String,
  bloodGroup: String,
  units: Number,
  urgency: 'NORMAL' | 'HIGH' | 'CRITICAL',
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
  assignedTo: ObjectId,
  reason: String,
  // ... timestamps
}
```

### Donation Model
```javascript
{
  donorId: ObjectId,
  hospitalId: ObjectId,
  bloodGroup: String,
  unitsDonated: Number,
  donationDate: Date,
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED',
  healthData: {
    bloodPressure: String,
    hemoglobin: Number,
    weight: Number
  },
  nextEligibleDate: Date,
  // ... timestamps
}
```

### Hospital Model
```javascript
{
  name: String,
  code: String (unique),
  email: String (unique),
  phone: String,
  address: String,
  city: String,
  state: String,
  bloodBankCapacity: Number,
  isActive: Boolean,
  // ... more fields
}
```

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register/user` | Register new donor |
| POST | `/register/staff` | Register new staff |
| POST | `/login` | User login |
| POST | `/logout` | User logout |
| GET | `/me` | Get current user |
| POST | `/refresh` | Refresh access token |
| POST | `/forgot-password` | Request password reset |
| POST | `/reset-password` | Reset password |

### User (`/api/user`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Get dashboard data |
| GET | `/profile` | Get user profile |
| PUT | `/profile` | Update profile |
| GET | `/blood-requests` | Get user's blood requests |
| POST | `/blood-requests` | Create blood request |
| GET | `/donations` | Get donation history |
| GET | `/donation-schedules` | Get scheduled donations |
| POST | `/donation-schedules` | Schedule donation |

### Staff (`/api/staff`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Get staff dashboard |
| GET | `/blood-requests` | Get all blood requests |
| PUT | `/blood-requests/:id/assign` | Assign request |
| PUT | `/blood-requests/:id/status` | Update status |
| GET | `/inventory` | Get blood inventory |
| PUT | `/inventory` | Update inventory |
| GET | `/patients` | Get patients |
| POST | `/patients` | Add patient |
| GET | `/donation-schedules` | Get donation schedules |

### Admin (`/api/admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Get admin dashboard |
| GET | `/staff/pending` | Get pending staff |
| PUT | `/staff/:id/approve` | Approve staff |
| PUT | `/staff/:id/reject` | Reject staff |
| GET | `/users` | Get all users |
| GET | `/hospitals` | Get all hospitals |
| POST | `/hospitals` | Create hospital |
| GET | `/analytics` | Get analytics data |

### Chat (`/api/chat`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/conversations` | Get user conversations |
| GET | `/messages/:roomId` | Get room messages |
| POST | `/messages` | Send message |
| PUT | `/messages/:roomId/read` | Mark as read |

---

## ⚡ Real-time Features

### Socket.io Events

#### Client → Server
| Event | Data | Description |
|-------|------|-------------|
| `joinRoom` | `{ roomId }` | Join chat room |
| `leaveRoom` | `{ roomId }` | Leave chat room |
| `sendMessage` | `{ roomId, message }` | Send chat message |
| `typing` | `{ roomId, isTyping }` | Typing indicator |

#### Server → Client
| Event | Data | Description |
|-------|------|-------------|
| `messageReceived` | `{ message }` | New message received |
| `notification` | `{ notification }` | New notification |
| `requestUpdate` | `{ request }` | Blood request status update |
| `userTyping` | `{ userId, isTyping }` | Typing indicator |

### Using Socket in Components

```jsx
import { useSocket } from '../hooks/useSocket';

const ChatComponent = () => {
  const { socket, connected } = useSocket();
  
  useEffect(() => {
    if (socket) {
      socket.on('messageReceived', handleNewMessage);
      
      return () => {
        socket.off('messageReceived', handleNewMessage);
      };
    }
  }, [socket]);
  
  const sendMessage = (message) => {
    socket.emit('sendMessage', { roomId, message });
  };
};
```

---

## 🔐 Authentication Flow

### Login Flow
```
1. User enters credentials
2. POST /api/auth/login
3. Server validates credentials
4. Server generates JWT tokens (access + refresh)
5. Tokens stored in localStorage
6. User redirected to role-based dashboard
```

### Protected Route Flow
```
1. User tries to access protected route
2. ProtectedRoute checks AuthContext
3. If not authenticated → redirect to /login
4. If authenticated → check role with RoleBasedRoute
5. If role matches → render page
6. If role doesn't match → redirect to user's dashboard
```

### Token Refresh Flow
```
1. API call returns 401 (token expired)
2. apiClient interceptor catches error
3. Calls /api/auth/refresh with refresh token
4. Server validates refresh token
5. New access token returned
6. Original request retried with new token
```

---

## 📝 Coding Conventions

### File Naming
- **Components:** PascalCase (e.g., `UserDashboardPage.jsx`)
- **Hooks:** camelCase with 'use' prefix (e.g., `useAuth.js`)
- **Services:** camelCase with 'Service' suffix (e.g., `userService.js`)
- **Utils:** camelCase (e.g., `formatters.js`)

### Component Structure
```jsx
// 1. Imports
import { useState, useEffect } from 'react';
import SomeComponent from './SomeComponent';

// 2. Component definition
const MyComponent = ({ prop1, prop2 }) => {
  // 3. State declarations
  const [state, setState] = useState(initialValue);
  
  // 4. Custom hooks
  const { user } = useAuth();
  
  // 5. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // 6. Event handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

// 8. Export
export default MyComponent;
```

### API Service Pattern
```javascript
// services/exampleService.js
import apiClient from './apiClient';

export const exampleService = {
  getAll: async (params) => {
    const response = await apiClient.get('/example', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await apiClient.get(`/example/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await apiClient.post('/example', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await apiClient.put(`/example/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await apiClient.delete(`/example/${id}`);
    return response.data;
  },
};
```

---

## 🔨 Common Tasks

### Adding a New Page

1. **Create the page component:**
```jsx
// client/src/pages/user/NewPage.jsx
import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';

const NewPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Page</h1>
      <Card>
        {/* Page content */}
      </Card>
    </div>
  );
};

export default NewPage;
```

2. **Add route in `routes/index.jsx`:**
```jsx
import NewPage from '../pages/user/NewPage';

// Inside user routes
{
  path: 'new-page',
  element: <NewPage />,
},
```

3. **Add sidebar link in `RoleSidebar.jsx`:**
```jsx
{ name: 'New Page', path: '/user/new-page', icon: '📄' },
```

### Adding a New API Endpoint

1. **Create controller function:**
```javascript
// server/src/controllers/exampleController.js
export const newFunction = async (req, res) => {
  try {
    // Logic here
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

2. **Add route:**
```javascript
// server/src/routes/exampleRoutes.js
router.get('/new-endpoint', authMiddleware, newFunction);
```

3. **Add service method (frontend):**
```javascript
// client/src/services/exampleService.js
newMethod: async () => {
  const response = await apiClient.get('/example/new-endpoint');
  return response.data;
},
```

### Adding a New Model

1. **Create model file:**
```javascript
// server/src/models/NewModel.js
import mongoose from 'mongoose';

const newSchema = new mongoose.Schema({
  field1: { type: String, required: true },
  field2: { type: Number, default: 0 },
  // ... more fields
}, { timestamps: true });

export default mongoose.model('NewModel', newSchema);
```

2. **Import in controller and use:**
```javascript
import NewModel from '../models/NewModel.js';

const items = await NewModel.find();
```

---

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongod

# Or verify your MONGODB_URI in .env
```

#### Port Already in Use
```bash
# Find and kill process on port 5001
lsof -ti:5001 | xargs kill

# Or change PORT in server/.env
```

#### Module Not Found Errors
```bash
# Clear and reinstall dependencies
rm -rf node_modules client/node_modules server/node_modules
npm run install:all
```

#### CORS Errors
- Ensure `CLIENT_URL` in server `.env` matches frontend URL
- Check that frontend proxy is configured correctly in `vite.config.js`

#### JWT Token Issues
- Check that `JWT_SECRET` is set in `.env`
- Try clearing localStorage and logging in again

### Debugging Tips

1. **Check browser console** for frontend errors
2. **Check terminal** running server for backend errors
3. **Use React DevTools** for component state
4. **Use Network tab** to inspect API calls
5. **Add `console.log`** statements for debugging

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Mongoose Documentation](https://mongoosejs.com/docs/guide.html)
- [Socket.io Documentation](https://socket.io/docs/v4/)

---

## 👥 Team Contacts

| Role | Name | Responsibility |
|------|------|----------------|
| | | |
| | | |
| | | |

*Fill in team member details above*

---

## 📄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Dec 8, 2025 | Initial documentation |

---

**Happy Coding! 🩸💻**

*LifeForce - Saving Lives, One Donation at a Time*
