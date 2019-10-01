'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Registrants', 'email', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('Registrants', 'userEmail', {
      type: Sequelize.STRING
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Registrants', 'email');
    await queryInterface.removeColumn('Registrants', 'userEmail');
  }
};
