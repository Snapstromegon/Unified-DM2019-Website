const express = require('express');
const sequelize = require('sequelize');

const timeSchedule = require('../../../config/timeSchedule.json');
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

router.get('/', requireRole('Payment', 'Summary'), async (req, res) => {
  const events = await Event.findAll({
    order: [
      ['id', 'ASC'],
      [EventCategory, 'id', 'ASC'],
      [EventCategory, EventStart, 'orderPosition', 'ASC']
    ],
    include: [
      {
        model: EventCategory,
        include: [
          {
            model: EventStart,
            where: {
              orderPosition: {
                [sequelize.Op.not]: null
              }
            },
            include: [
              EventStartMusic,
              {
                model: Registrant,
                include: [User],
                order: [['uploaded', 'desc']]
              }
            ]
          }
        ]
      }
    ]
  });
  res.render('pages/admin/startlist.njk', { req, events });
});

module.exports = router;
