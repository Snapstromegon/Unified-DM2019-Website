const express = require('express');
const { requireLogin } = require('./utils.js');

const router = express.Router();

const paymentData = require('../paymentData.js');

router.all('/myPayments', requireLogin, async (req, res) => {
  const userRegistrantId = ((await req.user.getRegistrant()) || {}).id;
  const payments = paymentData.data[userRegistrantId];
  res.render('pages/myPayments.njk', {
    req,
    payments
  });
});

module.exports = router;
