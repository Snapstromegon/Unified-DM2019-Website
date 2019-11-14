const config = require('../../config/configLoader.js');

const express = require('express');

const app = express();

app.use(express.static('static'));

app.listen(config.liveScreen.express.port);
console.log('listening on port', config.liveScreen.express.port);
