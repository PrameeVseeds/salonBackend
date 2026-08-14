import type { ResultSetHeader } from "mysql2";
import { pool } from "../config/db.js";
import type { CreateGalleryImageInput, GalleryMetadataInput } from "../interfaces/galleryInterface.js";
import type { GalleryImageRow } from "../models/galleryModel.js";

const fields = "id, title, image_url, category, display_order, is_active, created_at, updated_at";

export const findById = async (id: number): Promise<GalleryImageRow | null> => {
    const [rows] = await pool.execute<GalleryImageRow[]>
    (
        `SELECT ${fields} 
        FROM gallery_images 
        WHERE id = ? LIMIT 1`, [id]);
    return rows[0] ?? null;
};

export const findAll = async (): Promise<GalleryImageRow[]> => {
    const [rows] = await pool.execute<GalleryImageRow[]>
    (
        `SELECT ${fields} 
        FROM gallery_images 
        ORDER BY display_order ASC, created_at DESC`
    );
    return rows;
};

export const create = async (input: CreateGalleryImageInput): Promise<GalleryImageRow | null> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO gallery_images
        (title, image_url, category, display_order, is_active) 
        VALUES (?, ?, ?, ?, ?)`,
        [input.title, input.image_url, input.category, input.display_order, input.is_active],
    );
    return findById(result.insertId);
};

export const update = async (id: number, input: GalleryMetadataInput): Promise<boolean> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE gallery_images 
        SET title = ?, category = ?, display_order = ?, is_active = ? 
        WHERE id = ?`,
        [input.title, input.category, input.display_order, input.is_active, id],
    );
    return result.affectedRows > 0;
};

export const updateStatus = async (id: number, isActive: boolean): Promise<boolean> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE gallery_images 
        SET is_active = ? 
        WHERE id = ?`,
        [isActive, id]
    );
    return result.affectedRows > 0;
};

export const updateImage = async (id: number, imageUrl: string): Promise<boolean> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE gallery_images 
        SET image_url = ? 
        WHERE id = ?`,
        [imageUrl, id]
    );
    return result.affectedRows > 0;
};

export const remove = async (id: number): Promise<boolean> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `DELETE FROM gallery_images 
        WHERE id = ?`,
        [id]
    );
    return result.affectedRows > 0;
};
