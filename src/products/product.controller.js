import Product from "./product.model.js";
import Category from "../categories/category.model.js";

/**
 * Crear un nuevo producto (Solo ADMIN)
 */
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(400).json({ message: "Product already exists" });
    }

    const product = new Product({ name, description, price, stock, category });
    await product.save();

    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    console.error("❌ Error in createProduct:", error);
    res
      .status(500)
      .json({ message: "Error creating product", error: error.message });
  }
};

/**
 * Obtener todos los productos (Público)
 */
export const getProducts = async (req, res) => {
  try {
    // Se puede enviar por el query: ?name=algo&category=<id_categoria>
    const { name, category } = req.query;
    const filter = {};

    if (name) {
      // Búsqueda parcial, case-insensitive
      filter.name = { $regex: name, $options: "i" };
    }

    if (category) {
      // Filtra por el ID de la categoría
      filter.category = category;
    }

    const products = await Product.find(filter).populate("category");
    res.status(200).json({ products });
  } catch (error) {
    console.error("❌ Error in getProducts:", error);
    res
      .status(500)
      .json({ message: "Error retrieving products", error: error.message });
  }
};

/**
 * Obtener un producto por ID (Público)
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("category");
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ product });
  } catch (error) {
    console.error("❌ Error in getProductById:", error);
    res
      .status(500)
      .json({ message: "Error retrieving product", error: error.message });
  }
};

/**
 * Actualizar producto (Solo ADMIN)
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, description, price, stock, category },
      { new: true }
    ).populate("category");

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res
      .status(200)
      .json({ message: "Product updated", product: updatedProduct });
  } catch (error) {
    console.error("❌ Error in updateProduct:", error);
    res
      .status(500)
      .json({ message: "Error updating product", error: error.message });
  }
};

/**
 * Eliminar producto (Solo ADMIN)
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    console.error("❌ Error in deleteProduct:", error);
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
};

/**
 * Obtener productos agotados (Público)
 */
export const getOutOfStockProducts = async (req, res) => {
  try {
    const products = await Product.find({ stock: { $lte: 0 } }).populate(
      "category"
    );
    res.status(200).json({ message: "Out-of-stock products", products });
  } catch (error) {
    console.error("❌ Error in getOutOfStockProducts:", error);
    res.status(500).json({
      message: "Error retrieving out-of-stock products",
      error: error.message,
    });
  }
};

/**
 * Obtener productos más vendidos (Público)
 */
export const getTopSellingProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ salesCount: -1 })
      .limit(10)
      .populate("category");
    res.status(200).json({ message: "Top selling products", products });
  } catch (error) {
    console.error("❌ Error in getTopSellingProducts:", error);
    res.status(500).json({
      message: "Error retrieving top selling products",
      error: error.message,
    });
  }
};

export const agregarProductosPorDefecto = async () => {
  const productosExistentes = await Product.countDocuments();
  if (productosExistentes === 0) {
    const categoriaElectronica = await Category.findOne({
      name: "Electrónica",
    });
    if (!categoriaElectronica) {
      console.error(
        "❌ No se encontró la categoría 'Electrónica'. Asegúrate de agregar categorías antes de los productos."
      );
      return;
    }

    const productosPorDefecto = [
      {
        name: "Smartphone 5G",
        description:
          "Teléfono inteligente con conectividad 5G y cámara de 108MP.",
        price: 799.99,
        stock: 10,
        category: categoriaElectronica._id,
        salesCount: 100,
      },
      {
        name: "Laptop Gamer RTX 4070",
        description: "Laptop de alto rendimiento con tarjeta gráfica RTX 4070.",
        price: 1499.99,
        stock: 0,
        category: categoriaElectronica._id,
        salesCount: 80,
      },
      {
        name: "Auriculares Inalámbricos Noise Cancelling",
        description:
          "Auriculares con cancelación de ruido y sonido envolvente.",
        price: 199.99,
        stock: 20,
        category: categoriaElectronica._id,
        salesCount: 60,
      },
      {
        name: "Smartwatch Deportivo",
        description:
          "Reloj inteligente con monitoreo de salud y GPS integrado.",
        price: 129.99,
        stock: 15,
        category: categoriaElectronica._id,
        salesCount: 90,
      },
      {
        name: "Monitor 4K 32 pulgadas",
        description:
          "Monitor UHD 4K con panel IPS y 144Hz de tasa de refresco.",
        price: 499.99,
        stock: 7,
        category: categoriaElectronica._id,
        salesCount: 50,
      },
      {
        name: "Teclado Mecánico RGB",
        description:
          "Teclado mecánico con iluminación RGB y switches intercambiables.",
        price: 89.99,
        stock: 30,
        category: categoriaElectronica._id,
        salesCount: 70,
      },
      {
        name: "Cámara de Seguridad Inteligente",
        description:
          "Cámara de seguridad con detección de movimiento y visión nocturna.",
        price: 159.99,
        stock: 0,
        category: categoriaElectronica._id,
        salesCount: 40,
      },
      {
        name: "Cargador Inalámbrico Rápido",
        description:
          "Base de carga inalámbrica con tecnología Qi y carga rápida.",
        price: 39.99,
        stock: 50,
        category: categoriaElectronica._id,
        salesCount: 55,
      },
    ];

    try {
      await Product.insertMany(productosPorDefecto);
      console.log("✅ Productos por defecto de Electrónica agregados");
    } catch (error) {
      console.error("❌ Error al agregar productos por defecto: ", error);
    }
  } else {
    console.log(
      "ℹ️ Ya existen productos en la base de datos, no se crearon productos por defecto"
    );
  }
};
