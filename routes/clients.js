// routes/clients.js
const express = require('express');
const router = express.Router();
const clientsController = require('../controllers/clientsController');

// Define routes using the clients controller methods
router.get('/clients', clientsController.getAllClients);
router.get('/clients/:id', clientsController.getClientById);
// Add other CRUD operations as needed

module.exports = router;