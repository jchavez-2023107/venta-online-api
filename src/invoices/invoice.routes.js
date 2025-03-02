import { Router } from "express";
import {
  createInvoice,
  getInvoiceById,
  getAllInvoices,
  updateInvoiceStatus,
} from "./invoice.controller.js";
import { validateJWT } from "../../middlewares/validate.jwt.js";
import { authorizeRoles } from "../../middlewares/authorize.roles.js";

const api = Router();

/* ────────────── Rutas para clientes ────────────── */
// Crear factura a partir del carrito (CLIENT)
api.post("/", validateJWT, authorizeRoles("CLIENT_ROLE"), createInvoice);

// Obtener factura por ID (ADMIN o dueño)
api.get("/:id", validateJWT, getInvoiceById);

/* ────────────── Rutas para ADMIN ────────────── */
// Obtener todas las facturas (ADMIN)
api.get("/", validateJWT, authorizeRoles("ADMIN_ROLE"), getAllInvoices);

// Actualizar estado de la factura (ADMIN)
api.put("/:id", validateJWT, authorizeRoles("ADMIN_ROLE"), updateInvoiceStatus);

export default api;
