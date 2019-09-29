'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Sessions', {
      sid: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      expires: {
        type: Sequelize.DATE
      },
      data: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Sessions');
  }
};