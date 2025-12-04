import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../models/categoryModel.js";

/* =======================
   CATEGORIES CRUD
======================= */

// 📌 Create
export const addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }
    const categoryId = await createCategory(name, description || null);
    res.status(201).json({ message: "Category created", categoryId });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 📌 Read all
export const listCategories = async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 📌 Read one
export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await getCategoryById(id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 📌 Update
export const editCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updated = await updateCategory(id, name, description);
    if (!updated) return res.status(404).json({ message: "Category not found" });

    res.json({ message: "Category updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 📌 Delete
export const removeCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteCategory(id);
    if (!deleted) return res.status(404).json({ message: "Category not found" });

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
