const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  salesmanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  qrId: {
    type: String,
    required: true,
    trim: true
  },
  payment: {
    mode: {
      type: String,
      enum: ['cash', 'online'],
      required: true
    },
    transactionId: {
      type: String,
      trim: true,
      default: null
    }
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'processed', 'rejected', 'activated'],
    default: 'pending'
  },
  remark: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);