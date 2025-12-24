const Order = require('../models/Order');
const Customer = require('../models/Customer');
const mongoose = require('mongoose');

// Create Order (Salesman)
const createOrder = async (req, res) => {
  try {
    const {
      customer,
      qrId,
      paymentMode,
      transactionId
    } = req.body;

    // Check if QR ID already exists in customers
    const existingCustomer = await Customer.findOne({ qrId });
    if (existingCustomer) {
      return res.status(400).json({ error: 'QR ID already registered' });
    }

    // Create customer
    const newCustomer = new Customer({
      ...customer,
      qrId,
      salesmanId: req.user._id
    });

    await newCustomer.save();

    // Create order
    const order = new Order({
      customerId: newCustomer._id,
      salesmanId: req.user._id,
      qrId,
      payment: {
        mode: paymentMode,
        transactionId: paymentMode === 'online' ? transactionId : null
      },
      status: 'pending'
    });

    await order.save();

    // Populate order with customer details
    const populatedOrder = await Order.findById(order._id)
      .populate('customerId', 'name email mobile vehicleNo modelName driverMobile')
      .populate('salesmanId', 'name userId');

    res.status(201).json({
      message: 'Order created successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get Orders for Salesman
const getSalesmanOrders = async (req, res) => {
  try {
    const orders = await Order.find({ salesmanId: req.user._id })
      .populate('customerId', 'name mobile vehicleNo modelName')
      .sort({ createdAt: -1 });
    
    // Calculate statistics
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const accepted = orders.filter(o => o.status === 'accepted').length;
    const processed = orders.filter(o => o.status === 'processed').length;
    const rejected = orders.filter(o => o.status === 'rejected').length;
    const activated = orders.filter(o => o.status === 'activated').length;

    res.json({
      orders,
      stats: { total, pending, accepted, processed, rejected, activated }
    });
  } catch (error) {
    console.error('Get salesman orders error:', error);
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

    // Convert string ID to ObjectId
    const mongoose = require('mongoose');
    let salesmanId;
    
    try {
      // Use new keyword for ObjectId
      salesmanId = new mongoose.Types.ObjectId(id);
    } catch (error) {
      // If ID is invalid, return empty stats
      return res.json({
        success: true,
        stats: {
          total: 0,
          pending: 0,
          accepted: 0,
          processed: 0,
          rejected: 0,
          activated: 0,
          revenue: 0,
          completionRate: 0
        },
        recentOrders: [],
        monthlyStats: [],
        summary: {
          activeOrders: 0,
          completedOrders: 0,
          successRate: 0
        }
      });
    }

    // Get all orders for this salesman
    const orders = await Order.find({ salesmanId: salesmanId })
      .populate('customerId', 'name email mobile');

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
        customerMobile: order.customerId?.mobile || 'N/A',
        status: order.status,
        createdAt: order.createdAt,
        paymentMode: order.payment.mode,
        vehicleNo: order.customerId?.vehicleNo || 'N/A'
      }));

    // Get orders by month for chart
    const monthlyData = {};
    orders.forEach(order => {
      const month = new Date(order.createdAt).toLocaleString('default', { month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    const monthlyStats = Object.entries(monthlyData)
      .sort((a, b) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(a[0]) - months.indexOf(b[0]);
      })
      .map(([month, count]) => ({
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
      },
      salesmanInfo: {
        name: req.user.name,
        userId: req.user.userId,
        email: req.user.email,
        mobile: req.user.mobile
      }
    });
  } catch (error) {
    console.error('Get salesman stats error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch salesman statistics',
      message: error.message 
    });
  }
};
// Get All Orders (Admin)
const getAllOrders = async (req, res) => {
  try {
    const { status, salesmanId, startDate, endDate } = req.query;
    
    let filter = {};
    
    if (status) filter.status = status;
    if (salesmanId) filter.salesmanId = salesmanId;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter)
      .populate('customerId', 'name mobile vehicleNo modelName email driverMobile')
      .populate('salesmanId', 'name mobile userId')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update Order Status (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remark } = req.body;

    if (!['pending', 'accepted', 'processed', 'rejected', 'activated'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { 
        status,
        remark: remark || '',
        updatedAt: Date.now()
      },
      { new: true }
    )
    .populate('customerId', 'name mobile vehicleNo modelName')
    .populate('salesmanId', 'name userId');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get Order by QR ID (Public)
const getOrderByQrId = async (req, res) => {
  try {
    const { qrId } = req.params;

    const order = await Order.findOne({ qrId })
      .populate('customerId', 'name vehicleNo modelName')
      .populate('salesmanId', 'name userId');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Don't expose payment details to public
    const publicOrder = order.toObject();
    delete publicOrder.payment;

    res.json(publicOrder);
  } catch (error) {
    console.error('Get order by QR error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get Order Details (with payment - for authorized users)
const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid order id' });
    }

    const order = await Order.findById(id)
      .populate({
        path: 'customerId',
        select: '_id name email mobile vehicleNo modelName driverMobile qrId createdAt'
      })
      .populate({
        path: 'salesmanId',
        select: '_id name userId role'
      });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // 🔐 Authorization check (safe)
    const isAdmin = req.user?.role === 'admin';
    const isSalesman =
      order.salesmanId &&
      order.salesmanId._id.toString() === req.user?._id.toString();

    if (!isAdmin && !isSalesman) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // ✅ Clean response (no unwanted mongoose fields)
    res.status(200).json({
      orderId: order._id,
      customer: order.customerId,
      salesman: order.salesmanId,
      payment: order.payment || null,
      createdAt: order.createdAt
    });

  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


module.exports = {
  createOrder,
  getSalesmanOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderByQrId,
  getOrderDetails,
  getSalesmanStats // Add this line
};