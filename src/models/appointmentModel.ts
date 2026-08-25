import type { RowDataPacket } from "mysql2";

export interface AppointmentRow extends RowDataPacket {
    id: number;
    customer_id: number;
    employee_id: number | null;
    service_id: number;
    appointment_date: string;
    start_time: string;
    end_time: string;
    total_amount: string | number;
    notes: string | null;
    status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
    started_at: Date | null;
    completed_at: Date | null;
    cancelled_at: Date | null;
    cancellation_reason: string | null;
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;
    employee_name?: string | null;
    service_name?: string;
    service_duration_minutes?: number;
    can_start?: number | boolean;
    employee_email?: string | null;
    admin_email?: string;
    services?: Array<{
      serviceId: number;
      subServiceId?: number | null;
      serviceName: string;
      employeeId: number | null;
      employeeName: string | null;
      durationMinutes: number;
      startTime: string;
      endTime: string;
      price: number;
    }>;
    created_at: Date;
    updated_at: Date;
}
