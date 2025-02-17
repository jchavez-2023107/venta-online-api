import { Router } from "express";
import { 
  createProduct, 
  getProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct 
} from "../controllers/product.controller.js";
import { validateJWT } from "../../middlewares/validate.jwt.js";
import { authorizeRoles } from "../../middlewares/authorize.roles.js";

const api = Router();

/**
 * 📌 Rutas públicas (Clientes pueden ver productos)
 */
api.get("/", getProducts);
api.get("/:id", getProductById);

/**
 * 📌 Rutas protegidas (Solo ADMIN puede modificar productos)
 */
api.use("/", validateJWT, authorizeRoles("ADMIN_ROLE"));
api.post("/", createProduct);
api.put("/:id", updateProduct);
api.delete("/:id", deleteProduct);

export default api;
