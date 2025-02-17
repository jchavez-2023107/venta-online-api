import { Router } from "express";
import { addToCart, getCart, clearCart } from "../controllers/cart.controller.js";
import { validateJWT } from "../../middlewares/validate.jwt.js";
import { authorizeRoles } from "../../middlewares/authorize.roles.js";

const api = Router();

/**
 * 📌 Rutas del Carrito (Solo CLIENT puede comprar)
 */
api.use("/", validateJWT, authorizeRoles("CLIENT_ROLE"));
api.post("/add", addToCart);
api.get("/", getCart);
api.delete("/", clearCart);

export default api;
