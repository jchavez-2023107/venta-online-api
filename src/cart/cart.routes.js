import { Router } from "express";
import { 
  getCart, 
  addItemToCart, 
  updateItemQuantity, 
  removeItemFromCart, 
  clearCart 
} from "./cart.controller.js";
import { validateJWT } from "../../middlewares/validate.jwt.js";

const api = Router();

// Todas las rutas requieren autenticación
api.use(validateJWT);

/**
 * GET /api/cart
 * Obtener el carrito del usuario autenticado.
 */
api.get("/", validateJWT, getCart);

/**
 * POST /api/cart
 * Agregar un ítem al carrito.
 * Body esperado: { "productId": "<id>", "quantity": <number> }
 */
api.post("/", validateJWT, addItemToCart);

/**
 * PUT /api/cart
 * Actualizar la cantidad de un ítem en el carrito.
 * Body esperado: { "productId": "<id>", "quantity": <number> }
 */
api.put("/", validateJWT, updateItemQuantity);

/**
 * DELETE /api/cart
 * Eliminar un ítem del carrito.
 * Body esperado: { "productId": "<id>" }
 */
api.delete("/", validateJWT, removeItemFromCart);

/**
 * DELETE /api/cart/clear
 * Vaciar el carrito completamente.
 */
api.delete("/clear", validateJWT, clearCart);

export default api;
