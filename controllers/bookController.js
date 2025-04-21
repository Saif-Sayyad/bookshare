const Book = require('../models/Book');
const { validationResult } = require('express-validator');

exports.listBooks = async (req, res) => {
  try {
    const books = await Book.findAll();
    res.render('books/list', {
      title: 'Available Books',
      books,
      user: req.session.user,
      searchParams: {},
      successMessage: req.flash('success')
    });
  } catch (err) {
    console.error('List Books Error:', err);
    res.status(500).render('error', {
      message: 'Failed to load books',
      title: 'Error',
      user: req.session.user
    });
  }
};

exports.searchBooks = async (req, res) => {
  try {
    const { title, author, maxPrice } = req.query;
    const books = await Book.search({ title, author, maxPrice });
    
    res.render('books/list', {
      title: 'Search Results',
      books,
      user: req.session.user,
      searchParams: { title, author, maxPrice }
    });
  } catch (err) {
    console.error('Search Books Error:', err);
    res.status(500).render('error', {
      message: 'Search failed',
      title: 'Error',
      user: req.session.user
    });
  }
};

exports.getAddBook = (req, res) => {
  res.render('books/add', {
    title: 'Add Book',
    user: req.session.user,
    errors: null,
    book: {
      title: '',
      author: '',
      description: '',
      price: 'donate',
      priceAmount: ''
    }
  });
};

exports.postAddBook = async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.render('books/add', {
      title: 'Add Book',
      user: req.session.user,
      errors: errors.array(),
      book: req.body
    });
  }

  try {
    const { title, author, description, price, priceAmount } = req.body;
    
    // Handle price conversion
    let bookPrice = null;
    if (price === 'sell') {
      // Convert to number and validate
      const numericPrice = Number(priceAmount);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        throw new Error('Please enter a valid price greater than 0');
      }
      bookPrice = numericPrice.toFixed(2); // Ensure 2 decimal places
    }

    const insertId = await Book.create({
      title,
      author,
      description,
      price: bookPrice,
      userId: req.session.user.id
    });

    req.flash('success', `Book ${price === 'donate' ? 'donated' : 'listed for ₹'+bookPrice} successfully!`);
    res.redirect('/books');
  } catch (err) {
    console.error('Add Book Error:', err);
    res.render('books/add', {
      title: 'Add Book',
      user: req.session.user,
      errors: [{ msg: err.message }],
      book: req.body
    });
  }
};

exports.getBookDetails = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).render('404', {
        title: 'Book Not Found',
        user: req.session.user
      });
    }
    
    res.render('books/details', {
      title: book.title,
      book,
      user: req.session.user
    });
  } catch (err) {
    console.error('Book Details Error:', err);
    res.status(500).render('error', {
      message: 'Failed to load book details',
      title: 'Error',
      user: req.session.user
    });
  }
};