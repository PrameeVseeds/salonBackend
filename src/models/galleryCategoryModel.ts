import type { RowDataPacket } from "mysql2";
export interface GalleryCategoryRow extends RowDataPacket {
  id: number;
  name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
