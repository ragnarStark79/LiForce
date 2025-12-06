# LifeForce - Blood Donation Platform

A modern full-stack web application that improves communication and management between blood donors, hospital staff, and hospital administrators.

## 🩸 Features

### For Users (Blood Donors)
- Register and manage profile with blood group information
- Request blood from hospitals
- View donation history and eligibility
- Real-time chat with hospital staff
- Track blood request status

### For Staff (Hospital Employees)
- Register and await admin approval
- Manage incoming blood requests
- Update blood inventory
- Assign and fulfill blood requests
- Real-time communication with users and admins

### For Admins (Hospital Management)
- Approve/reject staff registrations
- Generate unique staff IDs
- Manage hospital details and staff
- View analytics and metrics
- Oversee all blood requests and inventory

## 🛠️ Tech Stack

### Frontend
- **React 18** with JSX (Vite)
- **Tailwind CSS** - Soft Japanese-inspired design
- **React Router** - Client-side routing
- **Zustand** - State management
- **Axios** - API calls
- **Socket.io-client** - Real-time communication

### Backend
- **Node.js & Express** - REST API
- **MongoDB & Mongoose** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Socket.io** - Real-time events

## 📁 Project Structure

```
liforce/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── layouts/       # Layout wrappers
│   │   ├── routes/        # Route configuration
│   │   ├── context/       # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   └── utils/         # Utilities
│   └── package.json
│
├── server/                # Node.js backend
│   ├── src/
│   │   ├── models/        # Mongoose models
│   │   ├── controllers/   # Route controllers
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic
│   │   ├── sockets/       # Socket.io handlers
│   │   └── config/        # Configuration
│   └── package.json
│
└── package.json           # Root workspace config
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd liforce
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Setup environment variables**

Create `.env` file in the `server` directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/liforce
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CLIENT_URL=http://localhost:5173
SOCKET_CORS_ORIGIN=http://localhost:5173
```

4. **Start MongoDB**
```bash
# If using local MongoDB
mongod
```

5. **Run the application**

In separate terminals:

```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm run dev
```

Or run both concurrently from root:
```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

## 👥 User Roles

### USER
- Self-register via user registration form
- Request blood and donate blood
- View donation history

### STAFF
- Register via staff registration form
- Status: PENDING until admin approves
- Manage blood requests and inventory after approval
- Assigned unique staffId upon approval

### ADMIN
- Created manually or via seed script
- Approve/reject staff registrations
- Manage hospital and staff
- Access to all analytics

## 🎨 Design Philosophy

The UI follows a **soft Japanese-inspired aesthetic**:
- Pastel color palette
- Rounded corners and soft shadows
- Smooth, calm animations
- Minimalistic and clean layouts
- Excellent contrast and readability

## 🔐 Authentication Flow

1. **User Registration** → Active immediately
2. **Staff Registration** → PENDING status → Admin approval → APPROVED status
3. **Login** → JWT token issued
4. **Protected Routes** → Token validation
5. **Role-based Access** → Role and status checks

## 📡 Real-time Features

- **Chat System**: User ↔ Staff, Staff ↔ Admin
- **Notifications**: Request updates, approvals
- **Live Updates**: Blood request status changes

## 🧪 Development

### Code Structure
- **No TypeScript** - Pure JavaScript/JSX
- **Modular** - Separated concerns
- **Clean** - Readable and maintainable
- **Documented** - TODO comments for future features

### API Endpoints

```
POST   /api/auth/register/user    - Register user
POST   /api/auth/register/staff   - Register staff
POST   /api/auth/login            - Login
POST   /api/auth/logout           - Logout
GET    /api/auth/me               - Get current user
POST   /api/auth/refresh          - Refresh token
```

## 📝 TODO

- [ ] Email verification system
- [ ] Password reset email functionality
- [ ] User, Staff, Admin dashboard pages
- [ ] Blood request management
- [ ] Inventory management
- [ ] Chat system implementation
- [ ] File upload for avatars
- [ ] Advanced filtering and search
- [ ] Export data functionality
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Analytics dashboard

## 🤝 Contributing

This is a project scaffold. You can extend features by:
1. Adding new controllers and routes
2. Creating corresponding frontend pages
3. Implementing business logic in services
4. Adding validation rules

## 📄 License

MIT

## 👨‍💻 Author

LifeForce Team

---

**Note**: This is a scaffolded project with core authentication and basic structure. Many features are marked with TODO comments for future implementation.
