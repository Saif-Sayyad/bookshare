const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');
const { check } = require('express-validator');

// Book listing and search (public)
router.get('/', bookController.listBooks);
router.get('/search', bookController.searchBooks);

// Add book (protected routes)
router.get('/add', authMiddleware.isAuthenticated, bookController.getAddBook);
router.post('/add', authMiddleware.isAuthenticated, [
  check('title')
    .not().isEmpty().trim().withMessage('Title is required')
    .isLength({ max: 255 }).withMessage('Title too long'),
  check('author')
    .not().isEmpty().trim().withMessage('Author is required')
    .isLength({ max: 255 }).withMessage('Author name too long'),
  check('description')
    .not().isEmpty().trim().withMessage('Description is required'),
  check('price')
    .isIn(['donate', 'sell']).withMessage('Invalid option'),
    check('priceAmount')
    .if((value, { req }) => req.body.price === 'sell')
    .not().isEmpty().withMessage('Price is required when selling')
    .custom(value => {
      const num = Number(value);
      return !isNaN(num) && num > 0;
    }).withMessage('Must be a valid number greater than 0')
    .customSanitizer(value => parseFloat(value).toFixed(2)),
], bookController.postAddBook);

// Book details (public)
router.get('/:id', bookController.getBookDetails);

module.exports = router;