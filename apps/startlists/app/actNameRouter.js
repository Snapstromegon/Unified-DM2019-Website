const express = require('express');
const { requireLogin } = require('./utils.js');

const router = express.Router();
const {
  Event,
  EventCategory,
  EventStart,
  Registrant
} = require('../../../models/index.js');

router.all('/myActs', requireLogin, async (req, res) => {
  // const orders = await ShopOrder.findAllIncludingItems({where: {UserId: req.user.id}});
  const acts = EventStart.findAll({
    include: [
      { model: Registrant, where: { id: req.user.Registrant.id } },
      { model: EventCategory, include: [Event] }
    ]
  });
  res.render('pages/myActs.njk', { req, acts });
});

module.exports = router;
