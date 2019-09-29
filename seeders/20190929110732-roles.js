'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Roles',
      [
        { name: 'Admin', createdAt: new Date(), updatedAt: new Date() },
        { name: 'Handout', createdAt: new Date(), updatedAt: new Date() },
        { name: 'Payment', createdAt: new Date(), updatedAt: new Date() }
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Roles', [
      { name: 'Admin' },
      { name: 'Handout' },
      { name: 'Payment' }
    ]);
  }
};
