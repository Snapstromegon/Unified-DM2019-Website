'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('EventStartMusics', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      filepath: {
        allowNull: false,
        type: Sequelize.STRING
      },
      originalFilename: {
        allowNull: false,
        type: Sequelize.STRING
      },
      originalFilename: {
        allowNull: false,
        type: Sequelize.DATE
      },
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
    await queryInterface.dropTable('EventStartMusics');
  }
};