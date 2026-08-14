export type EmployeeLeaveStatus = "pending" | "approved" | "rejected";

export interface EmployeeLeaveInput {
    employee_id: number;
    leave_type: string;
    leave_date: string;
    start_time: string;
    end_time: string;
    reason: string | null;
    status: EmployeeLeaveStatus;
}

export type UpdateEmployeeLeaveInput = EmployeeLeaveInput;
