const express = require('express');
const { requireRole } = require('./utils.js');
const router = express.Router();

const paymentData = require('../paymentData.js');
const { Registrant, User } = require('../../../models/index.js');

router.get('/listAll', requireRole('Payment'), async (req, res) => {
  const registrantsWithPayments = [];
  const registrants = await Registrant.findAll({
    include: [User]
  });
  for (const registrantId in paymentData.data) {
    if (paymentData.data[registrantId].length) {
      registrantsWithPayments.push({
        payments: paymentData.data[registrantId],
        registrant: registrants.find(r => r.iufId == registrantId),
        originalId: registrantId
      });
    }
  }
  res.render('pages/admin/listAll.njk', {
    req,
    registrantsWithPayments
  });
});

module.exports = router;
