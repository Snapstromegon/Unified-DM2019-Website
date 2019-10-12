'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('EventStartRegistrants', {
      EventStartId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'EventStarts',
          key: 'id'
        }
      },
      RegistrantId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Registrants',
          key: 'id'
        }
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
    await queryInterface.dropTable('EventStartRegistrants');
  }
};