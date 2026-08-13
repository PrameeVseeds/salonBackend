import type { CreateGalleryImageInput, GalleryMetadataInput } from "../interfaces/galleryInterface.js";
import type { GalleryImageRow } from "../models/galleryModel.js";
import * as repository from "../repositories/galleryRepository.js";

export const createGalleryImage = (input: CreateGalleryImageInput) => repository.create(input);

export const getGalleryImages = () => repository.findAll();

export const getGalleryImage = (id: number) => repository.findById(id);

export const updateGalleryImage = async (id: number, input: GalleryMetadataInput): Promise<GalleryImageRow | null> =>
    await repository.update(id, input) ? repository.findById(id) : null;

export const updateGalleryStatus = async (id: number, status: boolean): Promise<GalleryImageRow | null> =>
    await repository.updateStatus(id, status) ? repository.findById(id) : null;

export const updateGalleryImageFile = async (id: number, imageUrl: string): Promise<GalleryImageRow | null> =>
    await repository.updateImage(id, imageUrl) ? repository.findById(id) : null;

export const deleteGalleryImage = (id: number) => repository.remove(id);
