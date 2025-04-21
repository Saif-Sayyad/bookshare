const db = require('./db');

class Book {
  static async create({ title, author, description, price, userId }) {
    const [result] = await db.execute(
      'INSERT INTO books (title, author, description, price, user_id) VALUES (?, ?, ?, ?, ?)',
      [title, author, description, price, userId]
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await db.execute(
      'SELECT b.*, u.username as donor FROM books b JOIN users u ON b.user_id = u.id'
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT b.*, u.username as donor FROM books b JOIN users u ON b.user_id = u.id WHERE b.id = ?',
      [id]
    );
    return rows[0];
  }

  static async search({ title, author, maxPrice }) {
    let query = 'SELECT b.*, u.username as donor FROM books b JOIN users u ON b.user_id = u.id WHERE 1=1';
    const params = [];

    if (title) {
      query += ' AND b.title LIKE ?';
      params.push(`%${title}%`);
    }

    if (author) {
      query += ' AND b.author LIKE ?';
      params.push(`%${author}%`);
    }

    if (maxPrice) {
      query += ' AND b.price <= ?';
      params.push(maxPrice);
    }

    const [rows] = await db.execute(query, params);
    return rows;
  }
}

module.exports = Book;