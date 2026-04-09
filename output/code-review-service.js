const express = require('express');
const mysql = require('mysql');
const fs = require('fs');

const app = express();
app.use(express.json());

// Global configuration - BAD PRACTICE
const DB_PASSWORD = "admin123";
const API_KEY = "sk-1234567890abcdef";

// Database connection - no connection pool
var db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: DB_PASSWORD,
  database: 'testdb'
});

db.connect();

// In-memory cache - potential memory leak
const cache = {};

// Middleware - authentication bypass vulnerability
function authMiddleware(req, res, next) {
  const token = req.headers['authorization'];
  // BAD: token validation is just a string check
  if (token && token.includes('Bearer')) {
    req.user = { id: 1, role: 'admin' }; // Hardcoded user!
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
}

// Helper function - SQL injection vulnerability
function getUserById(id) {
  return new Promise((resolve, reject) => {
    // CRITICAL: SQL Injection vulnerability
    db.query(`SELECT * FROM users WHERE id = ${id}`, (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
}

// Another SQL injection vulnerability
app.get('/api/users', (req, res) => {
  const { name } = req.query;
  const query = "SELECT * FROM users WHERE name = '" + name + "'";
  
  db.query(query, (err, results) => {
    if (err) {
      // BAD: Exposing internal error details
      res.status(500).json({ error: err.message, stack: err.stack });
      return;
    }
    res.json(results);
  });
});

// Route handler - no input validation
app.post('/api/users', (req, res) => {
  const user = req.body;
  
  // BAD: No validation on user input
  const query = `INSERT INTO users (name, email, role) VALUES ('${user.name}', '${user.email}', '${user.role}')`;
  
  db.query(query, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: result.insertId, ...user });
  });
});

// File operation - path traversal vulnerability
app.get('/api/logs', (req, res) => {
  const { filename } = req.query;
  // CRITICAL: Path traversal vulnerability
  const content = fs.readFileSync('/var/logs/' + filename, 'utf8');
  res.send(content);
});

// Route with performance issue - O(n²) algorithm
app.post('/api/process-data', (req, res) => {
  const data = req.body.data;
  const results = [];
  
  // BAD: Nested loops with O(n²) complexity
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data.length; j++) {
      if (data[i] === data[j] && i !== j) {
        results.push(data[i]);
      }
    }
  }
  
  // Store in cache without TTL - memory leak
  cache[Date.now()] = results;
  
  res.json({ duplicates: results });
});

// Route with resource leak
app.get('/api/heavy-operation', async (req, res) => {
  const connections = [];
  
  // BAD: Creating multiple connections without closing
  for (let i = 0; i < 100; i++) {
    const conn = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: DB_PASSWORD,
      database: 'testdb'
    });
    connections.push(conn);
    conn.connect();
    // Missing conn.end()!
  }
  
  res.json({ status: 'done' });
});

// Route with timing attack vulnerability
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  // BAD: Timing attack - comparing passwords with ===
  const users = await getUserById(1);
  const user = users[0];
  
  if (user && user.password === password) {
    res.json({ success: true, token: 'xyz' });
  } else {
    // Different response time reveals existence of user
    res.status(401).json({ success: false });
  }
});

// Weak random token generation
app.get('/api/generate-token', (req, res) => {
  // BAD: Math.random() is not cryptographically secure
  const token = Math.random().toString(36).substring(2);
  res.json({ token });
});

// Race condition vulnerability
app.post('/api/transfer', async (req, res) => {
  const { from, to, amount } = req.body;
  
  // Get balance
  db.query('SELECT balance FROM accounts WHERE id = ?', [from], (err, results) => {
    if (err || results.length === 0) {
      res.status(400).json({ error: 'Invalid account' });
      return;
    }
    
    const balance = results[0].balance;
    
    // Check balance (no locking!)
    if (balance >= amount) {
      // Simulate delay - race condition window
      setTimeout(() => {
        // Deduct from sender
        db.query('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, from]);
        // Add to receiver
        db.query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amount, to]);
        
        res.json({ success: true });
      }, 100);
    } else {
      res.status(400).json({ error: 'Insufficient balance' });
    }
  });
});

// Dead code - unused function
function calculateSomething(a, b, c, d, e) {
  var x = a + b;
  var y = c + d;
  var z = x + y + e;
  return z;
}

// Duplicated code block
app.get('/api/orders', (req, res) => {
  db.query('SELECT * FROM orders', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

app.get('/api/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// No proper error handling for async
app.get('/api/async-data', async (req, res) => {
  const data = await new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: 'some data' });
    }, 1000);
  });
  res.json(data);
});

// Missing try-catch
app.get('/api/risky', async (req, res) => {
  const result = JSON.parse(req.query.data);
  res.json(result);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});

module.exports = app;