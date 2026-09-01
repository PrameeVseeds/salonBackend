import type { RowDataPacket } from "mysql2";

export interface ServiceCategoryRow extends RowDataPacket {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  service_count: number;
  created_at: Date;
  updated_at: Date;
}
