export interface GalleryMetadataInput {
    title: string;
    category_id: number | null;
    display_order: number;
    is_active: boolean;
}

export interface CreateGalleryImageInput extends GalleryMetadataInput {
    image_url: string;
}
