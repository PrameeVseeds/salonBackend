import { pool } from "../config/db.js";
const fields = `sc.id, sc.name, sc.description, sc.is_active, sc.created_at, sc.updated_at,
  (SELECT COUNT(*) 
  FROM services s 
  WHERE s.category_id = sc.id) 
  AS service_count`;
export const findAll = async () => {
    const [rows] = await pool.execute(`SELECT ${fields} FROM service_categories sc ORDER BY sc.name`);
    return rows;
};
export const findById = async (id) => {
    const [rows] = await pool.execute(`SELECT ${fields} 
    FROM service_categories sc 
    WHERE sc.id = ? 
    LIMIT 1`, [id]);
    return rows[0] ?? null;
};
export const create = async (input) => {
    const [result] = await pool.execute(`INSERT INTO service_categories (name, description, is_active) 
    VALUES (?, ?, ?)`, [input.name, input.description, input.is_active]);
    return findById(result.insertId);
};
export const update = async (id, input) => {
    const [result] = await pool.execute(`UPDATE service_categories 
    SET name = ?, description = ?, is_active = ? WHERE id = ?`, [input.name, input.description, input.is_active, id]);
    return result.affectedRows ? findById(id) : null;
};
export const remove = async (id) => {
    const [result] = await pool.execute(`DELETE FROM service_categories 
    WHERE id = ?`, [id]);
    return result.affectedRows > 0;
};
//# sourceMappingURL=serviceCategoryRepository.js.map