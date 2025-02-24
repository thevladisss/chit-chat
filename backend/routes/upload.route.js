const express = require('express');
const router = express.Router();
const UploadController = require('../controllers/upload.controller')

router.post('/request-upload', UploadController.requestUpload);
