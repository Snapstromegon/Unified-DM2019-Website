const config = require('../../config/configLoader.js');

const app = require('./app/app.js');
const db = require('../../models/index.js');

async function main() {
  console.log('🕐 Starting app');
  app({ port: config.photos.express.port, db: db.sequelize });
  console.log('✔️ Started app');
}

main();
