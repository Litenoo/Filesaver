const express = require('express');
const router = express.Router();
const {getRecord} = require('./functions');



router.get('/profile');

module.exports = router;