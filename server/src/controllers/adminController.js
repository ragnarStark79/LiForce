import User from '../models/User.js';
import Hospital from '../models/Hospital.js';
import BloodRequest from '../models/BloodRequest.js';
import Donation from '../models/Donation.js';
import Inventory from '../models/Inventory.js';
import { generateStaffId } from '../utils/generateStaffId.js';

// Get Admin Dashboard - Admin sees ALL data across ALL hospitals
export const getDashboard = async (req, res) => {
  try {
    // Admin sees global stats - NO hospital filtering
    const totalUsers = await User.countDocuments({ role: 'USER' });
    const totalStaff = await User.countDocuments({ role: 'STAFF', status: 'APPROVED' });
    const pendingStaff = await User.countDocuments({ role: 'STAFF', status: 'PENDING' });
    const totalHospitals = await Hospital.countDocuments({ isActive: true });
    const totalBloodRequests = await BloodRequest.countDocuments();
    const pendingBloodRequests = await BloodRequest.countDocuments({ status: 'PENDING' });
    const totalDonations = await Donation.countDocuments({ status: 'COMPLETED' });
    const pendingProfileUpdates = await User.countDocuments({ 
      role: 'STAFF', 
      profileUpdateStatus: 'PENDING' 
    });

    res.json({
      stats: {
        totalUsers,
        totalStaff,
        pendingStaff,
        totalHospitals,
        totalBloodRequests,
        pendingBloodRequests,
        totalDonations,
        pendingProfileUpdates
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Pending Staff Approvals - Admin sees ALL pending staff from ALL hospitals
export const getPendingStaff = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Admin sees ALL pending staff - NO hospital filtering
    const pendingStaff = await User.find({
      role: 'STAFF',
      status: 'PENDING'
    })
      .populate('hospitalId', 'name city state')
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments({
      role: 'STAFF',
      status: 'PENDING'
    });

    res.json({
      staff: pendingStaff,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get pending staff error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Approve Staff - Admin can approve any staff from any hospital
export const approveStaff = async (req, res) => {
  try {
    const { staffId } = req.params;

    const staff = await User.findById(staffId).populate('hospitalId');

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    if (staff.role !== 'STAFF') {
      return res.status(400).json({ message: 'User is not a staff member' });
    }

    // Admin can approve any staff - NO hospital check
    staff.status = 'APPROVED';
    
    // Generate permanent staff ID only if not already assigned
    if (!staff.staffId && staff.hospitalId && staff.hospitalId.code) {
      staff.staffId = generateStaffId(staff.hospitalId.code);
    }
    
    await staff.save();

    res.json({ message: 'Staff approved successfully', staff });
  } catch (error) {
    console.error('Approve staff error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Reject Staff - Admin can reject any staff from any hospital
export const rejectStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { reason } = req.body;

    const staff = await User.findById(staffId);

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    if (staff.role !== 'STAFF') {
      return res.status(400).json({ message: 'User is not a staff member' });
    }

    // Admin can reject any staff - set status to REJECTED
    staff.status = 'REJECTED';
    await staff.save();

    res.json({ message: 'Staff rejected successfully' });
  } catch (error) {
    console.error('Reject staff error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Staff - Admin sees ALL staff from ALL hospitals
export const getAllStaff = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, hospitalId } = req.query;

    // Admin can filter by hospital optionally, but sees all by default
    const query = { role: 'STAFF', status: 'APPROVED' };
    
    if (hospitalId && hospitalId !== 'all') {
      query.hospitalId = hospitalId;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { staffId: { $regex: search, $options: 'i' } }
      ];
    }

    const staff = await User.find(query)
      .populate('hospitalId', 'name city state')
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      staff,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get all staff error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Users - Admin sees ALL users
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, bloodGroup } = req.query;

    const query = { role: 'USER' };

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (bloodGroup && bloodGroup !== 'all') {
      query.bloodGroup = bloodGroup;
    }

    const users = await User.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Toggle User Status
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ 
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, 
      user 
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Hospitals
export const getAllHospitals = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const query = {};

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    const hospitals = await Hospital.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Hospital.countDocuments(query);

    res.json({
      hospitals,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get all hospitals error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Hospital (admin's own hospital or a specific one)
export const getHospital = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.userId).populate('hospitalId');
    
    if (!adminUser.hospitalId) {
      return res.status(404).json({ message: 'No hospital assigned to admin' });
    }

    res.json({ hospital: adminUser.hospitalId });
  } catch (error) {
    console.error('Get hospital error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create Hospital (renamed from addHospital for consistency)
export const createHospital = async (req, res) => {
  try {
    const { name, address, city, state, phone, email, type, services } = req.body;

    if (!name || !city || !state) {
      return res.status(400).json({ message: 'Name, city, and state are required' });
    }

    const hospital = await Hospital.create({
      name,
      address,
      city,
      state,
      phone,
      email,
      type: type || 'HOSPITAL',
      services: services || [],
      isActive: true
    });

    res.status(201).json({ message: 'Hospital created successfully', hospital });
  } catch (error) {
    console.error('Create hospital error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add Hospital (alias for createHospital)
export const addHospital = async (req, res) => {
  try {
    const { name, address, city, state, phone, email, type, services } = req.body;

    if (!name || !city || !state) {
      return res.status(400).json({ message: 'Name, city, and state are required' });
    }

    const hospital = await Hospital.create({
      name,
      address,
      city,
      state,
      phone,
      email,
      type: type || 'HOSPITAL',
      services: services || [],
      isActive: true
    });

    res.status(201).json({ message: 'Hospital added successfully', hospital });
  } catch (error) {
    console.error('Add hospital error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update Hospital (admin's own hospital)
export const updateHospital = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.userId);
    
    if (!adminUser.hospitalId) {
      return res.status(404).json({ message: 'No hospital assigned to admin' });
    }

    const hospital = await Hospital.findByIdAndUpdate(
      adminUser.hospitalId,
      { $set: req.body },
      { new: true }
    );

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    res.json({ message: 'Hospital updated successfully', hospital });
  } catch (error) {
    console.error('Update hospital error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update Hospital By ID (for managing any hospital)
export const updateHospitalById = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    const hospital = await Hospital.findByIdAndUpdate(
      hospitalId,
      { $set: req.body },
      { new: true }
    );

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    res.json({ message: 'Hospital updated successfully', hospital });
  } catch (error) {
    console.error('Update hospital by ID error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete Hospital
export const deleteHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    // Check if any staff are assigned to this hospital
    const staffCount = await User.countDocuments({ hospitalId, role: 'STAFF' });
    
    if (staffCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete hospital. ${staffCount} staff members are assigned to it. Please reassign them first.` 
      });
    }

    const hospital = await Hospital.findByIdAndDelete(hospitalId);

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    res.json({ message: 'Hospital deleted successfully' });
  } catch (error) {
    console.error('Delete hospital error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Reactivate Hospital
export const reactivateHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    const hospital = await Hospital.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    hospital.isActive = true;
    await hospital.save();

    res.json({ message: 'Hospital reactivated successfully', hospital });
  } catch (error) {
    console.error('Reactivate hospital error:', error);
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
    user.isActive = false;
    await user.save();

    res.json({ message: 'User suspended successfully', user });
  } catch (error) {
    console.error('Suspend user error:', error);
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

    user.status = 'APPROVED';
    user.isActive = true;
    await user.save();

    res.json({ message: 'User activated successfully', user });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Activity Logs
export const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Get recent user activities, blood requests, donations etc.
    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentRequests = await BloodRequest.find()
      .populate('requesterId', 'name')
      .populate('hospitalId', 'name')
      .select('status bloodGroup createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(10);

    const recentDonations = await Donation.find()
      .populate('userId', 'name')
      .populate('hospitalId', 'name')
      .select('status bloodGroup createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Combine into activity log format
    const activities = [
      ...recentUsers.map(u => ({
        type: 'USER_REGISTRATION',
        message: `New ${u.role.toLowerCase()} registered: ${u.name}`,
        timestamp: u.createdAt
      })),
      ...recentRequests.map(r => ({
        type: 'BLOOD_REQUEST',
        message: `Blood request ${r.status}: ${r.bloodGroup}`,
        timestamp: r.updatedAt
      })),
      ...recentDonations.map(d => ({
        type: 'DONATION',
        message: `Donation ${d.status}: ${d.bloodGroup}`,
        timestamp: d.createdAt
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      activities: activities.slice(0, parseInt(limit)),
      totalPages: 1,
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get System Metrics
export const getMetrics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const metrics = {
      registrationsToday: await User.countDocuments({ createdAt: { $gte: today } }),
      registrationsThisMonth: await User.countDocuments({ createdAt: { $gte: thisMonth } }),
      requestsToday: await BloodRequest.countDocuments({ createdAt: { $gte: today } }),
      requestsThisMonth: await BloodRequest.countDocuments({ createdAt: { $gte: thisMonth } }),
      donationsToday: await Donation.countDocuments({ createdAt: { $gte: today }, status: 'COMPLETED' }),
      donationsThisMonth: await Donation.countDocuments({ createdAt: { $gte: thisMonth }, status: 'COMPLETED' }),
      activeHospitals: await Hospital.countDocuments({ isActive: true }),
      lowStockAlerts: await Inventory.countDocuments({ 
        $expr: { $lte: ['$unitsAvailable', '$lowStockThreshold'] } 
      })
    };

    res.json({ metrics });
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Analytics
export const getAnalytics = async (req, res) => {
  try {
    const { period = '30days' } = req.query;
    
    let startDate = new Date();
    if (period === '7days') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30days') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (period === '90days') {
      startDate.setDate(startDate.getDate() - 90);
    } else if (period === '1year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    // Blood group distribution
    const bloodGroupStats = await User.aggregate([
      { $match: { role: 'USER', bloodGroup: { $ne: null } } },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Donations over time
    const donationStats = await Donation.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'COMPLETED' } },
      { 
        $group: { 
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    // Requests over time
    const requestStats = await BloodRequest.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { 
        $group: { 
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    // User registrations over time
    const userStats = await User.aggregate([
      { $match: { createdAt: { $gte: startDate }, role: 'USER' } },
      { 
        $group: { 
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      bloodGroupStats,
      donationStats,
      requestStats,
      userStats,
      period
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ========== STAFF PROFILE UPDATE APPROVAL SYSTEM ==========

// Get Pending Profile Update Requests - Admin sees ALL pending profile updates
export const getPendingProfileUpdates = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pendingUpdates = await User.find({
      role: 'STAFF',
      profileUpdateStatus: 'PENDING',
      pendingProfileUpdate: { $ne: null }
    })
      .populate('hospitalId', 'name city state')
      .populate('pendingProfileUpdate.hospitalId', 'name city state')
      .select('-password -refreshToken')
      .sort({ 'pendingProfileUpdate.requestedAt': -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments({
      role: 'STAFF',
      profileUpdateStatus: 'PENDING',
      pendingProfileUpdate: { $ne: null }
    });

    res.json({
      updates: pendingUpdates,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get pending profile updates error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Approve Profile Update Request
export const approveProfileUpdate = async (req, res) => {
  try {
    const { staffId } = req.params;

    const staff = await User.findById(staffId);

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    if (staff.profileUpdateStatus !== 'PENDING' || !staff.pendingProfileUpdate) {
      return res.status(400).json({ message: 'No pending profile update request' });
    }

    // Apply the pending updates to the staff profile
    const updates = staff.pendingProfileUpdate;
    
    if (updates.name) staff.name = updates.name;
    if (updates.email) staff.email = updates.email;
    if (updates.phone) staff.phone = updates.phone;
    if (updates.bloodGroup) staff.bloodGroup = updates.bloodGroup;
    if (updates.staffPosition) staff.staffPosition = updates.staffPosition;
    if (updates.department) staff.department = updates.department;
    if (updates.hospitalId) staff.hospitalId = updates.hospitalId;

    // Clear the pending update and set status to approved
    staff.pendingProfileUpdate = null;
    staff.profileUpdateStatus = 'APPROVED';

    await staff.save();

    res.json({ 
      message: 'Profile update approved and applied successfully', 
      staff 
    });
  } catch (error) {
    console.error('Approve profile update error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Reject Profile Update Request
export const rejectProfileUpdate = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { reason } = req.body;

    const staff = await User.findById(staffId);

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    if (staff.profileUpdateStatus !== 'PENDING' || !staff.pendingProfileUpdate) {
      return res.status(400).json({ message: 'No pending profile update request' });
    }

    // Clear the pending update and set status to rejected
    staff.pendingProfileUpdate = null;
    staff.profileUpdateStatus = 'REJECTED';
    staff.profileUpdateRejectionReason = reason || 'Request rejected by admin';

    await staff.save();

    res.json({ 
      message: 'Profile update rejected', 
      staff 
    });
  } catch (error) {
    console.error('Reject profile update error:', error);
    res.status(500).json({ message: error.message });
  }
};
