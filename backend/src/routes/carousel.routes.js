import express from "express";
import auth, { isAdmin } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";
import {
  getCarouselImages,
  uploadCarouselImage,
  deleteCarouselImage,
  updateCarouselSettings,
} from "../controllers/carousel.controller.js";

const router = express.Router();

// Get all carousel images
router.get("/", getCarouselImages);

// Upload carousel image (admin only) — accepts optional mobileImage field too
router.post(
  "/upload",
  auth(null),
  isAdmin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "mobileImage", maxCount: 1 },
  ]),
  uploadCarouselImage,
);

// Delete carousel image (admin only)
router.delete("/:filename", auth(null), isAdmin, deleteCarouselImage);

// Update carousel settings (admin only)
router.put("/settings", auth(null), isAdmin, updateCarouselSettings);

export default router;
