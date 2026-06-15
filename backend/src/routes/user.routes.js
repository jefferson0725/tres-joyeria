import { Router } from "express";
import {
  loginUser,
  getUsers,
  getUserById,
  changePassword,
} from "../controllers/user.controller.js";
import { refreshToken, logout } from "../controllers/auth.controller.js";
import auth, { isAdmin } from "../middlewares/auth.js";

const router = Router();

// Public
router.post("/login", loginUser);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

// Protected
router.put("/change-password", auth(), changePassword);

// Admin-only
router.get("/", auth(), isAdmin, getUsers);
router.get("/:id", auth(), isAdmin, getUserById);

export default router;
