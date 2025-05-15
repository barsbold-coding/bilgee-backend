import {
  Column,
  DataType,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Application } from './application.model';
import { User } from './user.model';

export enum InternshipStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
}

@Table({
  tableName: 'Internship',
  timestamps: true,
})
export class Internship extends Model {
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
  })
  employerId: number;

  @BelongsTo(() => User)
  employer: User;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  location: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  salaryRange: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  startDate: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  endDate: Date;

  @Column({
    type: DataType.ENUM(...Object.values(InternshipStatus)),
    defaultValue: InternshipStatus.ACTIVE,
  })
  status: InternshipStatus;

  @HasMany(() => Application)
  applications: Application[];
}
