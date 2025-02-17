import { Router } from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  createUserByAdmin,
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  deleteUserByAdmin,
  //updateUserRole, por ahora no.
  getUserInvoices,
  updatePassword,
} from "../controllers/user.controller.js";
import { validateJWT } from "../../middlewares/validate.jwt.js";
import { authorizeRoles } from "../../middlewares/authorize.roles.js";
import { updatePasswordValidator } from "../../middlewares/validators.js"; // Asegúrate de que la ruta sea la correcta

const api = Router();

/* ────────────── PUBLIC ENDPOINTS ────────────── */
/**
 * Registro y Login
 */
api.post("/register", registerUser);
api.post("/login", loginUser);

/* ────────────── ENDPOINTS DE USUARIO (Self) ────────────── */
/**
 * Perfil del usuario autenticado: GET, PUT y DELETE
 */
api.use("/profile", validateJWT);
api.get("/profile", getUserProfile);
api.put("/profile", updateUserProfile);
api.delete("/profile", deleteUser);

/**
 * Actualizar Contraseña (Self)
 * Endpoint especial que requiere que se envíen currentPassword y newPassword.
 */
api.put("/profile/password", updatePasswordValidator, updatePassword);

/**
 * Historial de Compras (CLIENT)
 */
api.use("/invoices", validateJWT, authorizeRoles("CLIENT_ROLE"));
api.get("/invoices", getUserInvoices);

/* ────────────── CRUD ADMIN DE USUARIOS ────────────── */
/**
 * Todas las rutas bajo /users requieren token válido y rol ADMIN.
 */
api.use("/users", validateJWT, authorizeRoles("ADMIN_ROLE"));

/**
 * Actualizar solo el rol de un usuario (opcional)
 */
//Probé pero hay algo que no me permite realizar la solicitud, entonces por el momento la dejaremos de lado.
//api.put("/role", updateUserRole);

/**
 * Crear un nuevo usuario (ADMIN o CLIENT) mediante POST.
 */
api.post("/", createUserByAdmin);

/**
 * Listar todos los usuarios (se puede filtrar con ?role=ADMIN_ROLE o ?role=CLIENT_ROLE)
 */
api.get("/", getAllUsers);

/**
 * Buscar usuario por ID
 */
api.get("/:id", getUserById);

/**
 * Actualizar usuario por ID (incluye cambio de rol y contraseña, si se envían)
 */
api.put("/:id", updateUserByAdmin);

/**
 * Eliminar usuario por ID
 */
api.delete("/:id", deleteUserByAdmin);

export default api;
