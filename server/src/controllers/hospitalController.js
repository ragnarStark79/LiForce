import Hospital from '../models/Hospital.js';
import Inventory from '../models/Inventory.js';

// Get All Hospitals
export const getAllHospitals = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, city } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }
    if (city) query.city = city;

    const hospitals = await Hospital.find(query)
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Hospital.countDocuments(query);

    res.json({
      hospitals,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Hospital by ID
export const getHospitalById = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    const hospital = await Hospital.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Get inventory for this hospital
    const inventory = await Inventory.find({ hospitalId })
      .sort({ bloodGroup: 1 });

    res.json({
      hospital,
      inventory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Hospital (Admin only)
export const createHospital = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      departments,
      bloodBankCapacity,
      emergencyContact,
      website,
      operatingHours
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !address || !city || !state) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: name, email, phone, address, city, state' 
      });
    }

    // Check if hospital with same email exists
    const existingHospital = await Hospital.findOne({ email });
    if (existingHospital) {
      return res.status(400).json({ message: 'A hospital with this email already exists' });
    }

    // Generate unique hospital code
    const hospitalCount = await Hospital.countDocuments();
    const code = `HQ${String(hospitalCount + 1).padStart(3, '0')}`;

    // Create hospital
    const hospital = await Hospital.create({
      name,
      code,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      departments: departments || ['Emergency', 'Blood Bank'],
      bloodBankCapacity: bloodBankCapacity || 100,
      emergencyContact,
      website,
      operatingHours,
      isActive: true
    });

    // Initialize blood inventory for the hospital
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const inventoryDocs = bloodGroups.map(bloodGroup => ({
      hospitalId: hospital._id,
      bloodGroup,
      unitsAvailable: 0,
      lowStockThreshold: 10,
      lastUpdatedBy: req.user._id
    }));

    await Inventory.insertMany(inventoryDocs);

    res.status(201).json({
      message: 'Hospital created successfully',
      hospital
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Hospital (Admin only)
export const updateHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.code;
    delete updateData._id;

    const hospital = await Hospital.findByIdAndUpdate(
      hospitalId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    res.json({
      message: 'Hospital updated successfully',
      hospital
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Hospital (Admin only)
export const deleteHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Soft delete - just mark as inactive
    hospital.isActive = false;
    await hospital.save();

    res.json({ message: 'Hospital deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Hospital Inventory
export const getHospitalInventory = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    const inventory = await Inventory.find({ hospitalId })
      .sort({ bloodGroup: 1 });

    res.json({ inventory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
