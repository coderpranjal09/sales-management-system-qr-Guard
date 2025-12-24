const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  });
};

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // For demo purposes - in production, use proper password hashing
    // Admin email: admin@qrgtech.com, password: admin123
    if (email === 'admin@qrgtech.com' && password === 'QrGuard@2025') {
      // Check if admin exists, create if not
      let admin = await User.findOne({ email, role: 'admin' });
      
      if (!admin) {
        admin = new User({
          role: 'admin',
          name: 'System Admin',
          email: 'admin@qrgtech.com',
          mobile: '0000000000',
          userId: 'ADMIN001'
        });
        await admin.save();
      }

      const token = generateToken(admin._id);
      
      res.json({
        user: {
          id: admin._id,
          role: admin.role,
          name: admin.name,
          email: admin.email,
          userId: admin.userId
        },
        token
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Salesman Login
const salesmanLogin = async (req, res) => {
  try {
    const { mobile, pin } = req.body;

    if (!mobile || !pin) {
      return res.status(400).json({ error: 'Mobile and PIN are required' });
    }

    const salesman = await User.findOne({ mobile, role: 'salesman' });
    
    if (!salesman) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await salesman.comparePin(pin);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(salesman._id);
    
    res.json({
      user: {
        id: salesman._id,
        role: salesman.role,
        name: salesman.name,
        email: salesman.email,
        mobile: salesman.mobile,
        userId: salesman.userId,
        photoUrl: salesman.photoUrl
      },
      token
    });
  } catch (error) {
    console.error('Salesman login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { adminLogin, salesmanLogin };