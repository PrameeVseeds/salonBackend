import type { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";

export type AppointmentQueryExecutor = Pool | PoolConnection;

export interface AppointmentServiceInfo extends RowDataPacket {
  id: number;
  duration_minutes: number;
  price: number;
  is_active: boolean;
}

export interface AppointmentTimeRange extends RowDataPacket {
  start_time: string;
  end_time: string;
}

export interface AppointmentWorkingDay extends RowDataPacket {
  opening_time: string;
  closing_time: string;
  is_closed: boolean;
}

export interface AppointmentScheduleContext {
  service: AppointmentServiceInfo;
  unavailable: boolean;
  workingDay: AppointmentWorkingDay | null;
  blocked: AppointmentTimeRange[];
}

export interface AppointmentSchedulingSettings extends RowDataPacket {
  booking_interval_minutes: number;
  appointment_buffer_minutes: number;
}
