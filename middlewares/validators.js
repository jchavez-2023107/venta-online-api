//Validar campos en las rutas
import { body } from "express-validator";
import { validateErrors } from "./validate.errors.js";
import { existUsername, existEmail } from "../utils/db.validators.js";

//Crear arreglo de validaciones (por cada ruta)
export const registerValidator = [
  body("name", "Name cannot be empty").notEmpty(),

  body("surname", "Surname cannot be empty").notEmpty(),

  body("username", "Username cannot be empty").notEmpty().toLowerCase(),

  body("email", "Email cannot be empty")
    .notEmpty()
    .isEmail()
    .custom(existEmail),

  body("username").notEmpty().toLowerCase().custom(existUsername),

  body("password", "Password cannot be empty")
    .notEmpty()
    .isStrongPassword()
    .withMessage("Password must be strong")
    .isLength({ min: 8 })
    .withMessage("Password need at least 8 characters"),

  body("phone", "Phone cannot be empty")
    .notEmpty()
    .matches(/^\d{8}$/),

  //No se le colocan los paréntesis porque cuando los tiene de una vez se ejecuta. Entonces es una referencia porque no tiene paréntesis
  validateErrors,
];

// Validación para actualizar la contraseña
export const updatePasswordValidator = [
  body("currentPassword", "Current password is required").notEmpty(),
  body("newPassword", "New password is required")
    .notEmpty()
    .isStrongPassword()
    .withMessage(
      "Password must be strong: at least 8 characters, 1 uppercase, 1 number, 1 special character"
    ),
  validateErrors,
];
