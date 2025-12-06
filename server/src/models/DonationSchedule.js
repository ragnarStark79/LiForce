// filepath: /Users/ragnar/Documents/1_Sem_5 Dev_React_node/Full Stack RNODE/LifeForce/server/src/models/DonationSchedule.js
import mongoose from 'mongoose';

const donationScheduleSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    scheduledTime: {
      type: String,
      required: [true, 'Scheduled time is required'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'ASSIGNED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
      default: 'PENDING',
    },
    assignedStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    donorName: {
      type: String,
      required: true,
    },
    donorPhone: {
      type: String,
      required: true,
    },
    donorBloodGroup: {
      type: String,
      required: true,
    },
    donorAddress: {
      type: String,
    },
    notes: {
      type: String,
    },
    assignedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
donationScheduleSchema.index({ hospitalId: 1, status: 1 });
donationScheduleSchema.index({ donorId: 1 });
donationScheduleSchema.index({ assignedStaffId: 1 });
donationScheduleSchema.index({ scheduledDate: 1 });

const DonationSchedule = mongoose.model('DonationSchedule', donationScheduleSchema);

export default DonationSchedule;
