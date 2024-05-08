const express = require('express');
const router= express.Router();
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');


// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_app',
  });
  
  // Connect to MySQL
  db.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL: ' + err.stack);
      return;
    }
    console.log('Connected to MySQL as id ' + db.threadId);
  });
  router.use(bodyParser.json());
  

  
  //newuser
  router.post('/create', (req, res) => {
    const { username, email, password, role } = req.body;
    const userSql = 'INSERT INTO tbl_users (username, email, password, role) VALUES (?, ?, ?, ?)';
    
    db.query(userSql, [username, email, password, role], (err, userResults) => {
      if (err) {
        console.error('Error inserting user data:', err);
        return res.status(500).json({ error: 'An error occurred' });
      }

      let roleTable, roleIdField;
      if (role === 'ADMIN') {
        roleTable = 'tbl_admin';
        roleIdField = 'adminid';
      } else if (role === 'CLIENT') {
        roleTable = 'tbl_clients';
        roleIdField = 'clientid';
      } else {
        return res.status(400).json({ error: 'Invalid role' });
      }
      
      // Insert user data into role-specific table
      const roleSql = `INSERT INTO ${roleTable} (${roleIdField}, username, password) VALUES (?, ?, ?)`;
      
      db.query(roleSql, [userResults.insertId, username, password], (roleErr, roleResults) => {
        if (roleErr) {
          console.error('Error inserting user role data:', roleErr);
          return res.status(500).json({ error: 'An error occurred' });
        }
        
        res.json({
          id: userResults.insertId,
          username,
          email,
          role
        });
      });
    });
  });
  
  router.get('/getclients', (req, res) => {
    db.query('SELECT * FROM tbl_clients', (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });

  // Get client by ID
router.get('/getclient/:clientId', (req, res) => {
  const clientId = req.params.clientId;

  // Query the database to fetch client data by client ID
  const sql = 'SELECT * FROM tbl_clients WHERE clientid = ?';
  db.query(sql, [clientId], (err, results) => {
    if (err) {
      console.error('Error fetching client data:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }

    // Check if client exists
    if (results.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Return client data
    const clientData = results[0];
    res.json(clientData);
  });
});
  
  // view
  router.get('/getusers', (req, res) => {
    db.query('SELECT * FROM tbl_users', (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });

  // Express Login Route (auth.js)
  router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT id, role FROM tbl_users WHERE email = ? AND password = ?';
  
    db.query(sql, [email, password], (err, results) => {
      if (err) throw err;
  
      if (results.length > 0) {
        // User exists, login successful
        res.json({ message: 'Login successful', userId: results[0].id, role: results[0].role });
      } else {
        // User not found or invalid credentials
        res.status(401).json({ error: 'Invalid email or password' });
      }
    });
  });
  
//   //search
//   router.post('/', (req, res) => {
//     const searchTerm = req.body.searchTerm;
//     const sql = `
//       SELECT * FROM tbl_borrowers
//       WHERE room LIKE ? OR admin_assigned LIKE ? OR status LIKE ? OR name_borrower LIKE ?
//     `;
//     const params = Array(4).fill(%${searchTerm}%);
  
//     db.query(sql, params, (err, results) => {
//       if (err) throw err;
//       res.json(results);
//     });
//   });

//   //delete                                   
  router.delete('/deleteclient/:id', (req, res) => {
    const clientid = req.params.id;
    db.query('DELETE FROM tbl_clients WHERE id = ?', [clientid], (err, results) => {
      if (err) throw err;
      if (results.affectedRows === 0) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.json({ id: clientid, message: 'User deleted successfully' });
      }
    });
  });
  
//   //update
router.put('/updateclient/:clientid', (req, res) => {
  const clientid = req.params.clientid;

  // Check if a file is uploaded
  if (req.file) {
      // If a file is uploaded, update product with image
      const sql = "UPDATE tbl_clients SET username=?, password=? WHERE id=?";
      const values = [
          req.body.username,
          req.body.password,
          clientid
      ];

      con.query(sql, values, (err, result) => {
          if (err) {
              console.error('Error executing SQL:', err);
              return res.status(500).json({ error: 'Error executing SQL' });
          }
          return res.status(200).json({ status: 'Success' });
      });
  } else {
      // If no file is uploaded, update product without changing the image
      const sql = "UPDATE tbl_clients SET username=?, password=? WHERE id=?";
      const values = [
        req.body.username,
        req.body.password,
          clientid
      ];

      db.query(sql, values, (err, result) => {
          if (err) {
              console.error('Error executing SQL:', err);
              return res.status(500).json({ error: 'Error executing SQL' });
          }
          return res.status(200).json({ status: 'Success' });
      });
  }
});


module.exports = router;