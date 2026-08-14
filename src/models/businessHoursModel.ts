import { RowDataPacket } from "mysql2";

export interface  BusinessHoursRow extends RowDataPacket {
    id: number;
    day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    opening_time: string;
    closing_time: string;
    is_closed: boolean;
    created_at: Date;
    updated_at: Date;
}
