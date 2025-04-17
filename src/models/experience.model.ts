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
  tableName: 'Experience',
  timestamps: true,
})
export class Experience extends Model {
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
  company: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  position: string;

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
