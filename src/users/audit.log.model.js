/**
 * audit.log.model.js
 *
 * Este modelo define el esquema para los registros de auditoría de acciones sensibles en la aplicación.
 *
 * Campos:
 * - user: Referencia al usuario (ObjectId) que realizó la acción.
 * - action: Descripción corta de la acción realizada, por ejemplo, "Account Deletion Request (Soft Delete)".
 * - ip: Dirección IP desde donde se realizó la acción.
 * - date: Fecha y hora en la que se registró la acción (se asigna automáticamente al crear el documento).
 * - details: Objeto opcional para almacenar información adicional relacionada con la acción (por ejemplo, mensajes o datos específicos).
 *
 * Con este modelo, se registra un historial de operaciones críticas, lo que permite rastrear y auditar acciones
 * sensibles en el sistema (como la deshabilitación de una cuenta en vez de su eliminación definitiva).
 */

import mongoose from "mongoose";

const auditlogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    ip: { type: String },
    date: { type: Date, default: Date.now },
    details: { type: Object },
  },
  { versionKey: false }
);

export default mongoose.model("AuditLog", auditlogSchema);
