const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['admin', 'salesman'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: function() {
      return this.role === 'admin';
    },
    unique: true,
    lowercase: true,
    trim: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  pinHash: {
    type: String,
    required: function() {
      return this.role === 'salesman';
    }
  },
  userId: {
    type: String,
    unique: true,
    trim: true
  },
  aadharNumber: {
    type: String,
    required: function() {
      return this.role === 'salesman';
    },
    unique: true,
    trim: true
  },
  address: {
    type: String,
    required: function() {
      return this.role === 'salesman';
    },
    trim: true
  },
  photoUrl: {
    type: String,
    trim: true
  },
  bankDetails: {
    accountNumber: {
      type: String,
      required: function() {
        return this.role === 'salesman';
      },
      trim: true
    },
    ifscCode: {
      type: String,
      required: function() {
        return this.role === 'salesman';
      },
      trim: true
    },
    bankName: {
      type: String,
      required: function() {
        return this.role === 'salesman';
      },
      trim: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash pin before saving salesman
userSchema.pre('save', async function(next) {
  if (this.role === 'salesman' && this.isModified('pinHash')) {
    const salt = await bcrypt.genSalt(10);
    this.pinHash = await bcrypt.hash(this.pinHash, salt);
  }
  next();
});

// Method to compare pin
userSchema.methods.comparePin = async function(pin) {
  return await bcrypt.compare(pin, this.pinHash);
};

// Generate userId for salesman
userSchema.pre('save', async function(next) {
  if (this.role === 'salesman' && !this.userId) {
    const count = await mongoose.models.User.countDocuments({ role: 'salesman' });
    this.userId = `SAL${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);