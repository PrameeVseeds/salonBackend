export const formatGalleryImage = (image) => ({
    id: image.id,
    title: image.title,
    imageUrl: image.image_url,
    categoryId: image.category_id,
    category: image.category,
    displayOrder: image.display_order,
    isActive: Boolean(image.is_active),
    createdAt: image.created_at,
    updatedAt: image.updated_at,
});
//# sourceMappingURL=galleryMapper.js.map