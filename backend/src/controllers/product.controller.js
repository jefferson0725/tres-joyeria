import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import { ProductSize } from "../models/productSize.model.js";
import { ProductImage } from "../models/productImage.model.js";
import { autoExport } from "./export.controller.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getImagesDir = () => {
  if (process.env.UPLOADS_PATH) {
    return process.env.UPLOADS_PATH;
  }
  return path.join(__dirname, "../../..", "frontend", "public", "images");
};

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);

const ensureUniqueSlug = async (base, ignoreId = null) => {
  let candidate = base || `producto-${Date.now()}`;
  let i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const where = { slug: candidate };
    const existing = await Product.findOne({ where });
    if (!existing || (ignoreId && existing.id === Number(ignoreId))) return candidate;
    i += 1;
    candidate = `${base}-${i}`;
  }
};

const PRODUCT_INCLUDE = [
  "category",
  "sizes",
  { model: ProductImage, as: "images", separate: true, order: [["displayOrder", "ASC"], ["id", "ASC"]] },
];

const parseGemstones = (raw) => {
  if (raw === undefined || raw === null || raw === "") return null;
  if (typeof raw === "string") return raw;
  try {
    return JSON.stringify(raw);
  } catch {
    return null;
  }
};

const writeGalleryImages = async (productId, images) => {
  if (!Array.isArray(images)) return;
  await ProductImage.destroy({ where: { productId } });
  const rows = images
    .map((img, idx) => {
      const url = typeof img === "string" ? img : img?.url;
      if (!url) return null;
      return {
        productId,
        url,
        displayOrder: typeof img === "object" && img?.displayOrder != null ? Number(img.displayOrder) : idx,
        isPrimary: typeof img === "object" ? Boolean(img?.isPrimary) : idx === 0,
      };
    })
    .filter(Boolean);
  if (rows.length) await ProductImage.bulkCreate(rows);
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      image,
      categoryId,
      sku,
      slug,
      material,
      purity,
      weightGrams,
      gemstones,
      gender,
      featured,
      images,
    } = req.body;

    if (!name || String(name).trim().length === 0)
      return res.status(400).json({ error: "name is required" });

    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || !isFinite(priceNum) || priceNum < 0)
      return res.status(400).json({ error: "price must be a non-negative number" });

    let parsedCatId = null;
    if (categoryId !== undefined && categoryId !== null && categoryId !== "") {
      parsedCatId = Number(categoryId);
      if (Number.isNaN(parsedCatId) || !Number.isInteger(parsedCatId))
        return res.status(400).json({ error: "categoryId must be an integer" });
      const cat = await Category.findByPk(parsedCatId);
      if (!cat) return res.status(400).json({ error: "Invalid categoryId" });
    }

    const finalSlug = await ensureUniqueSlug(slug ? slugify(slug) : slugify(name));

    let weightNum = null;
    if (weightGrams !== undefined && weightGrams !== null && weightGrams !== "") {
      weightNum = Number(weightGrams);
      if (Number.isNaN(weightNum) || weightNum < 0)
        return res.status(400).json({ error: "weightGrams must be a non-negative number" });
    }

    const product = await Product.create({
      name: String(name).trim(),
      description,
      price: priceNum,
      image,
      categoryId: parsedCatId,
      sku: sku ? String(sku).trim() : null,
      slug: finalSlug,
      material: material || null,
      purity: purity || null,
      weightGrams: weightNum,
      gemstones: parseGemstones(gemstones),
      gender: gender || null,
      featured: Boolean(featured),
    });

    await writeGalleryImages(product.id, images);

    await autoExport();
    const fresh = await Product.findByPk(product.id, { include: PRODUCT_INCLUDE });
    res.status(201).json(fresh);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      image,
      categoryId,
      displayOrder,
      sku,
      slug,
      material,
      purity,
      weightGrams,
      gemstones,
      gender,
      featured,
      images,
    } = req.body;

    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (categoryId !== undefined && categoryId !== null && categoryId !== "") {
      const parsedCatId = Number(categoryId);
      if (Number.isNaN(parsedCatId) || !Number.isInteger(parsedCatId))
        return res.status(400).json({ error: "categoryId must be an integer" });
      const cat = await Category.findByPk(parsedCatId);
      if (!cat) return res.status(400).json({ error: "Invalid categoryId" });
      product.categoryId = parsedCatId;
    }

    if (name !== undefined) {
      if (!String(name).trim()) return res.status(400).json({ error: "name cannot be empty" });
      product.name = String(name).trim();
    }

    if (description !== undefined) product.description = description;

    if (price !== undefined) {
      const priceNum = Number(price);
      if (Number.isNaN(priceNum) || !isFinite(priceNum) || priceNum < 0)
        return res.status(400).json({ error: "price must be a non-negative number" });
      product.price = priceNum;
    }

    if (image !== undefined) {
      if (image && product.image && image !== product.image) {
        const oldImagePath = path.join(getImagesDir(), product.image);
        if (fs.existsSync(oldImagePath)) {
          try { fs.unlinkSync(oldImagePath); } catch (err) { console.error(err.message); }
        }
      }
      product.image = image;
    }

    if (displayOrder !== undefined) {
      const orderNum = Number(displayOrder);
      if (!Number.isNaN(orderNum) && Number.isInteger(orderNum)) {
        product.displayOrder = orderNum;
      }
    }

    if (sku !== undefined) product.sku = sku ? String(sku).trim() : null;

    if (slug !== undefined) {
      product.slug = await ensureUniqueSlug(slugify(slug || product.name), product.id);
    } else if (name !== undefined && !product.slug) {
      product.slug = await ensureUniqueSlug(slugify(product.name), product.id);
    }

    if (material !== undefined) product.material = material || null;
    if (purity !== undefined) product.purity = purity || null;
    if (gender !== undefined) product.gender = gender || null;
    if (featured !== undefined) product.featured = Boolean(featured);
    if (gemstones !== undefined) product.gemstones = parseGemstones(gemstones);

    if (weightGrams !== undefined) {
      if (weightGrams === null || weightGrams === "") {
        product.weightGrams = null;
      } else {
        const weightNum = Number(weightGrams);
        if (Number.isNaN(weightNum) || weightNum < 0)
          return res.status(400).json({ error: "weightGrams must be a non-negative number" });
        product.weightGrams = weightNum;
      }
    }

    await product.save();

    if (images !== undefined) {
      await writeGalleryImages(product.id, images);
    }

    await autoExport();

    const fresh = await Product.findByPk(product.id, { include: PRODUCT_INCLUDE });
    res.json(fresh);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const softDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, { include: ["sizes", { model: ProductImage, as: "images" }] });
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (product.image) {
      const imagePath = path.join(getImagesDir(), product.image);
      if (fs.existsSync(imagePath)) {
        try { fs.unlinkSync(imagePath); } catch (err) { console.error(err.message); }
      }
    }

    if (product.sizes?.length) {
      for (const size of product.sizes) {
        if (size.image) {
          const sizeImagePath = path.join(getImagesDir(), size.image);
          if (fs.existsSync(sizeImagePath)) {
            try { fs.unlinkSync(sizeImagePath); } catch (err) { console.error(err.message); }
          }
        }
      }
    }

    if (product.images?.length) {
      for (const img of product.images) {
        if (img.url) {
          const galleryPath = path.join(getImagesDir(), img.url);
          if (fs.existsSync(galleryPath)) {
            try { fs.unlinkSync(galleryPath); } catch (err) { console.error(err.message); }
          }
        }
      }
      await ProductImage.destroy({ where: { productId: product.id } });
    }

    await product.destroy();
    await autoExport();
    res.json({ message: "Product soft-deleted", id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const where = {};
    if (req.query.featured === "true") where.featured = true;
    const products = await Product.findAll({
      where,
      include: PRODUCT_INCLUDE,
      order: [["displayOrder", "ASC"], ["id", "ASC"]],
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, { include: PRODUCT_INCLUDE });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
