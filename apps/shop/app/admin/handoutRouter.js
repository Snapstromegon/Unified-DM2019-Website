var express = require('express');
var router = express.Router();

const {
  ShopOrder
} = require('../../../../models/index.js');


router.get("/handout/:id/:state", async (req, res) => {
  const order = await ShopOrder.findByPk(parseInt(req.params.id));
  order.isHandedOut = req.params.state == 'true';
  await order.save();
  res.redirect('/admin/listAll');
});

module.exports = router;
