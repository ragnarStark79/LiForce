import BloodRequest from '../models/BloodRequest.js';
import Donation from '../models/Donation.js';
import Inventory from '../models/Inventory.js';

// Get Blood Requests (accessible by all authenticated users)
export const getAllBloodRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, urgency, bloodGroup } = req.query;

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (urgency && urgency !== 'all') query.urgency = urgency;
    if (bloodGroup && bloodGroup !== 'all') query.bloodGroup = bloodGroup;

    // Users can only see their own requests
    if (req.user.role === 'USER') {
      query.requesterId = req.user._id;
    }
    // Staff and Admin can see their hospital's requests
    else if (req.user.role === 'STAFF' || req.user.role === 'ADMIN') {
      query.hospitalId = req.user.hospitalId;
    }

    const requests = await BloodRequest.find(query)
      .populate('requesterId')
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

// Get Blood Request by ID
export const getBloodRequestById = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await BloodRequest.findById(requestId)
      .populate('requesterId')
      .populate('hospitalId')
      .populate('assignedStaffId');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Authorization check
    const isOwner = req.user.role === 'USER' && request.requesterId._id.toString() === req.user._id.toString();
    const isHospitalStaff = (req.user.role === 'STAFF' || req.user.role === 'ADMIN') 
      && request.hospitalId._id.toString() === req.user.hospitalId.toString();

    if (!isOwner && !isHospitalStaff) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Donations
export const getAllDonations = async (req, res) => {
  try {
    const { page = 1, limit = 10, bloodGroup } = req.query;

    const query = {};
    if (bloodGroup && bloodGroup !== 'all') query.bloodGroup = bloodGroup;

    // Users can only see their own donations
    if (req.user.role === 'USER') {
      query.donorId = req.user._id;
    }
    // Staff and Admin can see their hospital's donations
    else if (req.user.role === 'STAFF' || req.user.role === 'ADMIN') {
      query.hospitalId = req.user.hospitalId;
    }

    const donations = await Donation.find(query)
      .populate('donorId')
      .populate('hospitalId')
      .sort({ donationDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Donation.countDocuments(query);

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

// Get Inventory Summary
export const getInventorySummary = async (req, res) => {
  try {
    let query = {};

    // If staff or admin, filter by their hospital
    if (req.user.role === 'STAFF' || req.user.role === 'ADMIN') {
      query.hospitalId = req.user.hospitalId;
    }

    const inventory = await Inventory.find(query)
      .populate('hospitalId')
      .sort({ bloodGroup: 1 });

    res.json({ inventory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Blood Statistics
export const getBloodStatistics = async (req, res) => {
  try {
    const { hospitalId } = req.query;

    let matchQuery = {};
    if (hospitalId) {
      matchQuery.hospitalId = hospitalId;
    } else if (req.user.role === 'STAFF' || req.user.role === 'ADMIN') {
      matchQuery.hospitalId = req.user.hospitalId;
    }

    // Aggregate statistics
    const requestStats = await BloodRequest.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const donationStats = await Donation.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$bloodGroup',
          totalUnits: { $sum: '$unitsDonated' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      requestStats,
      donationStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
