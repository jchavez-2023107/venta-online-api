import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getOutOfStockProducts,
  getTopSellingProducts,
} from "./product.controller.js";
import { validateJWT } from "../../middlewares/validate.jwt.js";
import { authorizeRoles } from "../../middlewares/authorize.roles.js";

const api = Router();

/* ────────────── Rutas públicas (Clientes pueden ver productos) ────────────── */
api.get("/", validateJWT, getProducts);
api.get("/out-of-stock", validateJWT, getOutOfStockProducts);
api.get("/top-selling", validateJWT, getTopSellingProducts);
api.get("/:id", validateJWT, getProductById);

/* ────────────── Rutas protegidas (Solo ADMIN) ────────────── */
api.use(validateJWT, authorizeRoles("ADMIN_ROLE"));
api.post("/", validateJWT, authorizeRoles("ADMIN_ROLE"), createProduct);
api.put("/:id", validateJWT, authorizeRoles("ADMIN_ROLE"), updateProduct);
api.delete("/:id", validateJWT, authorizeRoles("ADMIN_ROLE"), deleteProduct);

export default api;
