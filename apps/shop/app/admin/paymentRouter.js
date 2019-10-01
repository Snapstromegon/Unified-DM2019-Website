var express = require('express');
var router = express.Router();

/* GET user profile. */
router.get('/listAll', async (req, res) => {
  res.render('pages/admin/payment/listAll.njk', {req});
});

module.exports = router;
