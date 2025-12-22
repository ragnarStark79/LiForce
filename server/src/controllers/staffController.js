import BloodRequest from '../models/BloodRequest.js';
import Donation from '../models/Donation.js';
import Inventory from '../models/Inventory.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';
import DonationSchedule from '../models/DonationSchedule.js';
import Hospital from '../models/Hospital.js';

// Helper function to get hospital ID string (handles both populated and non-populated cases)
const getHospitalIdString = (hospitalId) => {
  if (!hospitalId) return null;
  // If it's a populated object with _id, use the _id
  if (hospitalId._id) return hospitalId._id.toString();
  // Otherwise, it's just an ObjectId, use toString directly
  return hospitalId.toString();
};

// Helper function to validate staff has hospitalId
const validateStaffHospital = (req, res) => {
  if (!req.user.hospitalId) {
    res.status(400).json({
      message: 'Staff account not associated with any hospital. Please contact admin.'
    });
    return false;
  }
  return true;
};

// Get Staff Dashboard
export const getDashboard = async (req, res) => {
  try {
    if (!validateStaffHospital(req, res)) return;

    const staffId = req.user._id;
    const hospitalId = req.user.hospitalId;

    const pendingRequests = await BloodRequest.countDocuments({
      hospitalId,
      status: 'PENDING'
    });

    const assignedToMe = await BloodRequest.countDocuments({
      assignedStaffId: staffId,
      status: { $in: ['ASSIGNED', 'IN_PROGRESS'] }
    });

    // Get total completed requests (all time, not just today)
    const completedTotal = await BloodRequest.countDocuments({
      hospitalId,
      status: 'COMPLETED'
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedToday = await BloodRequest.countDocuments({
      hospitalId,
      status: 'COMPLETED',
      updatedAt: { $gte: today }
    });

    const criticalCases = await BloodRequest.countDocuments({
      hospitalId,
      urgency: 'CRITICAL',
      status: { $in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'] }
    });

    const totalPatients = await Patient.countDocuments({ hospitalId, isActive: true });

    // Today's donation stats
    const todayDonations = await Donation.countDocuments({
      hospitalId,
      donationDate: { $gte: today }
    });

    // Count unique donors today
    const todayDonorsList = await Donation.distinct('donorId', {
      hospitalId,
      donationDate: { $gte: today }
    });
    const todayDonors = todayDonorsList.length;

    res.json({
      stats: {
        pendingRequests,
        assignedToMe,
        completedTotal,        // All-time completed
        completedToday,        // Today's completed
        criticalCases,
        totalPatients,
        todayDonations,
        todayDonors
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Blood Requests for Hospital
export const getBloodRequests = async (req, res) => {
  try {
    if (!validateStaffHospital(req, res)) return;

    const hospitalId = req.user.hospitalId;
    const { page = 1, limit = 10, status, urgency, bloodGroup, search } = req.query;

    const query = { hospitalId };
    if (status && status !== '' && status !== 'all') query.status = status;
    if (urgency && urgency !== '' && urgency !== 'all') query.urgency = urgency;
    if (bloodGroup && bloodGroup !== '' && bloodGroup !== 'all') query.bloodGroup = bloodGroup;

    // Search by patient name or requester name
    if (search && search.trim() !== '') {
      query.$or = [
        { patientName: { $regex: search, $options: 'i' } },
      ];
    }

    const requests = await BloodRequest.find(query)
      .populate('requesterId', 'name email phone address city state bloodGroup')
      .populate('assignedStaffId', 'name staffId')
      .populate('hospitalId', 'name address city phone')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await BloodRequest.countDocuments(query);

    res.json({
      requests: requests || [],
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get blood requests error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create Blood Request (Staff creates on behalf of hospital for a patient)
export const createBloodRequest = async (req, res) => {
  try {
    if (!validateStaffHospital(req, res)) return;

    const hospitalId = req.user.hospitalId;
    const staffId = req.user._id;
    const { patientId, bloodGroup, units, urgency, reason, notes, patientName: inputPatientName } = req.body;

    if (!bloodGroup || !units) {
      return res.status(400).json({ message: 'Blood group and units are required' });
    }

    // Get patient name if patientId provided
    let patientName = inputPatientName || null;
    if (patientId) {
      const patient = await Patient.findById(patientId);
      if (patient) {
        patientName = patient.name;
      }
    }

    const request = await BloodRequest.create({
      requesterType: 'HOSPITAL',
      requesterId: staffId, // Store staff user ID as requester
      hospitalId,
      bloodGroup,
      unitsRequired: parseInt(units),
      urgency: urgency || 'NORMAL',
      patientName,
      medicalReason: reason,
      notes,
      status: 'PENDING',
      assignedStaffId: staffId
    });

    const populatedRequest = await BloodRequest.findById(request._id)
      .populate('requesterId', 'name email')
      .populate('assignedStaffId', 'name staffId');

    res.status(201).json({
      message: 'Blood request created successfully',
      request: populatedRequest
    });
  } catch (error) {
    console.error('Create blood request error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Assign Blood Request to Staff
export const assignRequest = async (req, res) => {
  try {
    if (!validateStaffHospital(req, res)) return;

    const staffId = req.user._id;
    const { requestId } = req.params;

    const request = await BloodRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.hospitalId.toString() !== getHospitalIdString(req.user.hospitalId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    request.assignedStaffId = staffId;
    request.status = 'ASSIGNED';
    await request.save();

    res.json({ message: 'Request assigned successfully', request });
  } catch (error) {
    console.error('Assign request error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update Blood Request Status
export const updateRequestStatus = async (req, res) => {
  try {
    if (!validateStaffHospital(req, res)) return;

    const { requestId } = req.params;
    const { status, notes } = req.body;

    const request = await BloodRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.hospitalId.toString() !== getHospitalIdString(req.user.hospitalId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    request.status = status;
    if (notes) request.notes = notes;

    if (status === 'COMPLETED') {
      request.fulfillmentDetails = {
        unitsFulfilled: request.unitsRequired,
        fulfilledDate: new Date(),
        notes
      };
    }

    await request.save();

    res.json({ message: 'Request updated successfully', request });
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Inventory for Hospital
export const getInventory = async (req, res) => {
  try {
    if (!validateStaffHospital(req, res)) return;

    const hospitalId = req.user.hospitalId;

    let inventory = await Inventory.find({ hospitalId })
      .populate('lastUpdatedBy', 'name')
      .sort({ bloodGroup: 1 });

    if (inventory.length === 0) {
      const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      const inventoryDocs = bloodGroups.map(bloodGroup => ({
        hospitalId,
        bloodGroup,
        unitsAvailable: 0,
        lowStockThreshold: 10,
        lastUpdatedBy: req.user._id
      }));
      await Inventory.insertMany(inventoryDocs);
      inventory = await Inventory.find({ hospitalId }).sort({ bloodGroup: 1 });
    }

    res.json({ inventory: inventory || [] });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update Inventory
export const updateInventory = async (req, res) => {
  try {
    if (!validateStaffHospital(req, res)) return;

    const hospitalId = req.user.hospitalId;
    const { bloodGroup, unitsAvailable, operation, units } = req.body;

    if (!bloodGroup) {
      return res.status(400).json({ message: 'Blood group is required' });
    }

    let inventory = await Inventory.findOne({ hospitalId, bloodGroup });

    if (!inventory) {
      inventory = await Inventory.create({
        hospitalId,
        bloodGroup,
        unitsAvailable: 0,
        lowStockThreshold: 10,
        lastUpdatedBy: req.user._id
      });
    }

    if (operation === 'add' && units) {
      inventory.unitsAvailable += parseInt(units);
    } else if (operation === 'subtract' && units) {
      inventory.unitsAvailable = Math.max(0, inventory.unitsAvailable - parseInt(units));
    } else if (unitsAvailable !== undefined) {
      inventory.unitsAvailable = parseInt(unitsAvailable);
    }

    inventory.lastUpdatedBy = req.user._id;
    inventory.lastUpdatedAt = new Date();
    await inventory.save();

    res.json({ message: 'Inventory updated successfully', inventory });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Bulk Update Inventory
export const bulkUpdateInventory = async (req, res) => {
  try {
    if (!validateStaffHospital(req, res)) return;

    const hospitalId = req.user.hospitalId;
    const { updates } = req.body;

    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ message: 'Updates array is required' });
    }

    const results = [];
    for (const update of updates) {
      const { bloodGroup, unitsAvailable } = update;

      let inventory = await Inventory.findOne({ hospitalId, bloodGroup });

      if (!inventory) {
        inventory = await Inventory.create({
          hospitalId,
          bloodGroup,
          unitsAvailable: parseInt(unitsAvailable) || 0,
          lowStockThreshold: 10,
          lastUpdatedBy: req.user._id
        });
      } else {
        inventory.unitsAvailable = parseInt(unitsAvailable) || 0;
        inventory.lastUpdatedBy = req.user._id;
        await inventory.save();
      }

      results.push(inventory);
    }

    res.json({ message: 'Inventory updated successfully', inventory: results });
  } catch (error) {
    console.error('Bulk update inventory error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Patients
export const getPatients = async (req, res) => {
  try {
    if (!validateStaffHospital(req, res)) return;

    const hospitalId = req.user.hospitalId;
    const { page = 1, limit = 10, search, bloodGroup } = req.query;

    const query = { hospitalId, isActive: true };

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (bloodGroup && bloodGroup !== '' && bloodGroup !== 'all') {
      query.bloodGroup = bloodGroup;
    }

    const patients = await Patient.find(query)
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Patient.countDocuments(query);

    res.json({
      patients: patients || [],
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Search Patients (for autocomplete)
export const searchPatients = async (req, res) => {
  try {
    if (!validateStaffHospital(req, res)) return;

    const hospitalId = req.user.hospitalId;
    const { query: searchQuery } = req.query;

    if (!searchQuery || searchQuery.trim() === '') {
      return res.json({ patients: [] });
    }

    const patients = await Patient.find({
      hospitalId,
      isActive: true,
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { phone: { $regex: searchQuery, $options: 'i' } }
      ]
    })
      .select('name phone bloodGroup')
      .limit(10);

    res.json({ patients: patients || [] });
  } catch (error) {
    console.error('Search patients error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add Patient
export const addPatient = async (req, res) => {
  try {
    if (!validateStaffHospital(req, res)) return;

    const hospitalId = req.user.hospitalId;
    const { name, phone, email, age, gender, bloodGroup, address, city, state, medicalHistory, emergencyContact, notes } = req.body;

    if (!name || !phone || !bloodGroup) {
      return res.status(400).json({
        message: 'Please provide required fields: name, phone, bloodGroup'
      });
    }

    const existingPatient = await Patient.findOne({ phone, hospitalId });
    if (existingPatient) {
      return res.status(400).json({
        message: 'A patient with this phone number already exists'
      });
    }

    const patient = await Patient.create({
      name,
      phone,
      email,
      age: age || null,
      gender: gender || null,
      bloodGroup,
      address,
      city,
      state,
      hospitalId,
      addedBy: req.user._id,
      medicalHistory,
      emergencyContact,
      notes,
      isActive: true
    });

    res.status(201).json({ message: 'Patient added successfully', patient });
  } catch (error) {
    console.error('Add patient error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update Patient
export const updatePatient = async (req, res) => {
  try {
    if (!validateStaffHospital(req, res)) return;

    const { patientId } = req.params;
    const hospitalId = req.user.hospitalId;

    const patient = await Patient.findOne({ _id: patientId, hospitalId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    Object.assign(patient, req.body);
    await patient.save();

    res.json({ message: 'Patient updated successfully', patient });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete Patient
export const deletePatient = async (req, res) => {
  try {
    if (!validateStaffHospital(req, res)) return;

    const { patientId } = req.params;
    const hospitalId = req.user.hospitalId;

    const patient = await Patient.findOne({ _id: patientId, hospitalId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    patient.isActive = false;
    await patient.save();

    res.json({ message: 'Patient removed successfully' });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Record Donation
export const recordDonation = async (req, res) => {
  try {
    if (!validateStaffHospital(req, res)) return;

    const hospitalId = req.user.hospitalId;
    const { donorId, bloodGroup, unitsDonated, donorWeight, donorBloodPressure, donorHemoglobin, relatedRequestId, notes } = req.body;

    if (!donorId || !bloodGroup || !unitsDonated) {
      return res.status(400).json({ message: 'Donor ID, blood group, and units donated are required' });
    }

    const donation = await Donation.create({
      donorId,
      hospitalId,
      bloodGroup,
      unitsDonated: parseInt(unitsDonated),
      donorWeight,
      donorBloodPressure,
      donorHemoglobin,
      relatedRequestId,
      notes,
      donationDate: new Date()
    });

    await User.findByIdAndUpdate(donorId, { lastDonationDate: new Date() });

    let inventory = await Inventory.findOne({ hospitalId, bloodGroup });
    if (inventory) {
      inventory.unitsAvailable += parseInt(unitsDonated);
      inventory.lastUpdatedBy = req.user._id;
      await inventory.save();
    }

    res.status(201).json({ message: 'Donation recorded successfully', donation });
  } catch (error) {
    console.error('Record donation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== DONATION SCHEDULE MANAGEMENT ====================

// Get Donation Schedules for Hospital
export const getDonationSchedules = async (req, res) => {
  try {
    if (!validateStaffHospital(req, res)) return;

    const hospitalId = req.user.hospitalId;
    const { page = 1, limit = 10, status, date } = req.query;

    const query = { hospitalId };
    if (status && status !== 'all') {
      query.status = status;
    }
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.scheduledDate = { $gte: startDate, $lte: endDate };
    }

    const schedules = await DonationSchedule.find(query)
      .populate('donorId', 'name email phone bloodGroup')
      .populate('assignedStaffId', 'name staffId phone')
      .populate('hospitalId', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await DonationSchedule.countDocuments(query);

    // Get stats
    const pendingCount = await DonationSchedule.countDocuments({ hospitalId, status: 'PENDING' });
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const todayCount = await DonationSchedule.countDocuments({
      hospitalId,
      scheduledDate: { $gte: todayStart, $lte: todayEnd },
      status: { $in: ['PENDING', 'ASSIGNED', 'CONFIRMED'] }
    });

    res.json({
      schedules,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
      stats: {
        pending: pendingCount,
        today: todayCount
      }
    });
  } catch (error) {
    console.error('Get donation schedules error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Assign Staff to Donation Schedule
export const assignDonationSchedule = async (req, res) => {
  try {
    if (!validateStaffHospital(req, res)) return;

    const staffId = req.user._id;
    const { scheduleId } = req.params;

    const schedule = await DonationSchedule.findById(scheduleId);

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    if (schedule.hospitalId.toString() !== getHospitalIdString(req.user.hospitalId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    schedule.assignedStaffId = staffId;
    schedule.assignedAt = new Date();
    schedule.status = 'ASSIGNED';
    await schedule.save();

    const populatedSchedule = await DonationSchedule.findById(scheduleId)
      .populate('donorId', 'name email phone')
      .populate('assignedStaffId', 'name phone');

    res.json({ message: 'Schedule assigned to you successfully', schedule: populatedSchedule });
  } catch (error) {
    console.error('Assign donation schedule error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update Donation Schedule Status
export const updateDonationScheduleStatus = async (req, res) => {
  try {
    if (!validateStaffHospital(req, res)) return;

    const { scheduleId } = req.params;
    const { status, notes } = req.body;

    const schedule = await DonationSchedule.findById(scheduleId);

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    if (schedule.hospitalId.toString() !== getHospitalIdString(req.user.hospitalId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    schedule.status = status;
    if (notes) schedule.notes = notes;

    if (status === 'COMPLETED') {
      schedule.completedAt = new Date();
    } else if (status === 'CANCELLED') {
      schedule.cancelledAt = new Date();
      schedule.cancellationReason = notes || 'Cancelled by staff';
    }

    await schedule.save();

    res.json({ message: 'Schedule updated successfully', schedule });
  } catch (error) {
    console.error('Update donation schedule status error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Complete Donation and Record it
export const completeDonationSchedule = async (req, res) => {
  try {
    if (!validateStaffHospital(req, res)) return;

    const hospitalId = req.user.hospitalId;
    const { scheduleId } = req.params;
    const { unitsDonated, donorWeight, donorBloodPressure, donorHemoglobin, notes } = req.body;

    const schedule = await DonationSchedule.findById(scheduleId).populate('donorId');

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    if (schedule.hospitalId.toString() !== getHospitalIdString(hospitalId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Create donation record
    const donation = await Donation.create({
      donorId: schedule.donorId._id,
      hospitalId,
      bloodGroup: schedule.donorBloodGroup,
      unitsDonated: parseInt(unitsDonated) || 1,
      donorWeight,
      donorBloodPressure,
      donorHemoglobin,
      notes,
      donationDate: new Date()
    });

    // Update user's last donation date
    await User.findByIdAndUpdate(schedule.donorId._id, {
      lastDonationDate: new Date()
    });

    // Update inventory
    let inventory = await Inventory.findOne({ hospitalId, bloodGroup: schedule.donorBloodGroup });
    if (inventory) {
      inventory.unitsAvailable += parseInt(unitsDonated) || 1;
      inventory.lastUpdatedBy = req.user._id;
      await inventory.save();
    }

    // Update schedule status
    schedule.status = 'COMPLETED';
    schedule.completedAt = new Date();
    await schedule.save();

    res.json({
      message: 'Donation completed and recorded successfully',
      schedule,
      donation
    });
  } catch (error) {
    console.error('Complete donation schedule error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Staff Profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -refreshToken')
      .populate('hospitalId', 'name address city state phone email code')
      .populate('pendingProfileUpdate.hospitalId', 'name city state code');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update Staff Profile - Submit for Admin Approval
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, phone, bloodGroup, staffPosition, department, hospitalId, reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if there's already a pending update request
    if (user.profileUpdateStatus === 'PENDING') {
      return res.status(400).json({
        message: 'You already have a pending profile update request. Please wait for admin approval.'
      });
    }

    // Build the pending update object with only changed fields
    const pendingUpdate = {
      requestedAt: new Date(),
      reason: reason || 'Profile update request'
    };

    // Only include fields that are different from current values
    if (name && name !== user.name) pendingUpdate.name = name;
    if (phone && phone !== user.phone) pendingUpdate.phone = phone;
    if (bloodGroup && bloodGroup !== user.bloodGroup) pendingUpdate.bloodGroup = bloodGroup;
    if (staffPosition && staffPosition !== user.staffPosition) pendingUpdate.staffPosition = staffPosition;
    if (department && department !== user.department) pendingUpdate.department = department;
    if (hospitalId && hospitalId.toString() !== user.hospitalId?.toString()) pendingUpdate.hospitalId = hospitalId;

    // Check if there are any actual changes
    const hasChanges = Object.keys(pendingUpdate).some(key =>
      key !== 'requestedAt' && key !== 'reason'
    );

    if (!hasChanges) {
      return res.status(400).json({ message: 'No changes detected in your profile update request.' });
    }

    // Set pending profile update
    user.pendingProfileUpdate = pendingUpdate;
    user.profileUpdateStatus = 'PENDING';
    user.profileUpdateRejectionReason = null; // Clear any previous rejection reason

    await user.save();

    // Return updated user with populated fields
    const updatedUser = await User.findById(userId)
      .select('-password -refreshToken')
      .populate('hospitalId', 'name address city state phone email code')
      .populate('pendingProfileUpdate.hospitalId', 'name city state code');

    res.json({
      message: 'Profile update request submitted successfully. Please wait for admin approval.',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Cancel pending profile update request
export const cancelProfileUpdateRequest = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.profileUpdateStatus !== 'PENDING') {
      return res.status(400).json({ message: 'No pending profile update request to cancel.' });
    }

    user.pendingProfileUpdate = null;
    user.profileUpdateStatus = 'NONE';
    await user.save();

    const updatedUser = await User.findById(userId)
      .select('-password -refreshToken')
      .populate('hospitalId', 'name address city state phone email code');

    res.json({
      message: 'Profile update request cancelled successfully.',
      user: updatedUser
    });
  } catch (error) {
    console.error('Cancel profile update error:', error);
    res.status(500).json({ message: error.message });
  }
};