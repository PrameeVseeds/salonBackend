import type { RowDataPacket } from "mysql2";

export interface EmployeeLeaveRow extends RowDataPacket {
  id: number;
  employee_id: number;
  leave_type: string;
  leave_date: string;
  start_time: string;
  end_time: string;
  reason: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: Date;
}
