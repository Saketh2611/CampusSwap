import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface ListingAttributes {
  id: number;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  condition: 'Brand New' | 'Like New' | 'Good' | 'Fair';
  status: 'active' | 'pending' | 'sold';
  images: string[];
  campus: string;
  pickupLocation: string;
  isNegotiable: boolean;
  views: number;
  favoritesCount: number;
  sellerId: number;
  buyerId?: number;
  soldAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ListingCreationAttributes
  extends Optional<ListingAttributes, 'id' | 'status' | 'views' | 'favoritesCount' | 'isNegotiable'> {}

export class Listing extends Model<ListingAttributes, ListingCreationAttributes> implements ListingAttributes {
  public id!: number;
  public title!: string;
  public description!: string;
  public price!: number;
  public originalPrice?: number;
  public category!: string;
  public condition!: 'Brand New' | 'Like New' | 'Good' | 'Fair';
  public status!: 'active' | 'pending' | 'sold';
  public images!: string[];
  public campus!: string;
  public pickupLocation!: string;
  public isNegotiable!: boolean;
  public views!: number;
  public favoritesCount!: number;
  public sellerId!: number;
  public buyerId?: number;
  public soldAt?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Listing.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    originalPrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    condition: {
      type: DataTypes.ENUM('Brand New', 'Like New', 'Good', 'Fair'),
      allowNull: false,
      defaultValue: 'Good',
    },
    status: {
      type: DataTypes.ENUM('active', 'pending', 'sold'),
      defaultValue: 'active',
      allowNull: false,
    },
    images: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    campus: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pickupLocation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isNegotiable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    favoritesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    sellerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    buyerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    soldAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'listings',
    timestamps: true,
  }
);

export default Listing;
