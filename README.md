# 🩸 LifeForce - Blood Donation Platform

A modern full-stack web application that improves communication and management between blood donors, hospital staff, and hospital administrators.

**Status:** 🚧 **In Active Development**  
**Current Phase:** Core Features Complete | Enhancements In Progress  
**Last Updated:** December 9, 2025

---

## 🎯 Features

### ✅ Implemented Features

#### For Users (Blood Donors)
- ✅ Register and manage profile with blood group information
- ✅ Request blood from hospitals
- ✅ View donation history and eligibility
- ✅ Schedule donation appointments
- ✅ Real-time chat with hospital staff
- ✅ Track blood request status
- ✅ Account settings (notifications, privacy, password)

#### For Staff (Hospital Employees)
- ✅ Register and await admin approval
- ✅ Dashboard with workload statistics
- ✅ Patient management (CRUD operations)
- ✅ Manage incoming blood requests
- ✅ Update blood inventory
- ✅ Assign and fulfill blood requests
- ✅ Record donations with health data
- ✅ Real-time communication with users

#### For Admins (Hospital Management)
- ✅ Approve/reject staff registrations
- ✅ Generate unique staff IDs
- ✅ Manage hospitals (CRUD operations)
- ✅ User and staff management
- ✅ View analytics and metrics
- ✅ Activity logs and system overview
- ✅ Profile update approvals

### 🔜 Upcoming Features
- [ ] File upload for profile pictures
- [ ] SMS notifications
- [ ] Advanced analytics dashboard
- [ ] Export data to CSV/PDF
- [ ] Blood camp management
- [ ] Donor rewards/gamification
- [ ] Emergency blood alerts
- [ ] Multi-language support
- [ ] PWA support

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI Framework |
| Vite | 5.0.8 | Build Tool & Dev Server |
| Tailwind CSS | 4.1.17 | Styling (Japanese-inspired soft pastel theme) |
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
| Node.js | 18+ | Runtime Environment |
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
├── 📄 README.md                 # This file
├── 📄 PROJECT_STATUS.md         # Detailed development progress
├── 📄 QUICKSTART.md             # Quick setup guide
├── 📄 TEAM_DOCUMENTATION.md     # Full team documentation
│
├── 📂 client/                   # React Frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── admin/           # Admin-specific components
│   │   │   ├── chat/            # Chat components
│   │   │   ├── common/          # Shared UI (Button, Input, Modal, etc.)
│   │   │   ├── navigation/      # Navbar, Sidebar
│   │   │   ├── staff/           # Staff-specific components
│   │   │   └── user/            # User-specific components
│   │   ├── context/             # React Contexts (Auth, Socket, Theme)
│   │   ├── hooks/               # Custom hooks
│   │   ├── layouts/             # Page layouts
│   │   ├── pages/               # Page components
│   │   │   ├── admin/           # Admin pages (6)
│   │   │   ├── auth/            # Auth pages (6)
│   │   │   ├── landing/         # Landing page
│   │   │   ├── staff/           # Staff pages (6)
│   │   │   └── user/            # User pages (7)
│   │   ├── routes/              # Route configuration
│   │   ├── services/            # API service layer
│   │   ├── styles/              # CSS files
│   │   └── utils/               # Utility functions
│   └── package.json
│
├── 📂 server/                   # Node.js Backend
│   ├── server.js                # Entry point with Socket.io
│   ├── src/
│   │   ├── config/              # Database & environment config
│   │   ├── controllers/         # Route controllers (7)
│   │   ├── middleware/          # Express middleware (4)
│   │   ├── models/              # Mongoose models (10)
│   │   ├── routes/              # API routes (7)
│   │   ├── seed/                # Database seeders
│   │   ├── services/            # Business logic services
│   │   ├── sockets/             # Socket.io handlers
│   │   ├── utils/               # Utility functions
│   │   └── validations/         # Validation schemas
│   └── package.json
│
└── package.json                 # Root workspace config
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Quick Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd LifeForce

# 2. Install all dependencies
npm run install:all

# 3. Setup environment variables
cp server/.env.example server/.env
# Edit server/.env with your configuration

# 4. Start MongoDB
mongod  # or use MongoDB Atlas

# 5. Seed initial admin user
cd server && npm run seed

# 6. Start development servers
npm run dev  # from root directory
```

### Environment Variables

Create `server/.env` file:

```env
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/liforce
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CLIENT_URL=http://localhost:5173
SOCKET_CORS_ORIGIN=http://localhost:5173

# Optional - Email configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### Access the Application

| URL | Description |
|-----|-------------|
| http://localhost:5173 | Frontend Application |
| http://localhost:5001 | Backend API |
| http://localhost:5001/health | API Health Check |

### Default Admin Credentials

After running `npm run seed`:
- 📧 **Email:** admin@liforce.com
- 🔑 **Password:** Admin@123456

⚠️ **Change this password immediately after first login!**

---

## 👥 User Roles

| Role | Registration | Status | Access |
|------|--------------|--------|--------|
| **USER** | Self-register | Active immediately | Donate blood, request blood, chat |
| **STAFF** | Self-register | PENDING → Admin approval | Manage requests, inventory, patients |
| **ADMIN** | Seed script | Active | Full system access |

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register/user    - Register new donor
POST   /api/auth/register/staff   - Register new staff
POST   /api/auth/login            - Login
POST   /api/auth/logout           - Logout
GET    /api/auth/me               - Get current user
POST   /api/auth/refresh          - Refresh token
POST   /api/auth/forgot-password  - Request password reset
POST   /api/auth/reset-password   - Reset password
```

### User Endpoints
```
GET    /api/user/dashboard        - Dashboard data
GET    /api/user/profile          - Get profile
PUT    /api/user/profile          - Update profile
GET    /api/user/blood-requests   - User's blood requests
POST   /api/user/blood-requests   - Create blood request
GET    /api/user/donations        - Donation history
POST   /api/user/donation-schedules - Schedule donation
```

### Staff Endpoints
```
GET    /api/staff/dashboard       - Staff dashboard
GET    /api/staff/blood-requests  - All blood requests
PUT    /api/staff/blood-requests/:id/assign - Assign request
GET    /api/staff/inventory       - Blood inventory
PUT    /api/staff/inventory       - Update inventory
GET    /api/staff/patients        - Get patients
POST   /api/staff/patients        - Add patient
```

### Admin Endpoints
```
GET    /api/admin/dashboard       - Admin dashboard
GET    /api/admin/staff/pending   - Pending staff approvals
PUT    /api/admin/staff/:id/approve - Approve staff
PUT    /api/admin/staff/:id/reject  - Reject staff
GET    /api/admin/users           - All users
GET    /api/admin/hospitals       - All hospitals
POST   /api/admin/hospitals       - Create hospital
GET    /api/admin/analytics       - Analytics data
```

---

## ⚡ Real-time Features

- **Socket.io Integration** - Real-time communication
- **Chat System** - User ↔ Staff messaging
- **Notifications** - Request updates, approvals
- **Live Updates** - Blood request status changes
- **Online Status** - User presence tracking

---

## 🎨 Design Philosophy

The UI follows a **soft Japanese-inspired aesthetic**:
- 🎨 Pastel color palette
- 🔵 Rounded corners and soft shadows
- ✨ Smooth, calm animations
- 📱 Minimalistic and clean layouts
- 👁️ Excellent contrast and readability
- 🌙 Light/Dark theme support

---

## 🔒 Security Features

- ✅ JWT authentication with refresh tokens
- ✅ Password hashing with bcrypt
- ✅ Role-based access control
- ✅ Input validation on all endpoints
- ✅ CORS configuration
- ✅ Protected routes (frontend & backend)
- ✅ Staff approval workflow

---

## 📊 Project Status

### Core Infrastructure: ✅ Complete
- ✅ Project setup and configuration
- ✅ Database models and schemas
- ✅ Authentication system
- ✅ Role-based access control
- ✅ Real-time communication (Socket.io)

### Frontend Progress
| Module | Status | Pages |
|--------|--------|-------|
| Auth | ✅ Complete | 6 pages |
| User Dashboard | ✅ Complete | 7 pages |
| Staff Dashboard | ✅ Complete | 6 pages |
| Admin Dashboard | ✅ Complete | 6 pages |
| Chat System | ✅ Complete | 3 components |
| **Enhancements** | 🚧 In Progress | TBD |

### Backend Progress
| Module | Status | Details |
|--------|--------|---------|
| Models | ✅ Complete | 10 models |
| Controllers | ✅ Complete | 7 controllers |
| Routes | ✅ Complete | 7 route files |
| Middleware | ✅ Complete | 4 middleware |
| Services | ✅ Complete | 2 services |
| **New Features** | 🚧 In Progress | TBD |

---

## 📚 Documentation

| File | Description |
|------|-------------|
| `README.md` | This file - Project overview |
| `TEAM_DOCUMENTATION.md` | Comprehensive team guide |
| `PROJECT_STATUS.md` | Detailed development progress |
| `QUICKSTART.md` | Quick setup instructions |

---

## 🗺️ Roadmap

### Phase 1: Core Features ✅
- [x] User authentication & authorization
- [x] Blood request management
- [x] Donation scheduling
- [x] Inventory management
- [x] Real-time chat
- [x] Admin dashboard

### Phase 2: Enhancements 🚧
- [ ] Advanced reporting
- [ ] File uploads
- [ ] Email notifications
- [ ] Enhanced analytics

### Phase 3: Advanced Features 📋
- [ ] Blood camp management
- [ ] Emergency alerts system
- [ ] Donor incentive program

---

## 🤝 Contributing

1. Read `TEAM_DOCUMENTATION.md` for coding conventions
2. Create feature branch from `main`
3. Follow the existing code structure
4. Test your changes
5. Submit pull request

---

## 📄 License

MIT

---

## 👨‍💻 Team

**LifeForce Development Team**

---

**🩸 LifeForce - Saving Lives, One Donation at a Time**
