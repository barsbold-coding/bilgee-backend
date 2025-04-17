import {
  Column,
  DataType,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Internship } from './internship.model';

export enum ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Table({
  tableName: 'Application',
  timestamps: true,
})
export class Application extends Model {
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
  studentId: number;

  @BelongsTo(() => User)
  student: User;

  @ForeignKey(() => Internship)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  internshipId: number;

  @BelongsTo(() => Internship)
  internship: Internship;

  @Column({
    type: DataType.ENUM(...Object.values(ApplicationStatus)),
    defaultValue: ApplicationStatus.PENDING,
    allowNull: false,
  })
  status: ApplicationStatus;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  appliedAt: Date;
}
