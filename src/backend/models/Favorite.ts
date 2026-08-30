import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface FavoriteAttributes {
  id: number;
  userId: number;
  listingId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FavoriteCreationAttributes extends Optional<FavoriteAttributes, 'id'> {}

export class Favorite extends Model<FavoriteAttributes, FavoriteCreationAttributes> implements FavoriteAttributes {
  public id!: number;
  public userId!: number;
  public listingId!: number;
  public listing?: any;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Favorite.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    listingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'favorites',
    timestamps: true,
  }
);

export default Favorite;
