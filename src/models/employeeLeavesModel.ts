import type { RowDataPacket } from "mysql2";

export interface EmployeeLeaveRow extends RowDataPacket {
  id: number;
  employee_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}
