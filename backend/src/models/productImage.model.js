import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Product } from "./product.model.js";

export const ProductImage = sequelize.define("ProductImage", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "product_id",
    references: { model: Product, key: "id" },
    onDelete: "CASCADE",
  },
  url: { type: DataTypes.STRING(255), allowNull: false },
  displayOrder: { type: DataTypes.INTEGER, defaultValue: 0, field: "display_order" },
  isPrimary: { type: DataTypes.BOOLEAN, defaultValue: false, field: "is_primary" },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: "created_at" },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: "updated_at" },
}, {
  tableName: "product_images",
  timestamps: true,
  underscored: true,
});
