// filepath: /Users/ragnar/Documents/1_Sem_5 Dev_React_node/Full Stack RNODE/LifeForce/server/src/seed/assignHospitalToStaff.js
/**
 * Utility script to assign a hospital to a staff user
 * Run with: node src/seed/assignHospitalToStaff.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Hospital from '../models/Hospital.js';

dotenv.config();

const assignHospitalToStaff = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Find all hospitals
    const hospitals = await Hospital.find({});
    console.log(`\nFound ${hospitals.length} hospitals:`);
    hospitals.forEach((h, i) => {
      console.log(`  ${i + 1}. ${h.name} (ID: ${h._id})`);
    });

    // Find staff users without hospitalId
    const staffWithoutHospital = await User.find({ 
      role: 'STAFF', 
      hospitalId: { $exists: false } 
    }).select('name email status');
    
    const staffWithNullHospital = await User.find({ 
      role: 'STAFF', 
      hospitalId: null 
    }).select('name email status');

    const allStaffWithoutHospital = [...staffWithoutHospital, ...staffWithNullHospital];
    
    console.log(`\nFound ${allStaffWithoutHospital.length} staff users without hospital:`);
    allStaffWithoutHospital.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.name} (${s.email}) - Status: ${s.status}`);
    });

    if (hospitals.length > 0 && allStaffWithoutHospital.length > 0) {
      // Assign first hospital to all staff without hospital
      const firstHospital = hospitals[0];
      
      const result = await User.updateMany(
        { 
          role: 'STAFF', 
          $or: [
            { hospitalId: { $exists: false } },
            { hospitalId: null }
          ]
        },
        { 
          $set: { 
            hospitalId: firstHospital._id,
            status: 'APPROVED' // Also approve them
          } 
        }
      );

      console.log(`\n✓ Assigned hospital "${firstHospital.name}" to ${result.modifiedCount} staff users`);
      console.log('✓ Staff users have been approved');
    } else if (hospitals.length === 0) {
      console.log('\n⚠ No hospitals found. Creating a default hospital...');
      
      const defaultHospital = await Hospital.create({
        name: 'LifeForce General Hospital',
        code: 'LGH',
        address: '123 Medical Center Drive',
        city: 'Mumbai',
        state: 'Maharashtra',
        phone: '1234567890',
        email: 'contact@lifeforce.hospital',
        isActive: true
      });

      console.log(`✓ Created hospital: ${defaultHospital.name}`);

      // Now assign this hospital to staff
      const result = await User.updateMany(
        { 
          role: 'STAFF', 
          $or: [
            { hospitalId: { $exists: false } },
            { hospitalId: null }
          ]
        },
        { 
          $set: { 
            hospitalId: defaultHospital._id,
            status: 'APPROVED'
          } 
        }
      );

      console.log(`✓ Assigned hospital to ${result.modifiedCount} staff users`);
    }

    // Show final status
    const allStaff = await User.find({ role: 'STAFF' }).select('name email hospitalId status');
    console.log('\n--- Final Staff Status ---');
    for (const staff of allStaff) {
      const hospital = staff.hospitalId ? await Hospital.findById(staff.hospitalId).select('name') : null;
      console.log(`  ${staff.name} (${staff.email})`);
      console.log(`    Hospital: ${hospital ? hospital.name : 'NOT ASSIGNED'}`);
      console.log(`    Status: ${staff.status}`);
    }

    await mongoose.disconnect();
    console.log('\n✓ Done');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

assignHospitalToStaff();
