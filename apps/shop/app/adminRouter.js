var express = require('express');
var router = express.Router();
const { requireRole } = require('./utils.js');

/* GET user profile. */
router.use('/payment', requireRole('Payment'), require('./admin/paymentRouter.js'));

module.exports = router;
