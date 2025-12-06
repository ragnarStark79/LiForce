import BloodRequest from '../models/BloodRequest.js';
import Donation from '../models/Donation.js';
import Inventory from '../models/Inventory.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';

// Get Staff Dashboard
export const getDashboard = async (req, res) => {
  try {
    const staffId = req.user._id;
    const hospitalId = req.user.hospitalId;

    const pendingRequests = await BloodRequest.find({
      hospitalId,
      status: 'PENDING'
    }).countDocuments();

    const assignedToMe = await BloodRequest.find({
      assignedStaffId: staffId,
      status: { $in: ['ASSIGNED', 'IN_PROGRESS'] }
    }).countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completedToday = await BloodRequest.find({
      hospitalId,
      status: 'COMPLETED',
      updatedAt: { $gte: today }
    }).countDocuments();

    const criticalCases = await BloodRequest.find({
      hospitalId,
      urgency: 'CRITICAL',
      status: { $in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'] }
    }).countDocuments();

    const totalPatients = await Patient.countDocuments({ hospitalId, isActive: true });

    res.json({
      stats: {
        pendingRequests,
        assignedToMe,
        completedToday,
        criticalCases,
        totalPatients
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Blood Requests for Hospital
export const getBloodRequests = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    const { page = 1, limit = 10, status, urgency, bloodGroup } = req.query;

    const query = { hospitalId };
    if (status && status !== 'all') query.status = status;
    if (urgency && urgency !== 'all') query.urgency = urgency;
    if (bloodGroup && bloodGroup !== 'all') query.bloodGroup = bloodGroup;

    const requests = await BloodRequest.find(query)
      .populate('requesterId', 'name email phone')
      .populate('assignedStaffId', 'name staffId')
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

// Assign Blood Request to Staff
export const assignRequest = async (req, res) => {
  try {
    const staffId = req.user._id;
    const { requestId } = req.params;

    const request = await BloodRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.hospitalId.toString() !== req.user.hospitalId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    request.assignedStaffId = staffId;
    request.status = 'ASSIGNED';
    await request.save();

    res.json({ message: 'Request assigned successfully', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Blood Request Status
export const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, notes } = req.body;

    const request = await BloodRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.hospitalId.toString() !== req.user.hospitalId.toString()) {
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
    res.status(500).json({ message: error.message });
  }
};

// Get Inventory for Hospital
export const getInventory = async (req, res) => {
  try {
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

    res.json({ inventory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Inventory
export const updateInventory = async (req, res) => {
  try {
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
    res.status(500).json({ message: error.message });
  }
};

// Bulk Update Inventory
export const bulkUpdateInventory = async (req, res) => {
  try {
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
    res.status(500).json({ message: error.message });
  }
};

// Get Patients
export const getPatients = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    const { page = 1, limit = 10, search, bloodGroup } = req.query;

    const query = { hospitalId, isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (bloodGroup && bloodGroup !== 'all') {
      query.bloodGroup = bloodGroup;
    }

    const patients = await Patient.find(query)
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Patient.countDocuments(query);

    res.json({
      patients,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add Patient
export const addPatient = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    const { name, phone, email, age, gender, bloodGroup, address, city, state, medicalHistory, emergencyContact, notes } = req.body;

    if (!name || !phone || !age || !gender || !bloodGroup) {
      return res.status(400).json({
        message: 'Please provide required fields: name, phone, age, gender, bloodGroup'
      });
    }

    const existingPatient = await Patient.findOne({ phone, hospitalId });
    if (existingPatient) {
      return res.status(400).json({ 
        message: 'A patient with this phone number already exists' 
      });
    }

    const patient = await Patient.create({
      name, phone, email, age, gender, bloodGroup, address, city, state,
      hospitalId,
      addedBy: req.user._id,
      medicalHistory, emergencyContact, notes
    });

    res.status(201).json({ message: 'Patient added successfully', patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Patient
export const updatePatient = async (req, res) => {
  try {
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
    res.status(500).json({ message: error.message });
  }
};

// Delete Patient
export const deletePatient = async (req, res) => {
  try {
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
    res.status(500).json({ message: error.message });
  }
};

// Record Donation
export const recordDonation = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    const { donorId, bloodGroup, unitsDonated, donorWeight, donorBloodPressure, donorHemoglobin, relatedRequestId, notes } = req.body;

    const donation = await Donation.create({
      donorId, hospitalId, bloodGroup, unitsDonated, donorWeight, donorBloodPressure, donorHemoglobin, relatedRequestId, notes,
      donationDate: new Date()
    });

    await User.findByIdAndUpdate(donorId, { lastDonationDate: new Date() });

    let inventory = await Inventory.findOne({ hospitalId, bloodGroup });
    if (inventory) {
      inventory.unitsAvailable += unitsDonated;
      inventory.lastUpdatedBy = req.user._id;
      await inventory.save();
    }

    res.status(201).json({ message: 'Donation recorded successfully', donation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};