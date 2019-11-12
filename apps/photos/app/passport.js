const passport = require('passport');

const {User, Role} = require('../../../models/index.js');

passport.serializeUser((user, done) => {
  done(undefined, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findByPk(id, {include: [Role]});
  done(undefined, user);
});
