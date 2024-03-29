const Session = require('./Session.js');
const { JSDOM } = require('jsdom');
const Registrant = require('../../../models/Registrant.js');
const Event = require('../../../models/Event.js');
const EventCategory = require('../../../models/EventCategory.js');
const EventStart = require('../../../models/EventStart.js');
const EventStartMusic = require('../../../models/EventStartMusic.js');
const sequelize = require('sequelize');
const path = require('path');

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

    const startEntrys = [];

    for (const tr of tbody.querySelectorAll('tr')) {
      const columns = tr.querySelectorAll('td');
      const startEntry = {
        order: parseInt(columns[0].innerHTML.trim()),
        registrants: columns[1].innerHTML
          .split(',')
          .map(id => parseInt(id.trim()))
      };

      startEntrys.push(startEntry);
    }
    for (const startEntry of startEntrys) {
      const dbStarts = await EventStart.findAll({
        where: { EventCategoryId: eventCategory.id },
        include: [
          {
            model: Registrant,
            required: true
          },
          { model: EventCategory, include: [Event] }
        ]
      });

      const starts = dbStarts.filter(start =>
        start.Registrants.find(r => startEntry.registrants.includes(r.iufId))
      );

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
        const unmatchedStarts = starts.filter(
          start => start != highestMatch.match
        );
        // for (const unmatched of unmatchedStarts) {
        //   console.log(unmatched);
        // }
        highestMatch.match.setRegistrants(registrants);
        highestMatch.match.orderPosition = startEntry.order;
        await highestMatch.match.save();
      }
    }

    for (const start of await EventStart.findAll({
      where: {
        EventCategoryId: eventCategory.id,
        orderPosition: { [sequelize.Op.not]: null }
      },
      include: [
        { model: Registrant },
        { model: EventCategory, include: [Event] }
      ]
    })) {
      let found = false;
      for (const startEntry of startEntrys) {
        const registrants = new Set(startEntry.registrants);
        let hasMissing = false;
        for (const registrant of start.Registrants) {
          if (registrants.has(registrant.iufId)) {
            registrants.delete(registrant.iufId);
          } else {
            hasMissing = true;
          }
        }
        if (!hasMissing && !registrants.length) {
          found = true;
        }
      }
      if (!found) {
        start.orderPosition = null;
        await start.save();
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
      const originalFilename = columns[5].innerHTML.trim();
      const uploaded = new Date(columns[6].innerHTML.trim());
      const downloadUrl = columns[7].querySelector('a').href;

      const start = await EventStart.findOne({
        include: [
          {
            model: EventCategory,
            required: true,
            include: [
              { model: Event, where: { label: eventName }, required: true }
            ]
          },
          { model: Registrant, where: { iufId: uploaderId }, required: true },
          { model: EventStartMusic, order: [['uploaded', 'DESC']] }
        ]
      });
      if (start && !start.actName) {
        start.actName = description;
        await start.save();
      }
      await this.updateMusic(
        start,
        uploaderId,
        originalFilename,
        uploaded,
        downloadUrl
      ).catch(e => {
        console.error(e);
      });
    }
  }

  /**
   *
   * @param {EventStart} start
   * @param {Number} uploaderId
   * @param {string} originalFilename
   * @param {Date} uploaded
   * @param {string} downloadUrl
   */
  async updateMusic(
    start,
    uploaderId,
    originalFilename,
    uploaded,
    downloadUrl
  ) {
    if (
      start &&
      (!start.EventStartMusics.length ||
        start.EventStartMusics.find(
          music => music.uploaded.getTime >= uploaded.getTime()
        ))
    ) {
      const localPath = path.join(
        config.musicDir,
        start.EventCategory.Event.label,
        start.EventCategory.label,
        `${uploaderId}-${uploaded.getTime()}-${originalFilename}`
      );
      console.log('Downloading: ', originalFilename);
      await this.session.download(downloadUrl, localPath);
      const music = new EventStartMusic({
        uploaded: uploaded,
        originalFilename: originalFilename,
        filepath: localPath
      });
      await music.save();
      music.setRegistrant(uploaderId);
      await music.save();
      music.setEventStart(start);
      await music.save();
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
