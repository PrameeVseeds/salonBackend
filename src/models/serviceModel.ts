import { RowDataPacket } from "mysql2";

export interface ServiceRow extends RowDataPacket {
    id: number;
    name: string;
    description: string;
    duration_minutes: number;
    price: number;
    image_url: string;
    is_active: boolean;
    max_concurrent_appointments: number | null;
    assigned_employee_count: number;
    created_at: Date;
    updated_at: Date;
}