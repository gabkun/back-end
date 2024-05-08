const express = require('express');
const mysql = require("mysql");
const cors = require('cors');
const multer = require('multer');

const router = express.Router();
router.use(cors());
router.use(express.json());

const con = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "",
    database: "db_app"
});

con.connect(function (err) {
    if (err) {
        console.log("Error in Connection");
    } else {
        console.log("Connected");
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/images");
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({ storage });

// Serve images statically
router.use( express.static('public'));

router.post('/:clientId/addproduct', upload.single('file'), (req, res) => {
    const clientId = req.params.clientId;
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });

    }


    const getProductSQL = "SELECT * FROM tbl_clients WHERE clientid = ?";
    
    con.query(getProductSQL, [clientId], (err, result) => {
        if (err) {
            console.error('Error executing SQL:', err);
            return res.status(500).json({ error: 'Error executing SQL' });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Client not found' });
        }

        const clientid = result[0].clientid;

        const insertProductSQL = "INSERT INTO tbl_products (clientid, product, brand, model, price, image) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [

            clientid, // Use the fetched client ID
            req.body.product,
            req.body.brand,
            req.body.model,
            req.body.price,
            req.file.filename
        ];

        con.query(insertProductSQL, values, (err, result) => {
            if (err) {
                console.error('Error executing SQL:', err);
                return res.status(500).json({ error: 'Error executing SQL' });
            }
            return res.status(200).json({ status: 'Success' });
        });
    });
});

router.get('/getproducts', (req, res) => {
    const sql = "SELECT * FROM tbl_products";

    con.query(sql, (err, result) => {
        if (err) {
            console.error('Error executing SQL:', err);
            return res.status(500).json({ error: 'Error executing SQL' });
        }
        return res.status(200).json(result);
    });
});



router.get('/getproducts/:clientId', (req, res) => {
    const clientId = req.params.clientId;
  
    // Query the database to fetch client data by client ID
    const sql = 'SELECT * FROM tbl_products WHERE clientid = ?';
    con.query(sql, [clientId], (err, results) => {
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


router.delete('/deleteproduct/:productId', (req, res) => {
    const productId = req.params.productId;
    const sql = "DELETE FROM tbl_products WHERE id = ?";

    con.query(sql, [productId], (err, result) => {
        if (err) {
            console.error('Error executing SQL:', err);
            return res.status(500).json({ error: 'Error executing SQL' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        return res.status(200).json({ status: 'Success' });
    });
});


router.put('/updateproduct/:productId', upload.single('file'), (req, res) => {
    const productId = req.params.productId;

    // Check if a file is uploaded
    if (req.file) {
        // If a file is uploaded, update product with image
        const sql = "UPDATE tbl_products SET product=?, brand=?, model=?, price=?, image=? WHERE id=?";
        const values = [
            req.body.product,
            req.body.brand,
            req.body.model,
            req.body.price,
            req.file.filename,
            productId
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
        const sql = "UPDATE tbl_products SET product=?, brand=?, model=?, price=? WHERE id=?";
        const values = [
            req.body.product,
            req.body.brand,
            req.body.model,
            req.body.price,
            productId
        ];

        con.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error executing SQL:', err);
                return res.status(500).json({ error: 'Error executing SQL' });
            }
            return res.status(200).json({ status: 'Success' });
        });
    }
});

module.exports = router;