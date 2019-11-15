const {
  Event,
  EventCategory,
  EventStart,
  Registrant,
  EventStartMusic,
  User
} = require('../../../models/index.js');
const sequelize = require('sequelize');

const TimeScheduleEventItem = require('./TimeScheduleEventItem.js');

module.exports = class TimeSchedule {
  constructor(schedule) {
    this.schedule = [];
    this.earliestNextStart = new Date();
    this.schedulePromise = this.parseSchedule(schedule);
  }

  async parseSchedule(schedule) {
    for (const item of schedule) {
      this.schedule.push(
        ...(await this.parseScheduleItem(item, this.earliestNextStart))
      );
      const lastStart = this.schedule.slice(-1)[0];
      this.earliestNextStart = this.calculateNextEaliestStart(
        lastStart.expectedStartTime,
        lastStart.duration
      );
    }
    // this.schedule = (await Promise.all(
    //   schedule.map(item => this.parseScheduleItem(item))
    // )).flat();
    return this.schedule;
  }

  calculateNextEaliestStart(previousStartTime, previousDuration) {
    const earliestNextStart = new Date(previousStartTime);
    earliestNextStart.setMinutes(
      earliestNextStart.getMinutes() + previousDuration
    );
    return earliestNextStart;
  }

  timeAfter(scheduleItem) {
    return this.calculateNextEaliestStart(
      scheduleItem.expectedStartTime,
      scheduleItem.duration
    );
  }

  parseScheduleItem(scheduleItem, earliestNextStart) {
    scheduleItem.type = scheduleItem.type || 'event';
    scheduleItem.start = new Date(scheduleItem.start);

    switch (scheduleItem.type) {
      case 'event':
        return this.parseScheduleItem_Event(scheduleItem, earliestNextStart);
      case 'break':
        return this.parseScheduleItem_Break(scheduleItem, earliestNextStart);
    }
  }

  async parseScheduleItem_Break(scheduleItem, earliestNextStart) {
    const res = new TimeScheduleEventItem({
      name: scheduleItem.label,
      wantedStartTime: scheduleItem.start,
      expectedStartTime: new Date(
        Math.max(earliestNextStart.getTime(), scheduleItem.start.getTime())
      ),
      duration: scheduleItem.duration
    });
    if (Date.now() > res.expectedStartTime.getTime()) {
      res.started = res.expectedStartTime;
    }
    return [res];
  }

  async parseScheduleItem_Event(scheduleItem, earliestNextStart) {
    scheduleItem.warmupTime = scheduleItem.warmupTime || 10;
    const eventWithCategory = await Event.findOne({
      order: [[EventCategory, EventStart, 'orderPosition', 'ASC']],
      where: { label: scheduleItem.event },
      include: [
        {
          model: EventCategory,
          where: { label: scheduleItem.category },
          include: [
            {
              model: EventStart,
              attributes: ['id', 'actName', 'orderPosition', 'started'],
              where: {
                orderPosition: {
                  [sequelize.Op.not]: null
                }
              },
              include: [
                {
                  model: EventStartMusic
                },
                {
                  model: Registrant,
                  include: [{ model: User, attributes: ['id', 'name'] }],
                  attributes: ['id', 'iufId', 'club']
                }
              ]
            }
          ]
        }
      ]
    });

    const results = [];
    earliestNextStart.setMinutes(
      earliestNextStart.getMinutes() + scheduleItem.warmupTime
    );
    const warmupStart = new Date(
      Math.max(scheduleItem.start.getTime(), earliestNextStart.getTime())
    );
    warmupStart.setMinutes(warmupStart.getMinutes() + scheduleItem.warmupTime);

    const wantedWarmupStart = new Date(Math.max(scheduleItem.start.getTime()));
    wantedWarmupStart.setMinutes(
      wantedWarmupStart.getMinutes() + scheduleItem.warmupTime
    );
    const warmupItem = new TimeScheduleEventItem({
      name: 'Warmfahrzeit',
      wantedStartTime: wantedWarmupStart,
      expectedStartTime: warmupStart,
      duration: scheduleItem.warmupTime,
      data: {
        event: scheduleItem.event,
        category: scheduleItem.category
      }
    });
    results.push(warmupItem);
    if (Date.now() > results[0].expectedStartTime.getTime()) {
      results[0].startTime = new Date(
        Math.max(
          results[0].expectedStartTime.getTime(),
          earliestNextStart.getTime()
        )
      );
      results[0].expectedStartTime = results[0].startTime;
    }
    if (eventWithCategory.EventCategories[0].EventStarts[0].started) {
      results[0].startTime = new Date(
        eventWithCategory.EventCategories[0].EventStarts[0].started
      );
      // results[0].startTime.setMinutes(
      //   results[0].startTime.getMinutes() - scheduleItem.warmupTime
      // );
      results[0].expectedStartTime = results[0].startTime;
    }

    let startTimeOffset = 0;
    let wasFirstStarted = false;
    for (const start of eventWithCategory.EventCategories[0].EventStarts) {
      const startStartTime = new Date(scheduleItem.start);
      startStartTime.setMinutes(startStartTime.getMinutes() + startTimeOffset);
      const startTsei = new TimeScheduleEventItem({
        name: start.actName,
        data: {
          start: start,
          event: scheduleItem.event,
          category: scheduleItem.category
        },
        startTime: start.started,
        wantedStartTime: startStartTime,
        expectedStartTime:
          start.started ||
          new Date(
            Math.max(
              startStartTime.getTime(),
              earliestNextStart.getTime(),
              new Date().getTime()
            )
          ),
        duration:
          eventWithCategory.EventCategories[0].actTime +
          eventWithCategory.EventCategories[0].juryTime
      });
      if (!wasFirstStarted && startTsei.startTime) {
        warmupItem.startTime = new Date(startTsei.startTime);
        // warmupItem.startTime.setMinutes(
        //   warmupItem.startTime.getMinutes() - scheduleItem.warmupTime - 1
        // );
        wasFirstStarted = true;
      }
      startTimeOffset += startTsei.duration;
      earliestNextStart = this.timeAfter(startTsei);
      results.push(startTsei);
    }

    return results;
  }
};
