const express = require('express');
const sequelize = require('sequelize');

const TimeSchedule = require('../class/TimeSchedule.js');
const timeSchedulePlan = require('../../../config/timeSchedule.json');
const { requireRole } = require('./utils.js');

const router = express.Router();

router.get('/', async (req, res) => {
  const schedule = await new TimeSchedule(timeSchedulePlan).schedulePromise;
  res.render('pages/timeplan.njk', { req, schedule });
});

router.get('/json', async (req, res) => {
  res.json(await new TimeSchedule(timeSchedulePlan).schedulePromise);
});

module.exports = router;
