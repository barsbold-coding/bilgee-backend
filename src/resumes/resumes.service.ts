import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Resume } from '../models/resume.model';
import { Experience } from '../models/experience.model';
import { Education } from '../models/education.model';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume)
    private resumeModel: typeof Resume,
    @InjectModel(Experience)
    private experienceModel: typeof Experience,
    @InjectModel(Education)
    private educationModel: typeof Education,
    private sequelize: Sequelize,
  ) {}

  async create(studentId: number, createResumeDto: CreateResumeDto) {
    const existingResume = await this.resumeModel.findOne({
      where: { studentId },
    });

    if (existingResume) {
      throw new ConflictException(
        'You already have a resume. Please update it instead.',
      );
    }

    const transaction = await this.sequelize.transaction();

    try {
      const resume = await this.resumeModel.create(
        {
          studentId,
          title: createResumeDto.title,
          summary: createResumeDto.summary,
          skills: createResumeDto.skills,
          languages: createResumeDto.languages,
          certifications: createResumeDto.certifications,
        },
        { transaction },
      );

      if (createResumeDto.experiences?.length) {
        const experiences = createResumeDto.experiences.map((exp) => ({
          ...exp,
          resumeId: resume.id,
        }));
        await this.experienceModel.bulkCreate(experiences, { transaction });
      }

      // Create education entries if provided
      if (createResumeDto.education?.length) {
        const educationEntries = createResumeDto.education.map((edu) => ({
          ...edu,
          resumeId: resume.id,
        }));
        await this.educationModel.bulkCreate(educationEntries, { transaction });
      }

      await transaction.commit();

      return this.findOne(resume.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async findOne(id: number) {
    const resume = await this.resumeModel.findByPk(id, {
      include: [{ model: Experience }, { model: Education }],
    });

    if (!resume) {
      throw new NotFoundException(`Resume with ID ${id} not found`);
    }

    return resume;
  }

  async findByStudentId(studentId: number): Promise<Resume> {
    const resume = await this.resumeModel.findOne({
      where: { studentId },
      include: [{ model: Experience }, { model: Education }],
    });

    if (!resume) {
      throw new NotFoundException(
        `Resume for student ID ${studentId} not found`,
      );
    }

    return resume;
  }

  async update(id: number, updateResumeDto: UpdateResumeDto): Promise<Resume> {
    const resume = await this.resumeModel.findByPk(id);
    if (!resume) {
      throw new NotFoundException(`Resume with ID ${id} not found`);
    }

    const transaction = await this.sequelize.transaction();

    try {
      await resume.update(
        {
          title:
            updateResumeDto.title !== undefined
              ? updateResumeDto.title
              : resume.title,
          summary:
            updateResumeDto.summary !== undefined
              ? updateResumeDto.summary
              : resume.summary,
          skills:
            updateResumeDto.skills !== undefined
              ? updateResumeDto.skills
              : resume.skills,
          languages:
            updateResumeDto.languages !== undefined
              ? updateResumeDto.languages
              : resume.languages,
          certifications:
            updateResumeDto.certifications !== undefined
              ? updateResumeDto.certifications
              : resume.certifications,
        },
        { transaction },
      );

      if (updateResumeDto.experiences !== undefined) {
        await this.experienceModel.destroy({
          where: { resumeId: id },
          transaction,
        });

        if (updateResumeDto.experiences.length > 0) {
          const experiences = updateResumeDto.experiences.map((exp) => ({
            ...exp,
            resumeId: id,
          }));
          await this.experienceModel.bulkCreate(experiences, { transaction });
        }
      }

      if (updateResumeDto.education !== undefined) {
        await this.educationModel.destroy({
          where: { resumeId: id },
          transaction,
        });

        if (updateResumeDto.education.length > 0) {
          console.log(updateResumeDto.education[0]);
          const educationEntries = updateResumeDto.education.map((edu) => ({
            ...edu,
            resumeId: id,
          }));
          await this.educationModel.bulkCreate(educationEntries, {
            transaction,
          });
        }
      }

      await transaction.commit();

      return this.findOne(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
