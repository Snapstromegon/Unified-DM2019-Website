const config = require('./configLoader.js');

const dbConfig = {
  username: config.db.credentials.user,
  password: config.db.credentials.password,
  database: config.db.database,
  host: config.db.host,
  dialect: config.db.dialect,
  logging: false
};

module.exports = {
  development: dbConfig,
  production: dbConfig
}