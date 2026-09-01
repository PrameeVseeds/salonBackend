import { pool } from "../config/db.js";
const fields = "id, name, is_active, created_at, updated_at";
export const findAll = async () => {
    const [rows] = await pool.execute(`SELECT ${fields} FROM gallery_categories ORDER BY name`);
    return rows;
};
export const findById = async (id) => {
    const [rows] = await pool.execute(`SELECT ${fields} FROM gallery_categories WHERE id = ? LIMIT 1`, [id]);
    return rows[0] ?? null;
};
export const create = async (input) => {
    const [result] = await pool.execute("INSERT INTO gallery_categories (name,is_active) VALUES (?,?)", [input.name, input.is_active]);
    return findById(result.insertId);
};
export const update = async (id, input) => {
    const [result] = await pool.execute("UPDATE gallery_categories SET name=?,is_active=? WHERE id=?", [input.name, input.is_active, id]);
    return result.affectedRows > 0 ? findById(id) : null;
};
export const remove = async (id) => {
    const [result] = await pool.execute("DELETE FROM gallery_categories WHERE id=?", [id]);
    return result.affectedRows > 0;
};
//# sourceMappingURL=galleryCategoryRepository.js.map