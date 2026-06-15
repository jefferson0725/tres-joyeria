import { Category } from "../src/models/index.js";
import { sequelize } from "../src/config/db.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Seed inicial de categorías de joyería para TRES
 * Ejecutar con: node scripts/seed-jewelry-categories.js
 */
async function seedJewelryCategories() {
  try {
    await sequelize.authenticate();
    console.log("✓ Conexión a base de datos exitosa\n");

    const categories = [
      { name: "Anillos", description: "Anillos de oro, plata, compromiso y diseño." },
      { name: "Collares", description: "Collares, cadenas y gargantillas." },
      { name: "Aretes", description: "Aretes, pendientes y topos." },
      { name: "Pulseras", description: "Pulseras y brazaletes." },
      { name: "Dijes", description: "Dijes, charms y colgantes." },
      { name: "Conjuntos", description: "Sets coordinados de joyería." },
    ];

    let createdCount = 0;
    let existingCount = 0;

    for (const cat of categories) {
      const [, created] = await Category.findOrCreate({
        where: { name: cat.name },
        defaults: cat,
      });

      if (created) {
        console.log(`✓ Creada categoría: ${cat.name}`);
        createdCount++;
      } else {
        console.log(`  Categoría existente: ${cat.name}`);
        existingCount++;
      }
    }

    console.log(`\n✓ Seed de categorías completado`);
    console.log(`  Creadas: ${createdCount}`);
    console.log(`  Existentes: ${existingCount}`);

    process.exit(0);
  } catch (error) {
    console.error("\n✗ Error en el seed de categorías:");
    console.error(error);
    process.exit(1);
  }
}

seedJewelryCategories();
