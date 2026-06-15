import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Category } from "./category.model.js";

export const Product = sequelize.define("Product", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  image: { type: DataTypes.STRING(255) },
  displayOrder: { type: DataTypes.INTEGER, defaultValue: 0, field: "display_order" },

  // Jewelry-specific fields
  sku: { type: DataTypes.STRING(50), unique: true },
  slug: { type: DataTypes.STRING(180), unique: true },
  material: { type: DataTypes.STRING(80) },
  purity: { type: DataTypes.STRING(20) },
  weightGrams: { type: DataTypes.DECIMAL(8, 2), field: "weight_grams" },
  gemstones: { type: DataTypes.TEXT },
  gender: { type: DataTypes.STRING(20) },
  featured: { type: DataTypes.BOOLEAN, defaultValue: false },

  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: "created_at" },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: "updated_at" },
  deletedAt: { type: DataTypes.DATE, field: "deleted_at" },
}, {
  tableName: "products",
  timestamps: true,
  underscored: true,
  paranoid: true,
});
