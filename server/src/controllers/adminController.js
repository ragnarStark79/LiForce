import User from '../models/User.js';
import BloodRequest from '../models/BloodRequest.js';
import Donation from '../models/Donation.js';
import Hospital from '../models/Hospital.js';
import Inventory from '../models/Inventory.js';

// Generate Staff ID
const generateStaffId = (hospitalCode) => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${hospitalCode}-${randomNum}`;
};

// Get Admin Dashboard
export const getDashboard = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;

    // Get pending staff approvals
    const pendingStaff = await User.countDocuments({
      role: 'STAFF',
      status: 'PENDING',
      hospitalId
    });

    // Get total staff
    const totalStaff = await User.countDocuments({
      role: 'STAFF',
      status: 'APPROVED',
      hospitalId
    });

    // Get active requests
    const activeRequests = await BloodRequest.countDocuments({
      hospitalId,
      status: { $in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'] }
    });

    // Get total users (donors)
    const totalUsers = await User.countDocuments({ role: 'USER' });

    res.json({
      stats: {
        pendingStaff,
        totalStaff,
        activeRequests,
        totalUsers
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Pending Staff Approvals
export const getPendingStaff = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    const { page = 1, limit = 10 } = req.query;

    const pendingStaff = await User.find({
      role: 'STAFF',
      status: 'PENDING',
      hospitalId
    })
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments({
      role: 'STAFF',
      status: 'PENDING',
      hospitalId
    });

    res.json({
      staff: pendingStaff,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve Staff
export const approveStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const hospitalId = req.user.hospitalId;

    const staff = await User.findOne({
      _id: staffId,
      role: 'STAFF',
      status: 'PENDING',
      hospitalId
    });

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Get hospital code
    const hospital = await Hospital.findById(hospitalId);
    const staffIdCode = generateStaffId(hospital.code);

    // Update staff status
    staff.status = 'APPROVED';
    staff.staffId = staffIdCode;
    await staff.save();

    // TODO: Send approval notification to staff member

    res.json({
      message: 'Staff approved successfully',
      staff
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject Staff
export const rejectStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { reason } = req.body;
    const hospitalId = req.user.hospitalId;

    const staff = await User.findOne({
      _id: staffId,
      role: 'STAFF',
      status: 'PENDING',
      hospitalId
    });

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    staff.status = 'REJECTED';
    await staff.save();

    // TODO: Send rejection notification with reason

    res.json({
      message: 'Staff rejected',
      staff
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Staff
export const getAllStaff = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    const { page = 1, limit = 10, status } = req.query;

    const query = { role: 'STAFF', hospitalId };
    if (status && status !== 'all') query.status = status;

    const staff = await User.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      staff,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Users (Donors)
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, bloodGroup, search } = req.query;

    const query = { role: 'USER' };
    if (bloodGroup && bloodGroup !== 'all') query.bloodGroup = bloodGroup;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Hospital Details
export const updateHospital = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    const updates = req.body;

    const hospital = await Hospital.findByIdAndUpdate(
      hospitalId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Hospital updated successfully',
      hospital
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Hospital Details
export const getHospital = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;

    const hospital = await Hospital.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    res.json({ hospital });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Analytics Data
export const getAnalytics = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get requests in period
    const totalRequests = await BloodRequest.countDocuments({
      hospitalId,
      createdAt: { $gte: startDate }
    });

    const completedRequests = await BloodRequest.countDocuments({
      hospitalId,
      status: 'COMPLETED',
      updatedAt: { $gte: startDate }
    });

    // Get donations in period
    const totalDonations = await Donation.countDocuments({
      hospitalId,
      donationDate: { $gte: startDate }
    });

    // Get active users
    const activeUsers = await User.countDocuments({
      role: 'USER',
      lastDonationDate: { $gte: startDate }
    });

    res.json({
      period,
      analytics: {
        totalRequests,
        completedRequests,
        totalDonations,
        activeUsers,
        completionRate: totalRequests > 0 
          ? ((completedRequests / totalRequests) * 100).toFixed(1) 
          : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Suspend User
export const suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = 'SUSPENDED';
    await user.save();

    res.json({ message: 'User suspended successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Activate User
export const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = 'ACTIVE';
    await user.save();

    res.json({ message: 'User activated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
