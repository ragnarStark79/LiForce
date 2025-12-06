import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
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
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    unitsDonated: {
      type: Number,
      required: true,
      default: 1,
    },
    donationDate: {
      type: Date,
      default: Date.now,
    },
    relatedRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
    },
    donorWeight: Number,
    donorBloodPressure: String,
    donorHemoglobin: Number,
    screeningPassed: {
      type: Boolean,
      default: true,
    },
    notes: String,
    nextEligibleDate: Date,
  },
  {
    timestamps: true,
  }
);

// Calculate next eligible date before saving
donationSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('donationDate')) {
    const nextDate = new Date(this.donationDate);
    nextDate.setDate(nextDate.getDate() + 90); // 90 days waiting period
    this.nextEligibleDate = nextDate;
  }
  next();
});

const Donation = mongoose.model('Donation', donationSchema);

export default Donation;
