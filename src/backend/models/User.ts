import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password?: string;
  university: string;
  campus: string;
  dorm?: string;
  studentIdVerified: boolean;
  avatar: string;
  bio?: string;
  graduationYear?: number;
  rating: number;
  reviewCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'rating' | 'reviewCount' | 'studentIdVerified'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password?: string;
  public university!: string;
  public campus!: string;
  public dorm?: string;
  public studentIdVerified!: boolean;
  public avatar!: string;
  public bio?: string;
  public graduationYear?: number;
  public rating!: number;
  public reviewCount!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    university: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Stanford University',
    },
    campus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Stanford Main Campus',
    },
    dorm: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    studentIdVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    graduationYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 5.0,
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);

export default User;
