import Invoice from "./invoice.model.js";
import Cart from "../cart/cart.model.js";
import Product from "../products/product.model.js";
import User from "../users/user.model.js";

/**
 * Crear factura a partir del carrito (CLIENT)
 */
export const createInvoice = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let total = 0;
    // Verificar stock y calcular total
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for product ${item.product.name}` });
      }
      total += item.product.price * item.quantity;
    }

    // Preparar items de la factura
    const invoiceItems = cart.items.map(i => ({
      product: i.product._id,
      quantity: i.quantity,
      price: i.product.price
    }));

    const newInvoice = new Invoice({
      user: userId,
      items: invoiceItems,
      total
    });
    await newInvoice.save();

    // Actualizar stock y aumentar salesCount en cada producto
    for (const item of cart.items) {
      const prod = await Product.findById(item.product._id);
      prod.stock -= item.quantity;
      prod.salesCount += item.quantity;
      await prod.save();
    }

    // Vaciar el carrito
    cart.items = [];
    await cart.save();

    // Asociar la factura al usuario
    await User.findByIdAndUpdate(userId, { $push: { invoices: newInvoice._id } });

    res.status(201).json({ message: "Invoice created", invoice: newInvoice });
  } catch (error) {
    console.error("❌ Error in createInvoice:", error);
    res.status(500).json({ message: "Error creating invoice", error: error.message });
  }
};

/**
 * Obtener una factura por ID (ADMIN o dueño)
 */
export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id).populate("items.product", "name price");
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    // Validar que el usuario solicitante sea el dueño o un ADMIN
    if (req.user.role !== "ADMIN_ROLE" && !invoice.user.equals(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }
    res.status(200).json({ invoice });
  } catch (error) {
    console.error("❌ Error in getInvoiceById:", error);
    res.status(500).json({ message: "Error retrieving invoice", error: error.message });
  }
};

/**
 * Obtener todas las facturas (Solo ADMIN)
 */
export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate("items.product", "name price");
    res.status(200).json({ invoices });
  } catch (error) {
    console.error("❌ Error in getAllInvoices:", error);
    res.status(500).json({ message: "Error retrieving invoices", error: error.message });
  }
};

/**
 * Actualizar estado de la factura (Solo ADMIN)
 */
export const updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["CREATED", "PAID", "CANCELLED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const invoice = await Invoice.findByIdAndUpdate(id, { status }, { new: true });
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.status(200).json({ message: "Invoice updated", invoice });
  } catch (error) {
    console.error("❌ Error in updateInvoiceStatus:", error);
    res.status(500).json({ message: "Error updating invoice", error: error.message });
  }
};
