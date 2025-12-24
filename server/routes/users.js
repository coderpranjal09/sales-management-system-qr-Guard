const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  createSalesman,
  getAllSalesmen,
  getSalesmanById
} = require('../controllers/userController');

// All routes require admin authentication
router.use(auth);
router.use(authorize('admin'));

// Create salesman
router.post('/salesmen', createSalesman);

// Get all salesmen
router.get('/salesmen', getAllSalesmen);

// Get salesman by ID
router.get('/salesmen/:id', getSalesmanById);

module.exports = router;