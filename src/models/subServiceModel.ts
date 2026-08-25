import type { RowDataPacket } from "mysql2";

export interface SubServiceRow extends RowDataPacket {
  id: number;
  service_id: number;
  name: string;
  duration_minutes: number;
  price: number;
  image_url: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
