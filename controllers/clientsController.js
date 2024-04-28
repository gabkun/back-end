const clientsModel = require('../models/clientsModel');

const clientsController = {
getAllClients: async (req, res) => {
const clients = await clientsModel.getAllClients();
res.json(clients);
},

getClientById: async (req, res) => {
const clientId = req.params.id;
const client = await clientsModel.getClientById(clientId);
res.json(client);
},
// Add other CRUD operations as needed


};

module.exports = clientsController;