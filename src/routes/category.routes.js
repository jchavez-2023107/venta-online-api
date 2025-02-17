import { Router } from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from "../controllers/category.controller.js";
import { validateJWT } from "../../middlewares/validate.jwt.js";
import { authorizeRoles } from "../../middlewares/authorize.roles.js";

const api = Router();

/**
 * Rutas públicas:
 * - GET /api/categories (obtener todas)
 * - GET /api/categories/:id (obtener por id)
 */
api.get("/", getCategories);
api.get("/:id", getCategoryById);

/**
 * Rutas protegidas para ADMIN:
 * - POST /api/categories
 * - PUT /api/categories/:id
 * - DELETE /api/categories/:id
 */
api.use("/", validateJWT, authorizeRoles("ADMIN_ROLE"));
api.post("/", createCategory);
api.put("/:id", updateCategory);
api.delete("/:id", deleteCategory);

export default api;