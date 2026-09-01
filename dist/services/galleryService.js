import * as repository from "../repositories/galleryRepository.js";
export const createGalleryImage = (input) => repository.create(input);
export const getGalleryImages = () => repository.findAll();
export const getGalleryImage = (id) => repository.findById(id);
export const updateGalleryImage = async (id, input) => await repository.update(id, input) ? repository.findById(id) : null;
export const updateGalleryStatus = async (id, status) => await repository.updateStatus(id, status) ? repository.findById(id) : null;
export const updateGalleryImageFile = async (id, imageUrl) => await repository.updateImage(id, imageUrl) ? repository.findById(id) : null;
export const deleteGalleryImage = (id) => repository.remove(id);
//# sourceMappingURL=galleryService.js.map