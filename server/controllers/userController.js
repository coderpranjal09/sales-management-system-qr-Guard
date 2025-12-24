const User = require('../models/User');

// Create Salesman
const createSalesman = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      aadharNumber,
      address,
      photoUrl,
      bankDetails,
      pin
    } = req.body;

    // Check if mobile or email already exists
    const existingUser = await User.findOne({
      $or: [{ mobile }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Mobile or email already registered' });
    }

    // Check if Aadhar already exists
    const existingAadhar = await User.findOne({ aadharNumber });
    if (existingAadhar) {
      return res.status(400).json({ error: 'Aadhar number already registered' });
    }

    const salesman = new User({
      role: 'salesman',
      name,
      email,
      mobile,
      aadharNumber,
      address,
      photoUrl,
      bankDetails,
      pinHash: pin // Will be hashed by pre-save middleware
    });

    await salesman.save();

    // Return salesman without pinHash
    const salesmanData = salesman.toObject();
    delete salesmanData.pinHash;

    res.status(201).json({
      message: 'Salesman created successfully',
      salesman: salesmanData
    });
  } catch (error) {
    console.error('Create salesman error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get All Salesmen
const getAllSalesmen = async (req, res) => {
  try {
    const salesmen = await User.find({ role: 'salesman' })
      .select('-pinHash')
      .sort({ createdAt: -1 });
    
    res.json(salesmen);
  } catch (error) {
    console.error('Get salesmen error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


// Get Salesman Statistics
const getSalesmanStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is authorized (admin or the salesman themselves)
    if (req.user.role === 'salesman' && req.user._id.toString() !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Convert string ID to ObjectId if needed
    const mongoose = require('mongoose');
    const salesmanId = mongoose.Types.ObjectId.isValid(id) 
      ? mongoose.Types.ObjectId(id) 
      : id;

    // Get all orders for this salesman
    const orders = await Order.find({ salesmanId: salesmanId });

    // Calculate statistics
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const acceptedOrders = orders.filter(order => order.status === 'accepted').length;
    const processedOrders = orders.filter(order => order.status === 'processed').length;
    const rejectedOrders = orders.filter(order => order.status === 'rejected').length;
    const activatedOrders = orders.filter(order => order.status === 'activated').length;

    // Calculate total revenue (for demo - you might want to add price field to orders)
    const totalRevenue = orders.length * 5000; // Assuming ₹5000 per order

    // Get recent orders (last 5)
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(order => ({
        id: order._id,
        qrId: order.qrId,
        customerName: order.customerId?.name || 'N/A',
        status: order.status,
        createdAt: order.createdAt,
        paymentMode: order.payment.mode
      }));

    // Get orders by month for chart
    const monthlyData = {};
    orders.forEach(order => {
      const month = new Date(order.createdAt).toLocaleString('default', { month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    const monthlyStats = Object.entries(monthlyData).map(([month, count]) => ({
      month,
      orders: count
    }));

    res.json({
      success: true,
      stats: {
        total: totalOrders,
        pending: pendingOrders,
        accepted: acceptedOrders,
        processed: processedOrders,
        rejected: rejectedOrders,
        activated: activatedOrders,
        revenue: totalRevenue,
        completionRate: totalOrders > 0 
          ? Math.round(((activatedOrders + processedOrders) / totalOrders) * 100) 
          : 0
      },
      recentOrders,
      monthlyStats,
      summary: {
        activeOrders: pendingOrders + acceptedOrders + processedOrders,
        completedOrders: activatedOrders,
        successRate: totalOrders > 0 
          ? Math.round((activatedOrders / totalOrders) * 100) 
          : 0
      }
    });
  } catch (error) {
    console.error('Get salesman stats error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch salesman statistics' 
    });
  }
};
// Get Salesman by ID
const getSalesmanById = async (req, res) => {
  try {
    const salesman = await User.findOne({
      _id: req.params.id,
      role: 'salesman'
    }).select('-pinHash');

    if (!salesman) {
      return res.status(404).json({ error: 'Salesman not found' });
    }

    res.json(salesman);
  } catch (error) {
    console.error('Get salesman error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createSalesman, getAllSalesmen, getSalesmanById };