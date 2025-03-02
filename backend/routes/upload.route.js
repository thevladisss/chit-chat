const express = require('express');
const router = express.Router();
const multer = require('multer');
const UploadController = require('../controllers/upload.controller');

const upload = multer({ dest: 'uploads/' });

router.post('', upload.single('file'), UploadController.uploadFile);

module.exports = router;
