import Category from "./category.model.js";
import Product from "../products/product.model.js";

/**
 * Crear nueva categoría (Solo ADMIN)
 */
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const existingCategory = await Category.findOne({ name });
    if (existingCategory)
      return res.status(400).json({ message: "Category already exists" });

    const category = new Category({ name, description });
    await category.save();

    res.status(201).json({ message: "Category created", category });
  } catch (error) {
    console.error("❌ Error in createCategory:", error);
    res
      .status(500)
      .json({ message: "Error creating category", error: error.message });
  }
};

/**
 * Obtener todas las categorías (público)
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ categories });
  } catch (error) {
    console.error("❌ Error in getCategories:", error);
    res
      .status(500)
      .json({ message: "Error retrieving categories", error: error.message });
  }
};

/**
 * Obtener categoría por ID (público)
 */
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json({ category });
  } catch (error) {
    console.error("❌ Error in getCategoryById:", error);
    res
      .status(500)
      .json({ message: "Error retrieving category", error: error.message });
  }
};

/**
 * Actualizar categoría (Solo ADMIN)
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    );
    if (!updatedCategory)
      return res.status(404).json({ message: "Category not found" });
    res
      .status(200)
      .json({ message: "Category updated", category: updatedCategory });
  } catch (error) {
    console.error("❌ Error in updateCategory:", error);
    res
      .status(500)
      .json({ message: "Error updating category", error: error.message });
  }
};

/**
 * Eliminar categoría (Solo ADMIN)
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    // Buscar categoría 'Default' o la que decidas
    const defaultCategory = await Category.findOne({ name: "Default" });
    if (!defaultCategory) {
      return res.status(400).json({ message: "Default category not found. Please create one." });
    }

    // Actualizar todos los productos de la categoría a eliminar para que queden en la Default
    await Product.updateMany(
      { category: id },
      { category: defaultCategory._id }
    );

    // Eliminar la categoría
    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      message: "Category deleted and products moved to default category",
    });
  } catch (error) {
    console.error("❌ Error in deleteCategory:", error);
    res
      .status(500)
      .json({ message: "Error deleting category", error: error.message });
  }
};

/**
 * Agregar categorías por defecto (con descripción)
 */
export const agregarCategoriasPorDefecto = async () => {
  const categoriasExistentes = await Category.countDocuments();
  if (categoriasExistentes === 0) {
    const categoriasPorDefecto = [
      {
        name: "Default",
        description: "Categoría para guardar productos sin categoría :(",
      },
      {
        name: "Electrónica",
        description: "Categoría para artículos de electrónica",
      },
    ];

    try {
      await Category.insertMany(categoriasPorDefecto);
      console.log("✅ Categorías por defecto agregadas");
    } catch (error) {
      console.error("Error al agregar categorías por defecto: ", error);
    }
  } else {
    console.log(
      "ℹ️ Ya existen categorías en la base de datos, no se crearon categorías por defecto"
    );
  }
};
