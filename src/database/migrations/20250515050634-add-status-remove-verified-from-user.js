'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('User', 'verified');
    await queryInterface.addColumn('User', 'status', {
      type: Sequelize.ENUM('pending', 'verified', 'declined'),
      defaultValue: 'pending',
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('User', 'status');
    await queryInterface.addColumn('User', 'verified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },
};
