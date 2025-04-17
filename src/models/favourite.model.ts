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

@Table({
  tableName: 'Favourite',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'internshipId'],
      name: 'favourite_user_internship_unique',
    },
  ],
})
export class Favourite extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @ForeignKey(() => Internship)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  internshipId: number;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Internship)
  internship: Internship;
}
