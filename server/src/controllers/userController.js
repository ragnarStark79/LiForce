import User from '../models/User.js';
import Donation from '../models/Donation.js';
import BloodRequest from '../models/BloodRequest.js';

// Get User Dashboard Data
export const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const lastDonation = await Donation.findOne({ donorId: userId })
      .sort({ donationDate: -1 })
      .populate('hospitalId');

    const activeRequests = await BloodRequest.find({
      requesterId: userId,
      status: { $in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'] }
    }).populate('hospitalId');

    const nextEligibleDate = lastDonation?.nextEligibleDate || null;

    const totalDonations = await Donation.countDocuments({ donorId: userId });
    const totalRequests = await BloodRequest.countDocuments({ requesterId: userId });

    res.json({
      nextEligibleDate,
      lastDonation,
      activeRequests,
      stats: {
        totalDonations,
        totalRequests,
        livesImpacted: totalDonations * 3,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshToken');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update User Profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    delete updates.role;
    delete updates.status;
    delete updates.password;
    delete updates.email;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Settings
export const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('settings');
    res.json({ 
      settings: user?.settings || {
        emailNotifications: true,
        smsNotifications: true,
        donationReminders: true,
        newsletterUpdates: false,
        theme: 'light',
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update User Settings
export const updateSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { settings } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { settings } },
      { new: true }
    ).select('settings');

    res.json({ message: 'Settings updated successfully', settings: user.settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User's Blood Requests
export const getBloodRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { requesterId: userId };
    if (status) query.status = status;

    const requests = await BloodRequest.find(query)
      .populate('hospitalId')
      .populate('assignedStaffId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await BloodRequest.countDocuments(query);

    res.json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Blood Request
export const createBloodRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { hospitalId, bloodGroup, unitsRequired, urgency, patientName, medicalReason, notes } = req.body;

    if (!hospitalId || !bloodGroup || !unitsRequired) {
      return res.status(400).json({ message: 'Hospital, blood group, and units required are mandatory' });
    }

    const request = await BloodRequest.create({
      requesterType: 'USER',
      requesterId: userId,
      hospitalId,
      bloodGroup,
      unitsRequired,
      urgency: urgency || 'NORMAL',
      patientName,
      medicalReason,
      notes,
      status: 'PENDING'
    });

    const populatedRequest = await BloodRequest.findById(request._id).populate('hospitalId');

    res.status(201).json({
      message: 'Blood request created successfully',
      request: populatedRequest
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User's Donation History
export const getDonationHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const donations = await Donation.find({ donorId: userId })
      .populate('hospitalId')
      .populate('relatedRequestId')
      .sort({ donationDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Donation.countDocuments({ donorId: userId });

    res.json({
      donations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel Blood Request
export const cancelBloodRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { requestId } = req.params;

    const request = await BloodRequest.findOne({
      _id: requestId,
      requesterId: userId
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Cannot cancel completed request' });
    }

    request.status = 'CANCELLED';
    await request.save();

    res.json({ message: 'Request cancelled successfully', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
