import { ProductImage } from "../models/productImage.model.js";
import { Product } from "../models/product.model.js";
import { autoExport } from "./export.controller.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const getImagesDir = () => {
  if (process.env.UPLOADS_PATH) return process.env.UPLOADS_PATH;
  return path.join(__dirname, "../../..", "frontend", "public", "images");
};

export const listImages = async (req, res) => {
  try {
    const { productId } = req.params;
    const images = await ProductImage.findAll({
      where: { productId },
      order: [["displayOrder", "ASC"], ["id", "ASC"]],
    });
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addImage = async (req, res) => {
  try {
    const { productId } = req.params;
    const { url, displayOrder, isPrimary } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (!url) return res.status(400).json({ error: "url is required" });

    if (isPrimary) {
      await ProductImage.update({ isPrimary: false }, { where: { productId } });
    }

    const image = await ProductImage.create({
      productId: Number(productId),
      url,
      displayOrder: Number(displayOrder ?? 0),
      isPrimary: Boolean(isPrimary),
    });

    await autoExport();
    res.status(201).json(image);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await ProductImage.findByPk(id);
    if (!image) return res.status(404).json({ error: "Image not found" });

    if (image.url) {
      const fullPath = path.join(getImagesDir(), image.url);
      if (fs.existsSync(fullPath)) {
        try { fs.unlinkSync(fullPath); } catch (err) { console.error(err.message); }
      }
    }

    await image.destroy();
    await autoExport();
    res.json({ message: "Image deleted", id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const reorderImages = async (req, res) => {
  try {
    const { productId } = req.params;
    const { order } = req.body; // [{id, displayOrder, isPrimary}]
    if (!Array.isArray(order)) return res.status(400).json({ error: "order must be an array" });

    for (const item of order) {
      await ProductImage.update(
        {
          displayOrder: Number(item.displayOrder ?? 0),
          isPrimary: Boolean(item.isPrimary),
        },
        { where: { id: item.id, productId } },
      );
    }

    await autoExport();
    const images = await ProductImage.findAll({
      where: { productId },
      order: [["displayOrder", "ASC"], ["id", "ASC"]],
    });
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
