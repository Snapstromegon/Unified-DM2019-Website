const Session = require('./Session.js');
const { JSDOM } = require('jsdom');
const User = require('../../../models/User.js');
const Registrant = require('../../../models/Registrant.js');

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

  /**
   * Gets a list of all Registrants excluding accessCodes
   * @returns {Promise<Array<IufRegistrant>>} All Registrants registered in the IUF tool
   */
  async getAllRegistrants() {
    await this.loggedInPromise;

    const response = await this.session.get(`${this.url}/registrants/all`);
    const dom = new JSDOM(response);
    const document = dom.window.document;
    const rows = document.querySelectorAll('table tbody tr');
    const registrants = [];
    for (const row of rows) {
      const tds = row.querySelectorAll('td');
      registrants.push({
        iufId: parseInt(tds[0].innerHTML),
        name: tds[1].innerHTML,
        type: tds[2].innerHTML,
        club: tds[3].innerHTML
      });
    }
    return registrants;
  }

  /**
   * Gets the AccessCode of a single registrant
   * @param {IufRegistrant} search Registrant to get the accessCode of
   */
  async getRegistrantAccessCode({ iufId }) {
    await this.loggedInPromise;
    const response = await this.session.get(`${this.url}/registrants/${iufId}`);
    return new JSDOM(response).window.document
      .querySelector('.access_code')
      .innerHTML.split('<b>')[0]
      .trim();
  }

  /**
   * Gets the AccessCode of a single registrant
   * @param {IufRegistrant} search Registrant to get the accessCode of
   */
  async getRegistrantDirectData({ iufId }) {
    await this.loggedInPromise;
    const response = await this.session.get(`${this.url}/registrants/${iufId}`);
    const document = new JSDOM(response).window.document;
    return {
      password: document
        .querySelector('.access_code')
        .innerHTML.split('<b>')[0]
        .trim(),
      email: document
        .querySelector('.contact_detail_summary')
        .innerHTML.match(/\S+@\S+/)[0],
      userEmail: document
        .querySelector('.registrant_details_summary p')
        .innerHTML.split('</b>')[1]
        .trim()
    };
  }

  async syncIufToDb() {
    const iufRegistrants = await this.getAllRegistrants();

    for (const iufRegistrant of iufRegistrants) {
      if (
        (await Registrant.count({ where: { iufId: iufRegistrant.iufId } })) ===
        0
      ) {
        const registrantData = await this.getRegistrantDirectData(
          iufRegistrant
        );
        const user = (await User.findOrCreate({
          where: { name: iufRegistrant.name },
          defaults: {
            password: registrantData.password
          }
        }))[0];
        await user.save();
        const registrant = new Registrant({
          iufId: iufRegistrant.iufId,
          type: iufRegistrant.type,
          club: iufRegistrant.club,
          email: registrantData.email,
          userEmail: registrantData.userEmail
        });
        await registrant.save();
        registrant.setUser(user);
        await registrant.save();
      }
      const registrant = await Registrant.findOne({
        where: { iufId: iufRegistrant.iufId }
      });
      if (!registrant.email || Registrant.userEmail) {
        const registrantData = await this.getRegistrantDirectData(
          iufRegistrant
        );
        registrant.email = registrantData.email;
        registrant.userEmail = registrantData.userEmail;
        await registrant.save();
      }
    }
  }

  async keepIufAndDbInSync({ updateInterval }) {
    await this.syncIufToDb();
    setInterval(() => this.syncIufToDb(), updateInterval);
  }
};
