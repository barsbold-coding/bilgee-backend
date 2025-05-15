'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashPassword = async (password) => {
      const salt = await bcrypt.genSalt(10);
      return bcrypt.hash(password, salt);
    };

    await queryInterface.bulkInsert('User', [
      {
        name: 'Erdenebileg Altangerel',
        email: 'test@example.com',
        phoneNumber: '99119911',
        password: await hashPassword('superPa$$'),
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Golomt',
        email: 'golomt@example.tld',
        phoneNumber: '77119911',
        password: await hashPassword('golomtPa$$'),
        role: 'organisation',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Khan Bank',
        email: 'khan@example.tld',
        phoneNumber: '77112233',
        password: await hashPassword('khanPa$$'),
        role: 'organisation',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'MCS Group',
        email: 'mcs@example.tld',
        phoneNumber: '77113344',
        age: 21,
        password: await hashPassword('mcsPa$$'),
        role: 'organisation',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Batbold Batsaikhan',
        email: 'batbold@example.tld',
        phoneNumber: '88119911',
        age: 21,
        password: await hashPassword('student123'),
        role: 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Oyunaa Byambadorj',
        email: 'oyunaa@example.tld',
        phoneNumber: '88229922',
        age: 20,
        password: await hashPassword('student123'),
        role: 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Temuulen Ganzorig',
        email: 'temuulen@example.tld',
        phoneNumber: '88339933',
        age: 19,
        password: await hashPassword('student123'),
        role: 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Sarnai Munkhbat',
        email: 'sarnai@example.tld',
        phoneNumber: '88449944',
        age: 18,
        password: await hashPassword('student123'),
        role: 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Otgonbayar Tsogt',
        email: 'otgonbayar@example.tld',
        phoneNumber: '88559955',
        age: 22,
        password: await hashPassword('student123'),
        role: 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('User', null, {});
  },
};
