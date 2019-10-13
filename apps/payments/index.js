const config = require('../../config/configLoader.js');

const app = require('./app/app.js');
const db = require('../../models/index.js');
require('./paymentData.js');

async function main() {
  console.log('🕐 Starting app');
  app({ port: config.payments.express.port, db: db.sequelize });
  console.log('✔️ Started app');
}

main();
