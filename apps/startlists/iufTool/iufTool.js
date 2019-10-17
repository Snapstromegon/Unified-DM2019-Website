const Session = require('./Session.js');
const { JSDOM } = require('jsdom');
const Registrant = require('../../../models/Registrant.js');
const Event = require('../../../models/Event.js');
const EventCategory = require('../../../models/EventCategory.js');
const EventStart = require('../../../models/EventStart.js');
const sequelize = require('sequelize');

const competitionNames = {
  Einzel: 'Einzelkür',
  Paar: 'Paarkür'
};

const categoryNames = {
  'm Expert': 'M Expert',
  'm Junior Expert': 'M Junior Expert',
  'w Expert': 'W Expert',
  'w Junior Expert': 'W Junior Expert',
  'w U11': 'W U11',
  'w U12': 'W U12',
  'w U13': 'W U13',
  'w U15': 'W U15',
  'w U16': 'W U16',
  'w U17': 'W U17',
  'w U19': 'W U19',
  'w U22': 'W U22',
  'w Über 22': 'W Ü22',
  'AK U13': 'U13',
  'AK U14': 'U14',
  'AK U15': 'U15',
  'AK U16': 'U16',
  'AK U17': 'U17',
  'AK U19': 'U19',
  'AK U21': 'U21',
  'AK U24': 'U24',
  'AK Über 24': 'Ü24'
};

/**
 * @typedef {{iufId: Number, name: string, club:string, type:string}} IufRegistrant
 */

module.exports = class IufTool {
  /**
   * The IufTool class provides an interface to the IUF registration tool
   * @param {Object} config
   * @param {{Registrant: String, password: String}} config.credentials
   * @param {String} config.url
   */
  constructor({
    credentials,
    url = 'https://anmeldung.freestyledm2019.de'
  } = {}) {
    this.url = url;
    this.session = new Session({ credentials, url });
    this.loggedInPromise = this.session.login();
  }

  async getStartlistsInfos() {
    await this.loggedInPromise;
    const response = await this.session.get(`${this.url}/results`);
    const document = new JSDOM(response).window.document;
    const tbody = document.querySelector('tbody');

    const results = [];

    for (const tr of tbody.querySelectorAll('tr')) {
      const columns = tr.querySelectorAll('td');
      results.push({
        competition: columns[0].innerHTML.trim(),
        url: columns[3].querySelector('a').href
      });
    }

    return results;
  }

  async loadCategoryStartListsInfos(info) {
    const eventName = this.getEventName(info);
    const categoryName = this.getCategoryName(info);

    const event = await Event.findOne({
      where: { label: eventName },
      include: [{ model: EventCategory, where: { label: categoryName } }]
    });

    if (!event) {
      throw `Unknown Eventname ${eventName}`;
    }

    const eventCategory = event.EventCategories[0];

    await this.loggedInPromise;
    const response = await this.session.get(`${this.url}/${info.url}`);
    const document = new JSDOM(response).window.document;
    const tbody = document.querySelector('tbody');

    for (const tr of tbody.querySelectorAll('tr')) {
      const columns = tr.querySelectorAll('td');
      const startEntry = {
        order: parseInt(columns[0].innerHTML.trim()),
        registrants: columns[1].innerHTML
          .split(',')
          .map(id => parseInt(id.trim()))
      };

      const starts = await EventStart.findAll({
        where: { EventCategoryId: eventCategory.id },
        include: [
          {
            model: Registrant,
            required: true,
            where: { iufId: startEntry.registrants }
          }
        ]
      });

      const registrants = await Registrant.findAll({
        where: { iufId: startEntry.registrants }
      });

      if (!starts.length) {
        // create new start
        await this.disableStartWithOrderPosition(
          eventCategory,
          startEntry.order
        );
        const eventStart = new EventStart({
          orderPosition: startEntry.order
        });
        await eventStart.save();
        eventStart.setEventCategory(eventCategory);
        eventStart.addRegistrants(registrants);
        await eventStart.save();
      } else {
        // find highest driver match
        const highestMatch = { matchFactor: 0, match: undefined };
        for (const start of starts) {
          const thisMatch = startEntry.registrants.reduce(
            (prev, entry) =>
              prev + (start.Registrants.find(r => r.iufId == entry) ? 1 : 0),
            0
          );
          if (thisMatch > highestMatch.matchFactor) {
            highestMatch.matchFactor = thisMatch;
            highestMatch.match = start;
          }
        }
        highestMatch.match.setRegistrants(registrants);
        highestMatch.match.orderPosition = startEntry.order;
        await highestMatch.match.save();
      }
    }
  }

  getEventName(info) {
    return (
      competitionNames[info.competition.split(' ')[0]] ||
      info.competition.split(' ')[0]
    );
  }

  getCategoryName(info) {
    return (
      categoryNames[
        info.competition
          .split(' ')
          .slice(1)
          .join(' ')
      ] ||
      info.competition
        .split(' ')
        .slice(1)
        .join(' ')
    );
  }

  async disableStartWithOrderPosition(eventCategory, order) {
    const startsWithSameOrderPosition = await EventStart.findAll({
      where: { orderPosition: order, EventCategoryId: eventCategory.id }
    });
    for (const startWithSameOrderPosition of startsWithSameOrderPosition) {
      startWithSameOrderPosition.orderPosition = null;
      await startWithSameOrderPosition.save();
    }
  }

  async setDefaultActNames() {
    await this.loggedInPromise;
    const response = await this.session.get(`${this.url}/event_songs/all`);
    const document = new JSDOM(response).window.document;
    const tbody = document.querySelector('tbody');

    for (const tr of tbody.querySelectorAll('tr')) {
      const columns = tr.querySelectorAll('td');
      const eventName = columns[0].querySelector('a').innerHTML.trim();
      const uploaderId = columns[1].innerHTML.trim();
      const description = columns[4].innerHTML.trim();

      const start = await EventStart.findOne({
        include: [
          {
            model: EventCategory,
            required: true,
            include: [
              { model: Event, where: { label: eventName }, required: true }
            ]
          },
          { model: Registrant, where: { iufId: uploaderId }, required: true }
        ]
      });
      if(start && !start.actName){
        start.actName = description;
        await start.save();
      }
    }
  }

  async syncIufToDb() {
    const categoryStartListsInfos = await this.getStartlistsInfos();

    for (const categoryStartListInfo of categoryStartListsInfos) {
      await this.loadCategoryStartListsInfos(categoryStartListInfo);
    }

    await this.setDefaultActNames();
  }

  async keepIufAndDbInSync({ updateInterval }) {
    await this.syncIufToDb();
    setInterval(() => this.syncIufToDb(), updateInterval);
  }
};
