import { Router } from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "./category.controller.js";
import { validateJWT } from "../../middlewares/validate.jwt.js";
import { authorizeRoles } from "../../middlewares/authorize.roles.js";

const api = Router();

/**
 * Rutas públicas:
 * - GET /api/categories (obtener todas)
 * - GET /api/categories/:id (obtener por id)
 */
api.get("/", validateJWT, getCategories);
api.get("/:id", validateJWT, getCategoryById);

/**
 * Rutas protegidas para ADMIN:
 * - POST /api/categories
 * - PUT /api/categories/:id
 * - DELETE /api/categories/:id
 */
api.use("/", validateJWT, authorizeRoles("ADMIN_ROLE"));
api.post("/", validateJWT, authorizeRoles("ADMIN_ROLE"), createCategory);
api.put("/:id", validateJWT, authorizeRoles("ADMIN_ROLE"), updateCategory);
api.delete("/:id", validateJWT, authorizeRoles("ADMIN_ROLE"), deleteCategory);

export default api;
