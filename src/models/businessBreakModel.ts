import type { RowDataPacket } from "mysql2";

export interface BusinessBreakRow extends RowDataPacket {
    id: number;
    break_date: string;
    start_time: string;
    end_time: string;
    reason: string | null;
    created_at: Date;
    updated_at: Date;
}
