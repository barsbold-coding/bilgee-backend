import {
  Column,
  DataType,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Resume } from './resume.model';

@Table({
  tableName: 'Education',
  timestamps: true,
})
export class Education extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => Resume)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  resumeId: number;

  @BelongsTo(() => Resume)
  resume: Resume;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  institution: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  degree: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  fieldOfStudy: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  startDate: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true, // Null means "present" or "current"
  })
  endDate: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  grade: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  location: string;
}
