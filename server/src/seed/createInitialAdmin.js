import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Hospital from '../models/Hospital.js';

dotenv.config();

const createDemoAccounts = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lifeforce';
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    let hospital = await Hospital.findOne({ code: 'HQ001' });
    if (!hospital) {
      hospital = await Hospital.create({
        name: 'LifeForce General Hospital',
        code: 'HQ001',
        email: 'admin@liforce.hospital',
        phone: '+1234567890',
        address: '123 Health Street',
        city: 'Medical City',
        state: 'Healthcare State',
        zipCode: '12345',
        departments: ['Emergency', 'Blood Bank', 'Surgery'],
        bloodBankCapacity: 500,
      });
      console.log('✓ Created default hospital');
    } else {
      console.log('⚠️  Hospital already exists');
    }

    let admin = await User.findOne({ email: 'admin@liforce.com' });
    if (!admin) {
      admin = await User.create({
        name: 'System Administrator',
        email: 'admin@liforce.com',
        password: 'Admin@123456',
        phone: '+1234567890',
        role: 'ADMIN',
        status: 'APPROVED',
        hospitalId: hospital._id,
        isEmailVerified: true,
      });
      console.log('✓ Created Admin user');
    } else {
      console.log('⚠️  Admin user already exists');
    }

    let staff = await User.findOne({ email: 'staff@liforce.com' });
    if (!staff) {
      staff = await User.create({
        name: 'Demo Staff Member',
        email: 'staff@liforce.com',
        password: 'Staff@123456',
        phone: '+1234567891',
        role: 'STAFF',
        status: 'APPROVED',
        hospitalId: hospital._id,
        staffPosition: 'Doctor',
        staffId: 'HQ001-0001',
        isEmailVerified: true,
      });
      console.log('✓ Created Staff user');
    } else {
      console.log('⚠️  Staff user already exists');
    }

    let user = await User.findOne({ email: 'user@liforce.com' });
    if (!user) {
      user = await User.create({
        name: 'Demo User',
        email: 'user@liforce.com',
        password: 'User@123456',
        phone: '+1234567892',
        role: 'USER',
        status: 'ACTIVE',
        bloodGroup: 'O+',
        address: '456 Donor Avenue',
        city: 'Blood City',
        state: 'Donor State',
        zipCode: '54321',
        isEmailVerified: true,
      });
      console.log('✓ Created regular User');
    } else {
      console.log('⚠️  Regular user already exists');
    }

    console.log('\n========================================');
    console.log('✓ Demo accounts created successfully!');
    console.log('========================================\n');
    console.log('ADMIN: admin@liforce.com / Admin@123456');
    console.log('STAFF: staff@liforce.com / Staff@123456');
    console.log('USER:  user@liforce.com / User@123456\n');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error);
    process.exit(1);
  }
};

createDemoAccounts();