const express = require('express');
const nunjucks = require('nunjucks');
const passport = require('passport');
const { requireLogin } = require('./utils.js');
require('./passport.js');

const session = require('express-session');

module.exports = options => {
  // initalize sequelize with session store
  var SequelizeStore = require('connect-session-sequelize')(session.Store);

  const myStore = new SequelizeStore({
    db: options.db
  });

  const app = express();

  nunjucks.configure(__dirname + '/../views', {
    autoescape: true,
    express: app,
    noCache: true
  });

  app.use(express.urlencoded({ extended: true }));
  app.use(
    session({
      secret: config.secrets.cookie.secret,
      store: myStore,
      resave: false, // we support the touch method so per the express-session docs this should be set to false
      cookie: {
        domain: config.cookie.domain
      }
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.use('/', express.static(__dirname + '/../static'));

  app.use('/', require('./actNameRouter.js'));

  app.use('/admin', requireLogin, require('./adminRouter.js'));

  app.listen(options.port, err => {
    if (err) {
      console.error(err);
    } else {
      console.log(`App listens ${options.port}`);
    }
  });
};
