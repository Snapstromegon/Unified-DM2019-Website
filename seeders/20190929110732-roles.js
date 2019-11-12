"use strict";

const { Role } = require("../models/index.js");
const roles = ["Admin", "Handout", "Payment", "Summary", "Photo"];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    for (const role of roles) {
      await Role.findOrCreate({ where: { name: role } });
    }
  },

  down: async (queryInterface, Sequelize) => {
    for (const role of roles) {
      await Role.destroy({ where: { name: role } });
    }
  }
};
