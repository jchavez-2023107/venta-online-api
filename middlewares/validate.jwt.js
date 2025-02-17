// Validar los tokens
"use strict";

import jwt from "jsonwebtoken";

export const validateJWT = async (req, res, next) => {
  try {
    // Obtener la llave de acceso privada al token desde .env
    let secretKey = process.env.SECRET_KEY;

    // Obtener el token de los headers (cabeceras)
    let { authorization } = req.headers;

    // Verificar que el token esté presente y tenga el formato correcto
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    // Extraer el token eliminando "Bearer "
    let token = authorization.split(" ")[1];

    // Verificar el token
    let decoded = jwt.verify(token, secretKey);

    // Inyectar en la solicitud el usuario autenticado
    req.user = {
      id: decoded.uid, // Usamos el `uid` del token
      username: decoded.username,
      role: decoded.role,
    };

    // Continuar con la siguiente función
    next();
  } catch (err) {
    console.error("❌ JWT Error:", err);

    // Si el token ha expirado, devolver un mensaje claro
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please log in again." });
    }

    return res.status(401).json({ message: "Invalid token." });
  }
};