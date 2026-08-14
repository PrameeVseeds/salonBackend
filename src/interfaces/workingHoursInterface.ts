export type Weekday = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

export interface WorkingHoursInput {
    day_of_week: Weekday;
    opening_time: string;
    closing_time: string;
    is_closed: boolean;
}
