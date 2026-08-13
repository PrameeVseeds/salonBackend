import type { RowDataPacket } from "mysql2";

export interface GalleryImageRow extends RowDataPacket {
    id: number;
    title: string;
    image_url: string;
    category: string | null;
    display_order: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}
