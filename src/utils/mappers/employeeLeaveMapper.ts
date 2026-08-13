import type { EmployeeLeaveRow } from "../../models/employeeLeavesModel.js";

export const formatEmployeeLeave = (leave: EmployeeLeaveRow) => ({
    id: leave.id,
    employeeId: leave.employee_id,
    leaveType: leave.leave_type,
    startDate: leave.start_date,
    endDate: leave.end_date,
    startTime: leave.start_time,
    endTime: leave.end_time,
    reason: leave.reason,
    status: leave.status,
});
