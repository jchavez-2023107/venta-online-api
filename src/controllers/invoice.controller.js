import Invoice from "../models/invoice.model.js";
import Cart from "../models/cart.model.js";

/**
 * 📌 Generar una nueva factura (Solo CLIENT)
 */
export const createInvoice = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const invoice = new Invoice({
      user: userId,
      items: cart.items,
      totalAmount,
    });
    await invoice.save();

    await Cart.findOneAndDelete({ user: userId });

    res.status(201).json({ message: "Invoice generated", invoice });
  } catch (error) {
    console.error("❌ Error in createInvoice:", error);
    res
      .status(500)
      .json({ message: "Error generating invoice", error: error.message });
  }
};

/**
 * 📌 Ver historial de compras del usuario autenticado (Solo CLIENT)
 */
export const getUserInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user.id }).populate(
      "items.product"
    );
    res.status(200).json({ invoices });
  } catch (error) {
    console.error("❌ Error in getUserInvoices:", error);
    res
      .status(500)
      .json({ message: "Error retrieving invoices", error: error.message });
  }
};

/**
 * 📌 Obtener todas las facturas del sistema (Solo ADMIN)
 */
export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate("user", "name email");
    res.status(200).json({ invoices });
  } catch (error) {
    console.error("❌ Error in getAllInvoices:", error);
    res
      .status(500)
      .json({ message: "Error retrieving invoices", error: error.message });
  }
};

/**
 * 📌 Obtener una factura específica por ID (Solo ADMIN)
 */
export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id)
      .populate("user", "name email")
      .populate("items.product");
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    res.status(200).json({ invoice });
  } catch (error) {
    console.error("❌ Error in getInvoiceById:", error);
    res
      .status(500)
      .json({ message: "Error retrieving invoice", error: error.message });
  }
};

/**
 * 📌 Eliminar una factura por ID (Solo ADMIN)
 */
export const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedInvoice = await Invoice.findByIdAndDelete(id);
    if (!deletedInvoice)
      return res.status(404).json({ message: "Invoice not found" });

    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("❌ Error in deleteInvoice:", error);
    res
      .status(500)
      .json({ message: "Error deleting invoice", error: error.message });
  }
};

/**
 * 📌 Exportar todas las funciones correctamente (EVITAR DUPLICADOS)
 */
/* export {
  createInvoice,
  getUserInvoices,
  getAllInvoices,
  getInvoiceById,
  //deleteInvoice  ✅ Solo se exporta una vez
}; */
