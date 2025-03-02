import authRoutes from "./auth/auth.routes.js";
import userRoutes from "./users/user.routes.js";
import auditRoutes from "./users/audit.routes.js";
import categoryRoutes from "./categories/category.routes.js";
import productsRoutes from "./products/product.routes.js";
import cartRoutes from "./cart/cart.routes.js";
import invoiceRoutes from "./invoices/invoice.routes.js";

/**
 * Función que recibe la app de Express y registra
 * todas las rutas en una sola llamada.
 */
export const rutasGenerales = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/audit", auditRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/products", productsRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/invoices", invoiceRoutes);
};
