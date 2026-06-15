import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import { generateSitemap } from "../../scripts/generate-sitemap.js";
import { ProductSize } from "../models/productSize.model.js";
import { ProductImage } from "../models/productImage.model.js";
import { Settings } from "../models/settings.model.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getFrontendDistPath() {
  const possiblePaths = [
    "/var/www/tres-joyeria/frontend/dist",
    path.join(process.cwd(), "..", "frontend", "public"),
    path.join(process.cwd(), "..", "frontend", "dist"),
  ];

  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        console.log(`[Export] Using frontend path: ${p}`);
        return p;
      }
    } catch (e) {
      console.log(`[Export] Path check failed for ${p}:`, e.message);
    }
  }

  const fallback = path.join(process.cwd(), "..", "frontend", "public");
  console.log(`[Export] Using fallback path: ${fallback}`);
  return fallback;
}

function buildCategoryTree(flatCategories) {
  const parents = flatCategories.filter((c) => !c.parentId);
  const childrenByParent = {};
  flatCategories.filter((c) => c.parentId).forEach((c) => {
    (childrenByParent[c.parentId] = childrenByParent[c.parentId] || []).push({
      id: c.id, name: c.name, description: c.description, parentId: c.parentId,
    });
  });
  return parents.map((p) => ({
    id: p.id, name: p.name, description: p.description, parentId: null,
    subcategories: childrenByParent[p.id] || [],
  }));
}

const parseGemstones = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

async function buildProductsData(products) {
  return Promise.all(
    products.map(async (product) => {
      const productData = product.toJSON();

      const sizes = await ProductSize.findAll({
        where: { productId: product.id },
        attributes: ["id", "size", "price", "image"],
        raw: true,
      });

      const images = await ProductImage.findAll({
        where: { productId: product.id },
        attributes: ["id", "url", "displayOrder", "isPrimary"],
        order: [["displayOrder", "ASC"], ["id", "ASC"]],
        raw: true,
      });

      return {
        id: productData.id,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        image: productData.image ? path.basename(productData.image) : null,
        sku: productData.sku,
        slug: productData.slug,
        material: productData.material,
        purity: productData.purity,
        weightGrams: productData.weightGrams,
        gemstones: parseGemstones(productData.gemstones),
        gender: productData.gender,
        featured: Boolean(productData.featured),
        displayOrder: productData.displayOrder,
        category: productData.category
          ? { id: productData.category.id, name: productData.category.name, parentId: productData.category.parentId ?? null }
          : null,
        categoryId: productData.categoryId,
        sizes: sizes.map((s) => ({
          id: s.id,
          size: s.size,
          price: s.price,
          image: s.image ? path.basename(s.image) : null,
        })),
        images: images.map((img) => ({
          id: img.id,
          url: img.url ? path.basename(img.url) : null,
          displayOrder: img.displayOrder,
          isPrimary: Boolean(img.isPrimary),
        })),
      };
    }),
  );
}

export const exportDataToFrontend = async (req, res) => {
  try {
    const flatCategories = await Category.findAll({
      attributes: ["id", "name", "description", "parentId"],
      raw: true,
    });
    const categories = buildCategoryTree(flatCategories);

    const products = await Product.findAll({
      include: [{ model: Category, as: "category", attributes: ["id", "name", "parentId"] }],
      order: [["displayOrder", "ASC"], ["id", "ASC"]],
    });

    const settings = await Settings.findAll({ raw: true });
    const settingsObj = {};
    settings.forEach((s) => { settingsObj[s.key] = s.value; });

    const frontendDistDir = getFrontendDistPath();
    const dataFilePath = path.join(frontendDistDir, "data.json");
    let existingCarouselSetting = "false";

    try {
      if (fs.existsSync(dataFilePath)) {
        const existingData = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
        if (existingData.settings?.show_carousel) {
          existingCarouselSetting = existingData.settings.show_carousel;
        }
      }
    } catch (err) {
      console.log("[Export] Could not read existing carousel setting:", err.message);
    }

    settingsObj.show_carousel = existingCarouselSetting;

    const productsData = await buildProductsData(products);

    const exportData = {
      version: new Date().getTime(),
      lastUpdated: new Date().toISOString(),
      settings: settingsObj,
      categories,
      products: productsData,
    };

    await fs.promises.mkdir(frontendDistDir, { recursive: true });
    await fs.promises.writeFile(dataFilePath, JSON.stringify(exportData, null, 2), "utf8");

    console.log(`Data exported to: ${dataFilePath}`);

    res.json({
      message: "Data exported successfully to frontend",
      path: dataFilePath,
      data: exportData,
      stats: { categories: categories.length, products: productsData.length },
    });
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getExportedData = async (req, res) => {
  try {
    const flatCategories = await Category.findAll({
      attributes: ["id", "name", "description", "parentId"],
      raw: true,
    });
    const categories = buildCategoryTree(flatCategories);

    const products = await Product.findAll({
      include: [{ model: Category, as: "category", attributes: ["id", "name", "parentId"] }],
      order: [["displayOrder", "ASC"], ["id", "ASC"]],
    });

    const settings = await Settings.findAll({ raw: true });
    const settingsObj = {};
    settings.forEach((s) => { settingsObj[s.key] = s.value; });

    const frontendDistDir = getFrontendDistPath();
    const dataFilePath = path.join(frontendDistDir, "data.json");

    try {
      if (fs.existsSync(dataFilePath)) {
        const existingData = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
        if (existingData.settings?.show_carousel) {
          settingsObj.show_carousel = existingData.settings.show_carousel;
        }
      }
    } catch (err) {
      console.log("[getExportedData] Could not read carousel setting:", err.message);
    }

    const productsData = await buildProductsData(products);

    res.json({
      version: new Date().getTime(),
      lastUpdated: new Date().toISOString(),
      settings: settingsObj,
      categories,
      products: productsData,
    });
  } catch (error) {
    console.error("Get exported data error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const autoExport = async () => {
  try {
    const flatCategories = await Category.findAll({
      attributes: ["id", "name", "description", "parentId"],
      raw: true,
    });
    const categories = buildCategoryTree(flatCategories);

    const products = await Product.findAll({
      include: [{ model: Category, as: "category", attributes: ["id", "name", "parentId"] }],
      order: [["displayOrder", "ASC"], ["id", "ASC"]],
    });

    const settings = await Settings.findAll({ raw: true });
    const settingsObj = {};
    settings.forEach((s) => { settingsObj[s.key] = s.value; });

    const frontendDistDir = getFrontendDistPath();
    const dataFilePath = path.join(frontendDistDir, "data.json");

    let existingCarouselSetting = "false";
    try {
      if (fs.existsSync(dataFilePath)) {
        const existingData = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
        if (existingData.settings?.show_carousel) {
          existingCarouselSetting = existingData.settings.show_carousel;
        }
      }
    } catch (err) {
      console.log("[autoExport] Could not read existing carousel setting:", err.message);
    }
    settingsObj.show_carousel = existingCarouselSetting;

    const productsData = await buildProductsData(products);

    const exportData = {
      version: new Date().getTime(),
      lastUpdated: new Date().toISOString(),
      settings: settingsObj,
      categories,
      products: productsData,
    };

    await fs.promises.mkdir(frontendDistDir, { recursive: true });
    await fs.promises.writeFile(dataFilePath, JSON.stringify(exportData, null, 2), "utf8");

    await generateSitemap();

    console.log(`Auto-export completed: ${new Date().toISOString()}`);
  } catch (error) {
    console.error("Auto-export error:", error);
  }
};
