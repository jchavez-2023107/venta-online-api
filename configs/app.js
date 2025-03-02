"use strict"; // Habilita el modo estricto para evitar errores comunes y mejorar seguridad

// Definir el entorno de ejecución de la aplicación (desarrollo o producción)
const env = process.env.NODE_ENV || "development";
console.log(`🛠️ Modo actual: ${env}`);

import express from "express";
// Express es un framework minimalista para Node.js que facilita la creación de servidores y rutas HTTP.
import morgan from "morgan";
// Morgan es un middleware para registrar solicitudes HTTP en la consola, útil para depuración y monitoreo del tráfico.
import helmet from "helmet";
// Helmet mejora la seguridad de la aplicación configurando correctamente las cabeceras HTTP para prevenir ataques comunes.
import cors from "cors";
// CORS (Cross-Origin Resource Sharing) permite que clientes desde diferentes dominios puedan hacer peticiones a nuestra API.
import { limiter } from "../middlewares/rate.limit.js";
// limiter es un middleware que hicimos para evitar los ataques de fuerza bruta.
import { rutasGenerales } from "../src/rutas.generales.js"; // Importación de rutas principales

/*
 * Función para configurar middlewares globales.
 */
function configs(app) {
  app.use(morgan("dev")); // Logs de peticiones HTTP
  app.use(helmet()); // Seguridad de cabeceras
  app.use(cors()); // Permitir CORS
  app.use(express.json()); // Parsear JSON en requests
  app.use(express.urlencoded({ extended: true })); // Para x-www-form-urlencoded
  app.use(limiter); // Limitar solicitudes por tiempo
}

/*
 * Función para cargar las rutas en la aplicación.
 * Se encarga de importar y asignar las rutas generales al servidor Express.
 *
 * @param {Object} app - Instancia de Express.
 */
function loadRoutes(app) {
  rutasGenerales(app); //Llama a la función que contiene las rutas principales y todas las rutas estarán bajo el prefijo "/api"
}

/*
 * Middleware final para manejar errores en la aplicación.
 * Captura errores que se envíen con `next(error)` en los controladores
 * y responde con un mensaje de error en formato JSON.
 *
 * @param {Object} err - Objeto de error capturado.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 */
function errorHandler(err, req, res, next) {
  // Log en consola para depuración:
  console.error("❌ Error capturado:", err);

  // Si el error es una lista de errores (como validaciones), responder con código (Bad Request).
  if (Array.isArray(err?.errors)) {
    return res.status(400).json({ errors: err.errors });
  }

  // Errores personalizados (por ejemplo, en autenticación)
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Token inválido" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token expirado" });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "ID inválido en la base de datos" });
  }

  // Manejo de errores generales
  // Determina automáticamente el código HTTP y si no hay agrega el 500
  const statusCode = err.status || 500;

  return res.status(statusCode).json({
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

/*
 * Función que inicializa el servidor Express.
 * Configura middlewares, rutas y maneja errores.
 */
export const initServer = () => {
  const app = express(); // Crea una nueva instancia de Express

  try {
    // 1) Configuramos middlewares globales como Helmet, CORS, Morgan, etc.
    configs(app);

    // 2) Cargamos todas las rutas definidas en `rutas.generales.js`.
    loadRoutes(app);

    // 3) Middleware para manejar rutas no encontradas (404)
    app.use((req, res) => {
      res.status(404).json({ message: "Ruta no encontrada" });
    });

    // 4) Agregamos el middleware de manejo de errores.
    app.use(errorHandler);

    // 5) Definimos el puerto a utilizar, tomando de .env o el valor por defecto 2636.
    const port = process.env.PORT || 2636;

    // 6) (Iniciamos) Levantamos el servidor y mostramos un mensaje en la consola si todo sale bien.
    app.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
    });
  } catch (err) {
    // Captura cualquier error que ocurra al iniciar con el servidor.
    console.error("❌ Server init failed:", err);

    // Forzar la detención del proceso si el servidor no puede arrancar.
    process.exit(1);
  }
};
