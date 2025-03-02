/**
 * user.model.js
 *
 * Este modelo define el esquema para los usuarios de la aplicación.
 * Se incluyen datos personales, credenciales, roles y campos adicionales para
 * funcionalidades como el carrito de compras, facturación, preferencias y soft delete.
 *
 * Campos:
 * - name: Nombre del usuario (obligatorio).
 * - surname: Apellido del usuario (obligatorio).
 * - username: Nombre de usuario, único (obligatorio).
 * - email: Correo electrónico, único (obligatorio).
 * - password: Contraseña encriptada (obligatorio); se oculta en las respuestas.
 * - phone: Teléfono del usuario (opcional).
 * - role: Rol del usuario; puede ser "CLIENT_ROLE" o "ADMIN_ROLE" (por defecto CLIENT_ROLE).
 * - cart: Array de referencias a documentos de carrito (Cart).
 * - invoices: Array de referencias a facturas (Invoice).
 * - preferences: Objeto para almacenar preferencias del usuario (por ejemplo, tema, notificaciones, etc.).
 * - active: Indica si la cuenta está activa; permite implementar soft delete (true si activa, false si deshabilitada).
 * - deletedAt: Fecha en que la cuenta fue deshabilitada (null si la cuenta está activa).
 *
 * Además, el esquema genera automáticamente campos de timestamps (createdAt y updatedAt) y
 * omite el campo __v (versionKey).
 */

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Nombre del usuario
    surname: { type: String, required: true }, // Apellido del usuario
    username: { type: String, required: true, unique: true }, // Nombre de usuario único
    email: { type: String, required: true, unique: true }, // Correo electrónico único
    password: { type: String, required: true, select: false }, // Contraseña encriptada; no se devuelve por defecto
    phone: { type: String }, // Teléfono del usuario (opcional)
    role: { type: String, enum: ["CLIENT_ROLE", "ADMIN_ROLE"], default: "CLIENT_ROLE" }, // Rol del usuario
    cart: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cart" }], // Referencias a documentos de carrito
    invoices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Invoice" }], // Referencias a facturas
    preferences: { type: Object, default: {} }, // Objeto para almacenar preferencias del usuario
    active: { type: Boolean, default: true }, // Estado de la cuenta (true: activa, false: deshabilitada)
    deletedAt: { type: Date, default: null } // Fecha de eliminación (soft delete); null si está activa
  },
  { timestamps: true, versionKey: false } // Crea createdAt y updatedAt; elimina __v
);

export default mongoose.model("User", userSchema);