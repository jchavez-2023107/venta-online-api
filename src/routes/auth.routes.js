import { Router } from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";

const api = Router();

/**
 * 📌 Rutas de autenticación
 */
api.post("/register", registerUser); // Registro de usuario (CLIENT_ROLE por defecto)
api.post("/login", loginUser); // Inicio de sesión y generación de token

export default api;