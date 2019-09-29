const fs = require('fs');
const path = require('path');
const argv = require('yargs').argv;
const ini = require('ini');

const allConfigs = require('./config.json');

const environment = argv.env || process.env.NODE_ENV || 'development';
global.config = allConfigs[environment];
config.secrets = require(path.resolve(__dirname, config.secretConfig));

config.db.credentials = ini.parse(
  fs.readFileSync(path.resolve(__dirname, config.db.credentialsFile), 'utf-8')
)[config.db.credentialsName];

module.exports = config;
