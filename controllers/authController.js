const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { validationResult } = require('express-validator');

exports.getLogin = (req, res) => {
  res.render('auth/login', { 
    title: 'Login',
    user: req.session.user,
    error: null // Initialize error as null
   });
};

exports.postLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('auth/login', {
      title: 'Login',
      error: errors.array()[0].msg
    });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);

    if (!user) {
      return res.render('auth/login', {
        title: 'Login',
        error: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('auth/login', {
        title: 'Login',
        error: 'Invalid email or password'
      });
    }

    req.session.user = { id: user.id, username: user.username };
    req.session.save(() => {
      res.redirect('/');
    });
  } catch (err) {
    console.error(err);
    res.render('auth/login', {
      title: 'Login',
      error: 'Server error'
    });
  }
};

exports.getRegister = (req, res) => {
  res.render('auth/register', {
    title: 'Register',
    user: req.session.user,
    error: null // Initialize error as null
  });
};

exports.postRegister = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('auth/register', {
      title: 'Register',
      error: errors.array()[0].msg
    });
  }

  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      return res.render('auth/register', {
        title: 'Register',
        error: 'Email already in use'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await User.create({ username, email, password: hashedPassword });

    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    res.render('auth/register', {
      title: 'Register',
      error: 'Registration failed'
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};