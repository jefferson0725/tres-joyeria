import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to get the correct carousel directory
const getCarouselDir = () => {
  if (process.env.UPLOADS_PATH) {
    // En producción: <UPLOADS_PATH>/../carousel
    return path.join(path.dirname(process.env.UPLOADS_PATH), "carousel");
  }
  // En desarrollo: frontend/public/images/carousel
  return path.join(
    __dirname,
    "../../..",
    "frontend",
    "public",
    "images",
    "carousel",
  );
};

// Helper to get data.json path
const getDataFilePath = () => {
  // En producción, data.json está en /var/www/tres-joyeria/frontend/dist
  // En desarrollo, está en frontend/public
  if (process.env.NODE_ENV === "production" || process.env.UPLOADS_PATH) {
    return "/var/www/tres-joyeria/frontend/dist/data.json";
  }
  return path.join(__dirname, "../../..", "frontend", "public", "data.json");
};

// Ensure carousel directory exists
async function ensureCarouselDir() {
  try {
    const carouselDir = getCarouselDir();
    await fs.mkdir(carouselDir, { recursive: true });
  } catch (err) {
    console.error("Error creating carousel directory:", err);
  }
}

// Get all carousel images — pairs desktop + mobile by shared timestamp
export const getCarouselImages = async (req, res) => {
  try {
    await ensureCarouselDir();

    const carouselDir = getCarouselDir();
    const files = await fs.readdir(carouselDir);
    const imageFiles = files.filter((f) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));

    // Desktop files are those NOT ending in -mobile.webp
    const desktopFiles = imageFiles.filter((f) => !f.includes("-mobile."));
    const mobileFiles = new Set(imageFiles.filter((f) => f.includes("-mobile.")));

    const images = desktopFiles.map((file) => {
      const base = file.replace(/\.[^.]+$/, ""); // strip extension
      const ext = file.split(".").pop();
      const mobileFilename = `${base}-mobile.${ext}`;
      const hasMobile = mobileFiles.has(mobileFilename);
      return {
        filename: file,
        url: `/images/carousel/${file}`,
        ...(hasMobile && {
          mobileFilename,
          mobileUrl: `/images/carousel/${mobileFilename}`,
        }),
      };
    });

    res.json({ images });
  } catch (err) {
    console.error("Error reading carousel images:", err);
    res.status(500).json({ error: "Error al obtener imágenes del carrusel" });
  }
};

// Upload carousel image — processes desktop (required) + mobile (optional)
export const uploadCarouselImage = async (req, res) => {
  const uploaded = [];
  try {
    await ensureCarouselDir();

    const desktopFile = req.files?.image?.[0];
    const mobileFile = req.files?.mobileImage?.[0];

    if (!desktopFile) {
      return res.status(400).json({ error: "No se proporcionó ninguna imagen" });
    }

    const carouselDir = getCarouselDir();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    // Process desktop image
    const desktopFilename = `carousel-${uniqueSuffix}.webp`;
    const desktopDest = path.join(carouselDir, desktopFilename);
    await sharp(desktopFile.path).webp({ quality: 85 }).toFile(desktopDest);
    await fs.unlink(desktopFile.path);
    uploaded.push(desktopDest);

    // Process mobile image (optional)
    let mobileFilename = null;
    if (mobileFile) {
      mobileFilename = `carousel-${uniqueSuffix}-mobile.webp`;
      const mobileDest = path.join(carouselDir, mobileFilename);
      await sharp(mobileFile.path).webp({ quality: 85 }).toFile(mobileDest);
      await fs.unlink(mobileFile.path);
      uploaded.push(mobileDest);
    }

    res.json({
      success: true,
      filename: desktopFilename,
      url: `/images/carousel/${desktopFilename}`,
      ...(mobileFilename && {
        mobileFilename,
        mobileUrl: `/images/carousel/${mobileFilename}`,
      }),
    });
  } catch (err) {
    console.error("Error uploading carousel image:", err);
    for (const p of [req.files?.image?.[0]?.path, req.files?.mobileImage?.[0]?.path]) {
      if (p) try { await fs.unlink(p); } catch {}
    }
    res.status(500).json({ error: "Error al subir la imagen" });
  }
};

// Delete carousel image — also removes mobile version if it exists
export const deleteCarouselImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const carouselDir = getCarouselDir();

    await fs.unlink(path.join(carouselDir, filename));

    // Try to delete mobile companion (carousel-{ts}-mobile.webp)
    const base = filename.replace(/\.[^.]+$/, "");
    const ext = filename.split(".").pop();
    const mobileFilename = `${base}-mobile.${ext}`;
    try {
      await fs.unlink(path.join(carouselDir, mobileFilename));
    } catch {}

    res.json({ success: true, message: "Imagen eliminada correctamente" });
  } catch (err) {
    console.error("Error deleting carousel image:", err);
    res.status(500).json({ error: "Error al eliminar la imagen" });
  }
};

// Update carousel settings (show/hide)
export const updateCarouselSettings = async (req, res) => {
  try {
    const { show_carousel } = req.body;

    // Read current data
    const dataFile = getDataFilePath();

    // Ensure directory exists
    const dataDir = path.dirname(dataFile);
    await fs.mkdir(dataDir, { recursive: true });

    let jsonData = {};

    // Try to read existing data
    try {
      const data = await fs.readFile(dataFile, "utf-8");
      jsonData = JSON.parse(data);
    } catch (err) {
      // File doesn't exist, start with empty object
      console.log("[Carousel] Creating new data.json file");
    }

    // Update settings
    if (!jsonData.settings) {
      jsonData.settings = {};
    }
    // Store as string for consistency with other settings
    jsonData.settings.show_carousel = show_carousel ? "true" : "false";

    // Update version and timestamp
    jsonData.version = Date.now();
    jsonData.lastUpdated = new Date().toISOString();

    // Write back
    await fs.writeFile(dataFile, JSON.stringify(jsonData, null, 2));

    res.json({ success: true, show_carousel: jsonData.settings.show_carousel });
  } catch (err) {
    console.error("Error updating carousel settings:", err);
    res.status(500).json({ error: "Error al actualizar configuración" });
  }
};
