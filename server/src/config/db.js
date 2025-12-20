import mongoose from 'mongoose';
import { config } from './env.js';

const connectDB = async () => {
  try {
    const uri = config.mongodbUri;

    if (!uri) {
      throw new Error('MONGODB_URI is not set. Add it to your environment variables (.env locally, Render env vars in production).');
    }

    const conn = await mongoose.connect(uri, {
      // Recommended defaults (driver manages most options automatically in Mongoose 8)
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });

    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`✗ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;



// import mongoose from 'mongoose';

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGODB_URI);
//     console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error(`✗ MongoDB Connection Error: ${error.message}`);
//     process.exit(1);
//   }
// };

// export default connectDB;
