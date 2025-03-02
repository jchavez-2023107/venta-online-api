import Cart from "./cart.model.js";
import Product from "../products/product.model.js";

/**
 * Obtener o crear el carrito del usuario autenticado
 */
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
      await cart.save();
      cart = await cart.populate("items.product");
    }
    res.status(200).json({ cart });
  } catch (error) {
    console.error("❌ Error in getCart:", error);
    res.status(500).json({ message: "Error retrieving cart", error: error.message });
  }
};

/**
 * Agregar un ítem al carrito
 */
export const addItemToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    // Verifica que el producto exista y esté activo
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(item => item.product.equals(productId));
    if (existingItem) {
      // Actualiza la cantidad
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate("items.product");
    res.status(200).json({ message: "Item added to cart", cart });
  } catch (error) {
    console.error("❌ Error in addItemToCart:", error);
    res.status(500).json({ message: "Error adding item to cart", error: error.message });
  }
};

/**
 * Actualizar la cantidad de un ítem en el carrito
 */
export const updateItemQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(item => item.product.equals(productId));
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Si la cantidad es menor o igual a 0, se elimina el ítem
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    await cart.populate("items.product");
    res.status(200).json({ message: "Cart updated", cart });
  } catch (error) {
    console.error("❌ Error in updateItemQuantity:", error);
    res.status(500).json({ message: "Error updating cart", error: error.message });
  }
};

/**
 * Eliminar un ítem del carrito
 */
export const removeItemFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(item => !item.product.equals(productId));
    await cart.save();
    await cart.populate("items.product");
    res.status(200).json({ message: "Item removed from cart", cart });
  } catch (error) {
    console.error("❌ Error in removeItemFromCart:", error);
    res.status(500).json({ message: "Error removing item from cart", error: error.message });
  }
};

/**
 * Vaciar el carrito por completo
 */
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    cart.items = [];
    await cart.save();
    res.status(200).json({ message: "Cart cleared", cart });
  } catch (error) {
    console.error("❌ Error in clearCart:", error);
    res.status(500).json({ message: "Error clearing cart", error: error.message });
  }
};
