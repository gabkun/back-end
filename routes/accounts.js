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
        cb(null, "./public/clients");
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({ storage });

// Serve images statically
router.use( express.static('public'));

router.post('/addclient', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const sql = "INSERT INTO tbl_client (`compname`,`mobile`, `password`,`birthday`,`profile`) VALUES (?)";
    const values = [
        req.body.compname,
        req.body.mobile,
        req.body.password,
        req.body.birthday,
        req.file.filename
    ];

    con.query(sql, [values], (err, result) => {
        if (err) {
            console.error('Error executing SQL:', err);
            return res.status(500).json({ error: 'Error executing SQL' });
        }
        return res.status(200).json({ status: 'Success' });
    });
    
});

router.get('/getclients', (req, res) => {
    const sql = "SELECT * FROM tbl_client";

    con.query(sql, (err, result) => {
        if (err) {
            console.error('Error executing SQL:', err);
            return res.status(500).json({ error: 'Error executing SQL' });
        }
        return res.status(200).json(result);
    });
});

router.put('/updateclient:clientId', upload.single('file'), (req, res) => {
    const clientId = req.params.clientId;

    // Check if a file is uploaded
    if (req.file) {
        // If a file is uploaded, update product with image
        const sql = "UPDATE tbl_client SET compname=?, mobile=?, password=?, birthday=?, image=? WHERE id=?";
        const values = [
            req.body.compname,
            req.body.mobile,
            req.body.password,
            req.body.birthday,
            req.file.filename,
            clientId
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
        const sql = "UPDATE tbl_client SET compname=?, mobile=?, password=?, birthday=? WHERE id=?";
        const values = [
            req.body.compname,
            req.body.mobile,
            req.body.password,
            req.body.birthday,
            clientId
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
router.delete('/deleteclient/:clientId', (req, res) => {
    const clientId = req.params.clientId;
    const sql = "DELETE FROM tbl_client WHERE id = ?";

    con.query(sql, [clientId], (err, result) => {
        if (err) {
            console.error('Error executing SQL:', err);
            return res.status(500).json({ error: 'Error executing SQL' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Client not found' });
        }

        return res.status(200).json({ status: 'Success' });
    });
});



module.exports = router;