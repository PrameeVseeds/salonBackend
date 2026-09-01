export const formatWorkingHours = (hours) => ({
    id: hours.id,
    dayOfWeek: hours.day_of_week,
    openingTime: hours.opening_time,
    closingTime: hours.closing_time,
    isClosed: Boolean(hours.is_closed),
    createdAt: hours.created_at,
    updatedAt: hours.updated_at,
});
//# sourceMappingURL=workingHoursMapper.js.map