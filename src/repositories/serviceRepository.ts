import type { ResultSetHeader } from "mysql2";
import { pool } from "../config/db.js";
import type {RegisterServiceInput, SaveSubServiceInput, UpdateServiceInput,} from "../interfaces/serviceInterface.js";
import type { ServiceRow } from "../models/serviceModel.js";
import type { SubServiceRow } from "../models/subServiceModel.js";

const serviceSelectFields =
    `services.id, services.name, services.description, services.duration_minutes, services.price,
     services.image_url, services.is_active, services.max_concurrent_appointments,
     services.created_at, services.updated_at,
     (SELECT COUNT(*) 
     FROM employee_services es 
     INNER JOIN employees e ON e.id = es.employee_id
      WHERE es.service_id = services.id 
      AND e.is_active = TRUE) AS assigned_employee_count`;

export const findServiceById = async (serviceId: number): Promise<ServiceRow | null> => {
    const [rows] = await pool.execute<ServiceRow[]>(
        `SELECT ${serviceSelectFields}
         FROM services
         WHERE id = ?
         LIMIT 1`,
        [serviceId],
    );

    if (!rows[0]) return null;
    const subServices = await findAllSubServices();
    return { ...rows[0], sub_services: subServices.filter((item) => item.service_id === rows[0]!.id) } as ServiceRow;
};

export const findAllServices = async (): Promise<ServiceRow[]> => {
    const [rows] = await pool.execute<ServiceRow[]>(
        `SELECT ${serviceSelectFields}
         FROM services
         ORDER BY created_at DESC`,
    );

    const subServices = await findAllSubServices();
    return rows.map((service) => ({
        ...service,
        sub_services: subServices.filter((item) => item.service_id === service.id),
    })) as ServiceRow[];
};

export const findAllSubServices = async (): Promise<SubServiceRow[]> => {
    const [rows] = await pool.execute<SubServiceRow[]>(
        `SELECT id, service_id, name, duration_minutes, price, image_url, is_active, created_at, updated_at
         FROM sub_services ORDER BY service_id, created_at`,
    );
    return rows;
};

export const findSubServiceById = async (id: number): Promise<SubServiceRow | null> => {
    const [rows] = await pool.execute<SubServiceRow[]>(
        `SELECT id, service_id, name, duration_minutes, price, image_url, is_active, created_at, updated_at
         FROM sub_services WHERE id = ? LIMIT 1`, [id],
    );
    return rows[0] ?? null;
};

export const createSubService = async (serviceId: number, input: SaveSubServiceInput): Promise<SubServiceRow | null> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO sub_services (service_id, name, duration_minutes, price, image_url, is_active)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [serviceId, input.name, input.duration_minutes, input.price, input.image_url, input.is_active],
    );
    return findSubServiceById(result.insertId);
};

export const updateSubService = async (serviceId: number, id: number, input: SaveSubServiceInput): Promise<SubServiceRow | null> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE sub_services SET name = ?, duration_minutes = ?, price = ?, image_url = ?, is_active = ?
         WHERE id = ? AND service_id = ?`,
        [input.name, input.duration_minutes, input.price, input.image_url, input.is_active, id, serviceId],
    );
    return result.affectedRows ? findSubServiceById(id) : null;
};

export const deleteSubService = async (serviceId: number, id: number): Promise<boolean> => {
    const [result] = await pool.execute<ResultSetHeader>(
        "DELETE FROM sub_services WHERE id = ? AND service_id = ?", [id, serviceId],
    );
    return result.affectedRows > 0;
};

export const findServiceByName = async (name: string): Promise<ServiceRow | null> => {
    const [rows] = await pool.execute<ServiceRow[]>(
        `SELECT ${serviceSelectFields}
         FROM services
         WHERE LOWER(name) = LOWER(?)
         LIMIT 1`,
        [name],
    );

    return rows[0] ?? null;
};

export const serviceNameExistsForAnotherService = async (name: string,serviceId: number,): Promise<boolean> => {
    const [rows] = await pool.execute<ServiceRow[]>(
        `SELECT id
         FROM services
         WHERE LOWER(name) = LOWER(?) AND id != ?
         LIMIT 1`,
        [name, serviceId],
    );

    return rows.length > 0;
};

export const createService = async (input: RegisterServiceInput): Promise<ServiceRow | null> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO services
            (name, description, duration_minutes, price, image_url, is_active, max_concurrent_appointments)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            input.name,
            input.description,
            input.duration_minutes,
            input.price,
            input.image_url,
            input.is_active,
            input.max_concurrent_appointments,
        ],
    );

    return findServiceById(result.insertId);
};

export const updateService = async (serviceId: number,input: UpdateServiceInput,): Promise<boolean> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE services
         SET name = ?,
             description = ?,
             duration_minutes = ?,
             price = ?,
             image_url = ?,
             is_active = ?,
             max_concurrent_appointments = ?
         WHERE id = ?`,
        [
            input.name,
            input.description,
            input.duration_minutes,
            input.price,
            input.image_url,
            input.is_active,
            input.max_concurrent_appointments,
            serviceId,
        ],
    );

    return result.affectedRows > 0;
};

export const updateServiceStatus = async (serviceId: number,isActive: boolean,): Promise<boolean> => {
    const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE services SET is_active = ? WHERE id = ?`,
        [isActive, serviceId],
    );

    return result.affectedRows > 0;
};

export const deleteService = async (serviceId: number): Promise<boolean> => {
    const [result] = await pool.execute<ResultSetHeader>(
        "DELETE FROM services WHERE id = ?",
        [serviceId],
    );

    return result.affectedRows > 0;
};
