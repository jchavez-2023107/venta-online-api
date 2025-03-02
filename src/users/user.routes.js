import { Router } from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getDisabledUsers,
  createUserByAdmin,
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  deleteUserByAdmin,
  getUserInvoices,
  updatePassword,
} from "./user.controller.js";
import { validateJWT } from "../../middlewares/validate.jwt.js";
import { authorizeRoles } from "../../middlewares/authorize.roles.js";
import { updatePasswordValidator } from "../../middlewares/validators.js";
const api = Router();

/* ────────────── PUBLIC ENDPOINTS ────────────── */
/**
 * Registro y Login
 */
api.post("/auth/register", registerUser);
api.post("/auth/login", loginUser);

/* ────────────── ENDPOINTS DE USUARIO (Self) ────────────── */
/**
 * Perfil del usuario autenticado: GET, PUT y DELETE
 */
api.use("/profile", validateJWT);
api.get("/profile", validateJWT, getUserProfile);
api.put("/profile", validateJWT, updateUserProfile);
api.delete("/profile", validateJWT, deleteUser);

/**
 * Actualizar Contraseña (Self)
 * Endpoint especial que requiere que se envíen currentPassword y newPassword.
 */
api.put("/profile/password", validateJWT, updatePasswordValidator, updatePassword);

/**
 * Historial de Compras (CLIENT)
 */
api.get(
  "/invoices",
  validateJWT,
  authorizeRoles("CLIENT_ROLE"),
  getUserInvoices
);

/* ────────────── CRUD ADMIN DE USUARIOS ────────────── */
/**
 * Todas las rutas bajo /users requieren token válido y rol ADMIN.
 */
api.use("/users", validateJWT, authorizeRoles("ADMIN_ROLE"));

/**
 * Crear un nuevo usuario (ADMIN o CLIENT) mediante POST.
 */
api.post(
  "/createuser",
  validateJWT,
  authorizeRoles("ADMIN_ROLE"),
  createUserByAdmin
);

/**
 * Listar todos los usuarios.
 */
api.get("/", validateJWT, authorizeRoles("ADMIN_ROLE"), getAllUsers);

/*
 * Listar Usuarios eliminados
 */

api.get(
  "/deleted",
  validateJWT,
  authorizeRoles("ADMIN_ROLE"),
  getDisabledUsers
);

/**
 * Buscar usuario por ID
 */
api.get("/:id", validateJWT, authorizeRoles("ADMIN_ROLE"), getUserById);

/**
 * Actualizar usuario por ID (incluye cambio de rol y contraseña, si se envían)
 */
api.put("/:id", validateJWT, authorizeRoles("ADMIN_ROLE"), updateUserByAdmin);

/**
 * Eliminar usuario por ID
 */
api.delete(
  "/deleteuser/:id",
  validateJWT,
  authorizeRoles("ADMIN_ROLE"),
  deleteUserByAdmin
);

export default api;
