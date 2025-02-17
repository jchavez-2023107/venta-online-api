import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

/**
 * 📌 Agregar un producto al carrito
 */
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { $push: { items: { product: productId, quantity } } },
      { new: true, upsert: true }
    ).populate("items.product");

    res.status(200).json({ message: "Product added to cart", cart });
  } catch (error) {
    console.error("❌ Error in addToCart:", error);
    res.status(500).json({ message: "Error adding product to cart", error: error.message });
  }
};

/**
 * 📌 Ver carrito del usuario
 */
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
    if (!cart) return res.status(404).json({ message: "Cart is empty" });

    res.status(200).json({ cart });
  } catch (error) {
    console.error("❌ Error in getCart:", error);
    res.status(500).json({ message: "Error retrieving cart", error: error.message });
  }
};

/**
 * 📌 Vaciar carrito
 */
export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user.id });
    res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    console.error("❌ Error in clearCart:", error);
    res.status(500).json({ message: "Error clearing cart", error: error.message });
  }
};
