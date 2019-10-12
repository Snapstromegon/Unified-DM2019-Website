const express = require('express');
const { requireLogin } = require('./utils.js');

const router = express.Router();
const {
  Event,
  EventCategory,
  EventStart,
  Registrant,
  User
} = require('../../../models/index.js');

router.all('/myActs', requireLogin, async (req, res) => {
  // const orders = await ShopOrder.findAllIncludingItems({where: {UserId: req.user.id}});
  const starts = await EventStart.findAll({
    include: [
      { model: Registrant, include: [User] },
      { model: EventCategory, include: [Event] }
    ]
  });
  const userRegistrantId = ((await req.user.getRegistrant()) || {}).id;
  const acts = starts.filter(start =>
    start.Registrants.find(r => r.id == userRegistrantId)
  );
  res.render('pages/myActs.njk', { req, acts });
});

router.post('/actName', requireLogin, async (req, res) => {
  const userRegistrantId = ((await req.user.getRegistrant()) || {}).id;
  if (!userRegistrantId && !req.user.hasRole('Admin')) {
    return res.redirect('/');
  }
  let start;
  if (req.user.hasRole('Admin')) {
    start = await EventStart.findByPk(parseInt(req.body.actId), {
      include: [{ model: Registrant }]
    });
  } else {
    start = await EventStart.findByPk(parseInt(req.body.actId), {
      include: [
        { model: Registrant, reuired: true, where: { id: userRegistrantId } }
      ]
    });
  }
  if (start) {
    start.actName = req.body.actName;
    start.save();
  }
  return res.redirect('/myActs');
});

module.exports = router;
