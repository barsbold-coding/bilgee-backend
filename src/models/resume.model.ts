// src/models/resume.model.ts
import {
  Column,
  DataType,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Experience } from './experience.model';
import { Education } from './education.model';

@Table({
  tableName: 'Resume',
  timestamps: true,
})
export class Resume extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true, // Each student can have only one resume
  })
  studentId: number;

  @BelongsTo(() => User)
  student: User;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  summary: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  skills: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  languages: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  certifications: string;

  @HasMany(() => Experience)
  experiences: Experience[];

  @HasMany(() => Education)
  education: Education[];
}
