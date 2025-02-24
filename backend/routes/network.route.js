const express = require('express');
const router = express.Router();
const NetworkController = require('../controllers/network.controller');

/* GET home page. */

router.get('/nodes', NetworkController.getAllNetworkNodes);

router.post('/nodes/find/ip', NetworkController.getNetworkNodeByIP);

module.exports = router;
