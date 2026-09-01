export const formatEmployeeLeave = (leave) => ({
    id: leave.id,
    employeeId: leave.employee_id,
    leaveType: leave.leave_type,
    leaveDate: leave.leave_date,
    startTime: leave.start_time,
    endTime: leave.end_time,
    reason: leave.reason,
    status: leave.status,
    createdAt: leave.created_at,
});
//# sourceMappingURL=employeeLeaveMapper.js.map