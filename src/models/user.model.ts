import {
  Column,
  DataType,
  Model,
  Table,
  HasMany,
  BeforeSave,
  DefaultScope,
  Scopes,
  HasOne,
} from 'sequelize-typescript';
import { Internship } from './internship.model';
import { Favourite } from './favourite.model';
import { Application } from './application.model';
import { Resume } from './resume.model';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  STUDENT = 'student',
  ORGANISATION = 'organisation',
  ADMIN = 'admin',
}

@DefaultScope(() => ({
  attributes: {
    exclude: ['password'],
  },
}))
@Scopes({
  authService: {
    attributes: ['id', 'email', 'phoneNumber', 'password', 'role'],
  },
})
@Table({
  tableName: 'User',
  timestamps: true,
})
export class User extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  phoneNumber: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    defaultValue: UserRole.STUDENT,
  })
  role: UserRole;

  // Relationships
  // @HasOne(() => Resume, 'studentId')
  // resume: Resume;

  @HasMany(() => Internship, 'employerId')
  internships: Internship[];

  @HasMany(() => Favourite)
  favourites: Favourite[];

  @HasMany(() => Application, 'studentId')
  applications: Application[];

  @BeforeSave
  static async hashPassword(user: User) {
    if (user.changed('password')) {
      user.password = await bcrypt.hash(
        user.password,
        await bcrypt.genSalt(10),
      );
    }
  }
}
