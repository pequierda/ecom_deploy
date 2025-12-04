import pool from "../config/db.js";

/* =======================
   CATEGORIES CRUD
======================= */

// Create category
export const createCategory = async (name, description) => {
  const [result] = await pool.query(
    `INSERT INTO categories (name, description) VALUES (?, ?)`,
    [name, description]
  );
  return result.insertId;
};

// Get all categories
export const getAllCategories = async () => {
  const [rows] = await pool.query(`SELECT * FROM categories ORDER BY name ASC`);
  return rows;
};

// Get single category
export const getCategoryById = async (categoryId) => {
  const [rows] = await pool.query(`SELECT * FROM categories WHERE category_id = ?`, [categoryId]);
  return rows[0];
};

// Update category
export const updateCategory = async (categoryId, name, description) => {
  const [result] = await pool.query(
    `UPDATE categories SET name = ?, description = ? WHERE category_id = ?`,
    [name, description, categoryId]
  );
  return result.affectedRows;
};

// Delete category
export const deleteCategory = async (categoryId) => {
  const [result] = await pool.query(`DELETE FROM categories WHERE category_id = ?`, [categoryId]);
  return result.affectedRows;
};
