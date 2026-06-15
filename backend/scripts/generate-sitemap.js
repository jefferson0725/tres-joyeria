import { Product } from "../src/models/product.model.js";
import { Category } from "../src/models/category.model.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SITE_URL = process.env.SITE_URL || "https://tresjoyeria.com";

function getFrontendPublicPath() {
  const candidates = [
    "/var/www/tres-joyeria/frontend/dist",
    path.join(__dirname, "..", "..", "frontend", "public"),
    path.join(__dirname, "..", "..", "frontend", "dist"),
  ];
  for (const p of candidates) {
    try { if (fs.existsSync(p)) return p; } catch {}
  }
  return path.join(__dirname, "..", "..", "frontend", "public");
}

export async function generateSitemap() {
  try {
    const [products, categories] = await Promise.all([
      Product.findAll({ attributes: ["slug"], where: { deletedAt: null }, paranoid: true }),
      Category.findAll({ attributes: ["name", "parentId"], where: { deletedAt: null }, paranoid: true }),
    ]);

    const now = new Date().toISOString().split("T")[0];

    const urls = [
      `  <url><loc>${SITE_URL}/</loc><changefreq>daily</changefreq><priority>1.0</priority><lastmod>${now}</lastmod></url>`,
      ...products
        .filter((p) => p.slug)
        .map((p) => `  <url><loc>${SITE_URL}/producto/${p.slug}</loc><changefreq>weekly</changefreq><priority>0.8</priority><lastmod>${now}</lastmod></url>`),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;

    const publicPath = getFrontendPublicPath();
    await fs.promises.mkdir(publicPath, { recursive: true });
    await fs.promises.writeFile(path.join(publicPath, "sitemap.xml"), xml, "utf8");

    console.log(`[Sitemap] Generated ${urls.length} URLs`);
  } catch (err) {
    console.error("[Sitemap] Error:", err.message);
  }
}

// Run standalone: node scripts/generate-sitemap.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  import("../src/config/db.js").then(async ({ sequelize }) => {
    await sequelize.authenticate();
    await generateSitemap();
    process.exit(0);
  });
}
