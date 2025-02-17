import { Router } from "express";
import {
  createInvoice,
  getUserInvoices,
  getAllInvoices,
  getInvoiceById,
  deleteInvoice,
} from "../controllers/invoice.controller.js";
import { validateJWT } from "../../middlewares/validate.jwt.js";
import { authorizeRoles } from "../../middlewares/authorize.roles.js";

const api = Router();

/**
 * 📌 Rutas para Clientes (Solo CLIENT_ROLE)
 */
api.use("/my-invoices", validateJWT, authorizeRoles("CLIENT_ROLE"));
api.get("/my-invoices", getUserInvoices); // Obtener facturas del usuario autenticado
api.post("/my-invoices", createInvoice); // Crear una factura nueva

/**
 * 📌 Rutas para Administradores (Solo ADMIN_ROLE)
 */
api.use("/", validateJWT, authorizeRoles("ADMIN_ROLE"));
api.get("/", getAllInvoices); // Obtener todas las facturas del sistema
api.get("/:id", getInvoiceById); // Obtener una factura específica
api.delete("/:id", deleteInvoice); // Eliminar una factura por ID

export default api;
