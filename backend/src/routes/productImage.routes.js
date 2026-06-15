import { Router } from "express";
import auth, { isAdmin } from "../middlewares/auth.js";
import {
  listImages,
  addImage,
  deleteImage,
  reorderImages,
} from "../controllers/productImage.controller.js";

const router = Router();

router.get("/product/:productId", listImages);
router.post("/product/:productId", auth(), isAdmin, addImage);
router.put("/product/:productId/reorder", auth(), isAdmin, reorderImages);
router.delete("/:id", auth(), isAdmin, deleteImage);

export default router;
