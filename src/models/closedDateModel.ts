import type { RowDataPacket } from "mysql2";

export interface ClosedDateRow extends RowDataPacket {
    id: number;
    closed_date: string;
    reason: string | null;
    created_at: Date;
    updated_at: Date;
}
