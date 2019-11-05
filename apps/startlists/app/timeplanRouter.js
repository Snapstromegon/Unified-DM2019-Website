const express = require('express');
const sequelize = require('sequelize');

const {
  Event,
  EventCategory,
  EventStart,
  Registrant,
  EventStartMusic,
  User
} = require('../../../models/index.js');

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

router.get('/nextStarter/json', async (req, res) => {
  const schedule = await new TimeSchedule(timeSchedulePlan).schedulePromise;
  res.json(
    schedule.find(
      item =>
        !item.startTime &&
        ('data' in item && 'starters' in item.data && item.data.starters.length)
    )
  );
});

router.get('/nextStarter', async (req, res) => {
  const schedule = await new TimeSchedule(timeSchedulePlan).schedulePromise;
  res.render('pages/admin/nextStart.njk', {
    req,
    nextStart: schedule.find(
      item =>
        !item.startTime &&
        ('data' in item && 'starters' in item.data && item.data.starters.length)
    )
  });
});

router.get('/starts/:id/startNow', requireRole('Admin'), async (req, res) => {
  const start = await EventStart.findByPk(parseInt(req.params.id));
  start.started = new Date();
  await start.save();
  res.json(start);
});

router.get('/starts/:id/unstarted', requireRole('Admin'), async (req, res) => {
  const start = await EventStart.findByPk(parseInt(req.params.id));
  start.started = null;
  await start.save();
  res.json(start);
});

module.exports = router;
