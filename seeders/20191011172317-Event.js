'use strict';

const { Event, EventCategory } = require('../models/index.js');

const eventConfig = require('../config/EventCategorys.json');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    for (const event of eventConfig) {
      const dbEvent = (await Event.findOrCreate({
        where: { label: event.label }
      }))[0];

      for (const category of event.categorys) {
        const eventCategory = (await EventCategory.findOrCreate({
          where: { label: category.label, EventId: dbEvent.id },
          defaults: {
            actTime: category.actTime,
            juryTime: category.juryTime
          }
        }))[0];
        eventCategory.actTime = category.actTime;
        eventCategory.juryTime = category.juryTime;
        eventCategory.setEvent(dbEvent);
        await eventCategory.save();
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // for (const event of eventConfig) {
    //   await Event.destroy({ where: { label: event.label } });
    // }
  }
};
