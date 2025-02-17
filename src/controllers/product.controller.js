import Product from "../models/product.model.js";

/**
 * 📌 Crear un nuevo producto (Solo ADMIN)
 */
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    const existingProduct = await Product.findOne({ name });
    if (existingProduct) return res.status(400).json({ message: "Product already exists" });

    const product = new Product({ name, description, price, stock, category });
    await product.save();

    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    console.error("❌ Error in createProduct:", error);
    res.status(500).json({ message: "Error creating product", error: error.message });
  }
};

/**
 * 📌 Obtener todos los productos (Público)
 */
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    res.status(200).json({ products });
  } catch (error) {
    console.error("❌ Error in getProducts:", error);
    res.status(500).json({ message: "Error retrieving products", error: error.message });
  }
};

/**
 * 📌 Obtener un producto por ID (Público)
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("category");
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ product });
  } catch (error) {
    console.error("❌ Error in getProductById:", error);
    res.status(500).json({ message: "Error retrieving product", error: error.message });
  }
};

/**
 * 📌 Actualizar producto (Solo ADMIN)
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, description, price, stock, category },
      { new: true }
    );

    res.status(200).json({ message: "Product updated", product: updatedProduct });
  } catch (error) {
    console.error("❌ Error in updateProduct:", error);
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};

/**
 * 📌 Eliminar producto (Solo ADMIN)
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    console.error("❌ Error in deleteProduct:", error);
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};
