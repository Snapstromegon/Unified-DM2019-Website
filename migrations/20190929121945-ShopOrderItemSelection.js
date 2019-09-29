'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ShopOrderItemSelections', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      count: { type: Sequelize.INTEGER, defaultValue: 1, allowNull: false },  
      ShopOrderId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'ShopOrders',
          key: 'id'
        }
      },
      ShopItemOptionId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'ShopItemOptions',
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
    await queryInterface.dropTable('ShopOrderItemSelections');
  }
};
