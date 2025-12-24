const express = require('express');
const router = express.Router();
const { adminLogin, salesmanLogin } = require('../controllers/authController');

// Admin login
router.post('/admin/login', adminLogin);

// Salesman login
router.post('/salesman/login', salesmanLogin);

module.exports = router;