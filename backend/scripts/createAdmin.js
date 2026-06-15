import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";
import * as readline from "readline";
import { User } from "../src/models/user.model.js";
import { sequelize } from "../src/config/db.js";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (q) => new Promise((resolve) => rl.question(q, resolve));

async function main() {
  try {
    await sequelize.authenticate();
    console.log("✓ Conexión a base de datos exitosa\n");

    const username = await question("Nombre de usuario: ");
    const email = await question("Email: ");
    const password = await question("Contraseña: ");

    if (!username || !email || !password) {
      console.error("Todos los campos son obligatorios");
      process.exit(1);
    }

    const hashed = await bcrypt.hash(password, 10);

    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: { username, email, password: hashed, role: "admin" },
    });

    if (!created) {
      user.username = username;
      user.password = hashed;
      user.role = "admin";
      await user.save();
      console.log("\n✓ Admin actualizado");
    } else {
      console.log("\n✓ Admin creado");
    }

    console.log({ id: user.id, username: user.username, email: user.email, role: user.role });
    rl.close();
    process.exit(0);
  } catch (err) {
    console.error("✗ Error:", err);
    rl.close();
    process.exit(1);
  }
}

main();
