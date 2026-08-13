import type { BusinessBreakRow } from "../../models/businessBreakModel.js";

export const formatBusinessBreak = (businessBreak: BusinessBreakRow) => ({
    id: businessBreak.id,
    breakDate: businessBreak.break_date,
    startTime: businessBreak.start_time,
    endTime: businessBreak.end_time,
    reason: businessBreak.reason,
    createdAt: businessBreak.created_at,
    updatedAt: businessBreak.updated_at,
});
