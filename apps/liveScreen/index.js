const config = require('../../config/configLoader.js');

const express = require('express');

const app = express();

app.use(express.static('static'));

app.listen(config.liveScreen.express.port);