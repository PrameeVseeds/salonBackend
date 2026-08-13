export type EmployeeLeaveStatus = "pending" | "approved" | "rejected";

export interface EmployeeLeaveInput {
    employee_id: number;
    leave_type: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    reason: string;
    status: EmployeeLeaveStatus;
}

export type UpdateEmployeeLeaveInput = EmployeeLeaveInput;
