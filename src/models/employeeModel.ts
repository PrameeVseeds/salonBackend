import { RowDataPacket } from "mysql2";

export interface EmployeeRow extends RowDataPacket {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    profile_image: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}