//Levantar servidor express (HTTP)

//Modular | + efectiva + legible | trabaja en funciones

"use strict";

//ECModules | ESModules
import express from "express"; //Servidor HTTP
import morgan from "morgan"; //Logs
import helmet from "helmet"; //Seguridad para HTTP
import cors from "cors"; //Acceso al API

//Importamos las rutas de las entidades a trabajar.
import authRoutes from "../src/routes/auth.routes.js";
import productRoutes from "../src/routes/product.routes.js";
import categoryRoutes from "../src/routes/category.routes.js";
import userRoutes from "../src/routes/user.routes.js";
import cartRoutes from "../src/routes/cart.routes.js";
import invoiceRoutes from "../src/routes/invoice.routes.js";
import auditRoutes from "../src/routes/audit.routes.js";

//El dotenv
import dotenv from "dotenv";
import { limiter } from "../middlewares/rate.limit.js";
dotenv.config(); // <-- Asegura que .env se cargue correctamente

//Configuraciones de express metidas en una función
const configs = (app) => {
  app.use(express.json()); //Aceptar y enviar datos en JSON
  app.use(express.urlencoded({ extended: false })); //No encriptar la URL
  app.use(cors()); //Antes que los demás que vienen bajo este. (Políticas de seguridad)
  app.use(helmet()); //Seguridad de express (HTTP)
  app.use(morgan("dev")); //Gestionador de Logs (dev: )
  app.use(limiter);
};

//Cuando tengamos rutas.
// ✅ Carga de rutas
const routes = (app) => {
  app.use("/api/auth", authRoutes); // Registro y login
  app.use("/api/products", productRoutes); // Gestión de productos
  app.use("/api/categories", categoryRoutes); // Gestión de categorías
  app.use("/api/users", userRoutes); // Gestión de usuarios
  app.use("/api/cart", cartRoutes); // Carrito de compras
  app.use("/api/invoices", invoiceRoutes); // Gestión de facturas
  app.use("/api/audit-logs", auditRoutes);
};

//Ejecutamos el servidor
export const initServer = () => {
  //Crear instancia de express
  const app = express(); //Instancia de express
  try {
    //servidor : app.
    configs(app);
    routes(app);
    //puerto en el que corre: 2636.
    app.listen(process.env.PORT);
    //Impresión sobre el puerto en el que corre.
    console.log(`Server running on port ${process.env.PORT}`);
  } catch (err) {
    //Impresión del fallo de inicialización del servidor, impresión del error.
    console.error("Server init failed", err);
    process.exit(1); // Cierra el proceso si hay error
  }
};
