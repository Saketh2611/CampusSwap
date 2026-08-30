import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface ReviewAttributes {
  id: number;
  reviewerId: number;
  targetUserId: number;
  listingId?: number;
  rating: number;
  comment: string;
  role: 'buyer' | 'seller';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReviewCreationAttributes extends Optional<ReviewAttributes, 'id' | 'listingId'> {}

export class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
  public id!: number;
  public reviewerId!: number;
  public targetUserId!: number;
  public listingId?: number;
  public rating!: number;
  public comment!: string;
  public role!: 'buyer' | 'seller';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    reviewerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    targetUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    listingId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('buyer', 'seller'),
      allowNull: false,
      defaultValue: 'buyer',
    },
  },
  {
    sequelize,
    tableName: 'reviews',
    timestamps: true,
  }
);

export default Review;
