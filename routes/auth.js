const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const authController = require('../controllers/authController');

// Login routes
router.get('/login', authController.getLogin);
router.post('/login', [
  check('email').isEmail().normalizeEmail(),
  check('password').not().isEmpty()
], authController.postLogin);

// Register routes
router.get('/register', authController.getRegister);
router.post('/register', [
  check('username').not().isEmpty().trim(),
  check('email').isEmail().normalizeEmail(),
  check('password').isLength({ min: 6 })
], authController.postRegister);

// Logout
router.get('/logout', authController.logout);

module.exports = router;