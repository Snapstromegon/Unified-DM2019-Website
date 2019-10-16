const passport = require('passport');

const LocalStrategy = require('passport-local').Strategy;
const {User, Role, Registrant} = require('../../../models/index.js');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'user[name]',
      passwordField: 'user[password]'
    },
    async (name, password, cb) => {
      try {
        let user = await User.findOne({
          where: { name: name.split(/\d+/).pop().trim() }
        });
        if(!user){
          user = (await Registrant.findOne({
            where: {iufId: name.match(/\d+/)[0]},
            include: [User]
          })).User
        }
        if (user && (await user.verifyPassword(password.trim()))) {
          cb(null, user);
        } else {
          cb(null, false);
        }
      } catch (err) {
        cb(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(undefined, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findByPk(id, {include: [Role]});
  done(undefined, user);
});
