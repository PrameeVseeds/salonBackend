import type { ClosedDateRow } from "../../models/closedDateModel.js";

export const formatClosedDate = (closedDate: ClosedDateRow) => ({
    id: closedDate.id,
    closedDate: closedDate.closed_date,
    reason: closedDate.reason,
    createdAt: closedDate.created_at,
    updatedAt: closedDate.updated_at,
});
