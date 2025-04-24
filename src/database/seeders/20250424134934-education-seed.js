'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Fetch existing resumes
    const resumes = await queryInterface.sequelize.query(
      `SELECT id FROM "Resume";`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    const educations = [];

    for (const resume of resumes) {
      educations.push({
        resumeId: resume.id,
        institution: 'University of Example',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2015-09-01'),
        endDate: new Date('2019-06-15'),
        grade: '3.8 GPA',
        description: 'Studied various aspects of software engineering and computer systems.',
        location: 'Example City',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      educations.push({
        resumeId: resume.id,
        institution: 'Example Tech Institute',
        degree: 'Diploma',
        fieldOfStudy: 'Web Development',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2020-12-01'),
        grade: 'A',
        description: 'Completed a fast-track program focused on full-stack web development.',
        location: 'Techville',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return queryInterface.bulkInsert('Education', educations, {});
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Education', null, {});
  },
};

