const passport = require('passport');

const User = require('../../../models/User.js');

passport.serializeUser((user, done) => {
  done(undefined, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findByPk(id);
  done(undefined, user);
});
