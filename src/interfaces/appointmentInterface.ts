export interface AppointmentRequest {
    employeeId: number | null;
    serviceId: number;
    serviceIds: number[];
    appointmentDate: string;
    startTime: string;
    notes: string | null;
}

export interface AppointmentFilters {
    date?: string;
    employeeId?: number;
    customerId?: number;
    status?: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
    search?: string;
}

export interface AvailabilityQuery {
    date: string;
    serviceId: number;
    serviceIds: number[];
    employeeId: number | null;
}
