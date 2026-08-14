import type { RowDataPacket } from "mysql2";
export type HeroMediaType = "Image" | "Video";

export interface ThemeSettingsRow extends RowDataPacket {
  id: number;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  hero_media_type: HeroMediaType;
  hero_media_url: string | null;
  created_at: Date;
  updated_at: Date;
}
