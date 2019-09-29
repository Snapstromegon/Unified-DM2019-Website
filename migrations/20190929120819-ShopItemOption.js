'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ShopItemOptions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      label: { type: Sequelize.STRING, allowNull: false },
      priceModificator: { type: Sequelize.FLOAT, defaultValue: 0 },  
      ShopItemId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'ShopItems',
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
    await queryInterface.dropTable('ShopItemOptions');
  }
};
