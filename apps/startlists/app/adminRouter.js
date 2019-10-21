const express = require('express');
const sequelize = require('sequelize');
const { requireRole } = require('./utils.js');

const router = express.Router();
const {
  Event,
  EventCategory,
  EventStart,
  Registrant,
  EventStartMusic,
  User
} = require('../../../models/index.js');

router.get('/listAll', requireRole('Payment', 'Summary'), async (req, res) => {
  const acts = await EventStart.findAll({
    include: [
      { model: Registrant, include: [User] },
      { model: EventCategory, include: [Event] },
      EventStartMusic
    ]
  });
  res.render('pages/admin/listAll.njk', { req, acts });
});

router.get(
  '/missingActNames',
  requireRole('Payment', 'Summary'),
  async (req, res) => {
    const acts = await EventStart.findAll({
      where: { actName: null },
      include: [
        { model: Registrant, include: [User] },
        { model: EventCategory, include: [Event] },
        EventStartMusic
      ]
    });
    res.render('pages/admin/missingActNames.njk', { req, acts });
  }
);

router.get(
  '/missingActMusic',
  requireRole('Payment', 'Summary'),
  async (req, res) => {
    const acts = (await EventStart.findAll({
      include: [
        { model: Registrant, include: [User] },
        { model: EventCategory, include: [Event] },
        { model: EventStartMusic, required: false }
      ]
    })).filter(act => act.EventStartMusics.length === 0);
    res.render('pages/admin/missingActMusic.njk', { req, acts });
  }
);

router.get('/stats', requireRole('Payment', 'Summary'), async (req, res) => {
  const actNames = {
    set: await EventStart.count({
      where: {
        actName: {
          [sequelize.Op.or]: { [sequelize.Op.not]: null, [sequelize.Op.eq]: '' }
        }
      }
    }),
    total: await EventStart.count()
  };
  const actMusic = {
    set: await EventStart.count({
      include: [{ model: EventStartMusic, required: true }]
    }),
    total: await EventStart.count()
  };
  res.render('pages/admin/stats.njk', { req, actNames, actMusic });
});

module.exports = router;
