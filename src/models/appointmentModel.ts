import type { RowDataPacket } from "mysql2";

export interface AppointmentRow extends RowDataPacket {
    id: number;
    customer_id: number;
    employee_id: number | null;
    service_id: number;
    appointment_date: string;
    start_time: string;
    end_time: string;
    total_amount: string | number;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
}
