'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Fetch existing resumes
    const resumes = await queryInterface.sequelize.query(
      `SELECT id FROM "Resume";`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const experiences = [];

    for (const resume of resumes) {
      experiences.push(
        {
          resumeId: resume.id,
          company: 'TechCorp Solutions',
          position: 'Software Engineer',
          startDate: new Date('2020-01-15'),
          endDate: new Date('2022-06-30'),
          description: 'Worked on backend systems using Node.js and PostgreSQL. Contributed to REST API development and deployment.',
          location: 'San Francisco, CA',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          resumeId: resume.id,
          company: 'InnovateX',
          position: 'Junior Developer',
          startDate: new Date('2018-07-01'),
          endDate: new Date('2019-12-31'),
          description: 'Assisted in front-end development using React and Redux. Participated in agile sprints and code reviews.',
          location: 'Austin, TX',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      );
    }

    return queryInterface.bulkInsert('Experience', experiences, {});
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Experience', null, {});
  }
};

