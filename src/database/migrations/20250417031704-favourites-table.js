'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Favourite', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'User',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      internshipId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Internship',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      }
    });

    // Add unique constraint to prevent duplicate favorites
    await queryInterface.addIndex('Favourite', ['userId', 'internshipId'], {
      unique: true,
      name: 'favourite_user_internship_unique'
    });
  },

  async down(queryInterface, _) {
    await queryInterface.dropTable('Favourite');
  }
};
