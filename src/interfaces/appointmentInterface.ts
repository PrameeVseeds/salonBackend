export interface AppointmentRequest {
    employeeId: number;
    serviceId: number;
    appointmentDate: string;
    startTime: string;
    notes: string | null;
}

export interface AppointmentFilters {
    date?: string;
    employeeId?: number;
    customerId?: number;
}

export interface AvailabilityQuery {
    date: string;
    serviceId: number;
    employeeId: number;
}
