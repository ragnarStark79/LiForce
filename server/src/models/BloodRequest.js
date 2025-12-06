import mongoose from 'mongoose';

const bloodRequestSchema = new mongoose.Schema(
  {
    requesterType: {
      type: String,
      enum: ['USER', 'HOSPITAL'],
      required: true,
    },
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Changed from refPath - always reference User for simplicity
      required: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    unitsRequired: {
      type: Number,
      required: true,
      min: 1,
    },
    urgency: {
      type: String,
      enum: ['NORMAL', 'HIGH', 'CRITICAL'],
      default: 'NORMAL',
    },
    status: {
      type: String,
      enum: ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
    },
    assignedStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    patientName: String,
    patientAge: Number,
    medicalReason: String,
    requiredByDate: Date,
    notes: String,
    fulfillmentDetails: {
      unitsFulfilled: Number,
      fulfilledDate: Date,
      notes: String,
    },
  },
  {
    timestamps: true,
  }
);

const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);

export default BloodRequest;
