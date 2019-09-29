'use strict';

const config = require('../config/configLoader');
const { User, Role } = require('../models/index.js');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    for (const userToCreate of config.secrets.login.defaultUsers) {
      const user = (await User.findOrCreate({
        where: { name: userToCreate.name },
        defaults: { password: userToCreate.password }
      }))[0];
      for (const roleName of userToCreate.roles) {
        const role = await Role.findOne({ where: { name: roleName } });
        user.addRole(role);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    for (const userToCreate of config.secrets.login.defaultUsers) {
      await (await User.findOne({
        where: { name: userToCreate.name }
      })).destroy();
    }
  }
};
