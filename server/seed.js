const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/qrguard');
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});

    // Create admin user
    const admin = new User({
      role: 'admin',
      name: 'System Admin',
      email: 'admin@qrgtech.com',
      mobile: '9999999999',
      userId: 'ADMIN001'
    });

    await admin.save();

    // Create sample salesman
    const salesman = new User({
      role: 'salesman',
      name: 'John Doe',
      email: 'john@example.com',
      mobile: '9876543210',
      pinHash: '$2a$10$YourHashedPINHere', // Will be hashed by middleware
      aadharNumber: '123412341234',
      address: '123 Main St, City, State',
      photoUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
      bankDetails: {
        accountNumber: '123456789012',
        ifscCode: 'SBIN0001234',
        bankName: 'State Bank of India'
      }
    });

    await salesman.save();

    console.log('Database seeded successfully!');
    console.log('Admin credentials:');
    console.log('Email: admin@qrgtech.com');
    console.log('Password: admin123');
    console.log('');
    console.log('Sample salesman:');
    console.log('Mobile: 9876543210');
    console.log('PIN: 1234 (if using the pre-hashed value)');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();