# LifeForce - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
# From the root directory
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### Step 2: Setup Environment
```bash
# In the server directory, create .env file
cd server
cp ../.env.example .env
```

Edit `server/.env` and update:
```env
MONGODB_URI=mongodb://localhost:27017/liforce
JWT_SECRET=your_secure_random_string_here
JWT_REFRESH_SECRET=another_secure_random_string_here
```

### Step 3: Start MongoDB
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas and update MONGODB_URI in .env
```

### Step 4: Create Admin User
```bash
# From server directory
npm run seed
```

You'll see:
```
✓ Admin user created successfully!
📧 Email: admin@liforce.com
🔑 Password: Admin@123456
```

### Step 5: Start the Application
```bash
# Option 1: Run both servers from root (recommended)
npm run dev

# Option 2: Run separately in different terminals
# Terminal 1
cd client && npm run dev

# Terminal 2
cd server && npm run dev
```

### Step 6: Open Your Browser
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🧪 Test the Application

### 1. Register a User
- Go to http://localhost:5173
- Click "Register as User"
- Fill in the form with your details
- Submit and you'll be logged in automatically

### 2. Register a Staff Member
- Click "Register as Staff"
- Fill in the form
- Your account will be in PENDING status
- You won't be able to log in until admin approves

### 3. Login as Admin
- Email: `admin@liforce.com`
- Password: `Admin@123456`
- You'll see the admin dashboard

## 📁 Project Structure Overview

```
liforce/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/        # UI Components
│   │   ├── pages/            # Page Components
│   │   ├── layouts/          # Layout Wrappers
│   │   ├── routes/           # Route Config
│   │   ├── context/          # React Contexts
│   │   ├── hooks/            # Custom Hooks
│   │   ├── services/         # API Services
│   │   └── utils/            # Utilities
│   └── package.json
│
├── server/                    # Node.js Backend
│   ├── src/
│   │   ├── models/           # Mongoose Models
│   │   ├── controllers/      # Route Controllers
│   │   ├── routes/           # API Routes
│   │   ├── middleware/       # Express Middleware
│   │   └── config/           # Configuration
│   └── package.json
│
└── README.md                  # Full Documentation
```


## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Make sure MongoDB is running
mongod

# Or check your MONGODB_URI in .env
```

### Port Already in Use
```bash
# Change PORT in server/.env
PORT=5001

# Or kill the process using the port
lsof -ti:5000 | xargs kill
```

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules client/node_modules server/node_modules
npm run install:all
```

## 📚 Documentation

- **README.md** - Full project documentation
- **PROJECT_STATUS.md** - Current progress and TODOs
- **This file** - Quick start guide

## 🤝 Need Help?

Check the files:
1. `README.md` for detailed setup
2. `PROJECT_STATUS.md` for what's complete/incomplete
3. Individual component files have TODO comments

## 🎯 Next Development Steps

1. Install all dependencies
2. Test the authentication flow
3. Implement staff approval page for admin
4. Create blood request management
5. Add inventory management
6. Implement chat system

---

Happy Coding! 🩸💻
