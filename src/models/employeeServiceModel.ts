import { RowDataPacket } from "mysql2";

export interface EmployeeServiceRow extends RowDataPacket {
    id: number;
    employee_id: number;
    service_id: number;
}