const config = require('../../config/configLoader.js');

const app = require('./app/app.js');
const db = require('../../models/index.js');
const IufTool = require('./iufTool/IufTool.js');

async function main() {
  console.log('🕐 Connecting to IUF Tool');
  try {
    const iufTool = new IufTool({
      credentials: {
        user: config.secrets.iufTool.user,
        password: config.secrets.iufTool.password
      }
    });
    await iufTool.loggedInPromise;
    console.log('✔️ Connected to IUF Tool');

    console.log('🕐 Syncing IUF Tool User Base');
    iufTool
      .keepIufAndDbInSync({
        updateInterval: config.sync.updateInterval
      })
      .then(() => console.log('✔️ Syncing IUF Tool User Base'));
  } catch (err) {
    console.error('❌ Connection to IUF Failed', err);
  }

  console.log('🕐 Starting app');
  app({ port: config.startlists.express.port, db: db.sequelize });
  console.log('✔️ Started app');
}

main();
