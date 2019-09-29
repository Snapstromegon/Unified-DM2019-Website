'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ShopPayment', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      isPayed: { type: Sequelize.BOOLEAN, defaultValue: false },
      hasToBePaid: { type: Sequelize.BOOLEAN, defaultValue: false },
      ShopOrderId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'ShopOrders',
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
    await queryInterface.dropTable('ShopPayment');
  }
};
