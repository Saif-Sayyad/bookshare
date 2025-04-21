require('dotenv').config();
const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const flash = require('express-flash');
const path = require('path');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const booksRouter = require('./routes/books');

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Routes
app.use(flash());
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/books', booksRouter);

app.use((req, res) => {
  res.status(404).render('404', { 
    title: 'Page Not Found',
    user: req.session.user  // ← Add this
  });
});

// 404 handler
// app.use((req, res) => {
//   res.status(404).render('404');
// });

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});