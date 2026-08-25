import type {RegisterServiceInput, SaveSubServiceInput, UpdateServiceInput,} from "../interfaces/serviceInterface.js";
import type { ServiceRow } from "../models/serviceModel.js";
import type { SubServiceRow } from "../models/subServiceModel.js";
import * as serviceRepository from "../repositories/serviceRepository.js";

const normalizeInput = <T extends RegisterServiceInput | UpdateServiceInput>(input: T): T => ({
    ...input,
    name: input.name.trim(),
    description: input.description.trim(),
    image_url: input.image_url.trim(),
});

export const createService = async (input: RegisterServiceInput): Promise<ServiceRow | null> => {
    const normalizedInput = normalizeInput(input);

    if (await serviceRepository.findServiceByName(normalizedInput.name)) {
        throw new Error("A service with this name already exists.");
    }

    if (normalizedInput.max_concurrent_appointments !== null) {
        throw new Error("Use automatic capacity until employees are assigned to the service.");
    }

    return serviceRepository.createService(normalizedInput);
};

export const getAllServices = (): Promise<ServiceRow[]> => serviceRepository.findAllServices();

export const getServiceById = (serviceId: number): Promise<ServiceRow | null> =>
    serviceRepository.findServiceById(serviceId);

export const updateServiceById = async (serviceId: number,input: UpdateServiceInput,): Promise<ServiceRow | null> => {
    const normalizedInput = normalizeInput(input);

    if (await serviceRepository.serviceNameExistsForAnotherService(normalizedInput.name, serviceId)) {
        throw new Error("A service with this name already exists.");
    }

    const current = await serviceRepository.findServiceById(serviceId);
    if (normalizedInput.max_concurrent_appointments !== null && normalizedInput.max_concurrent_appointments > Number(current?.assigned_employee_count ?? 0)) {
        throw new Error("Appointment capacity cannot exceed the number of active employees assigned to this service.");
    }

    const updated = await serviceRepository.updateService(serviceId, normalizedInput);
    return updated ? serviceRepository.findServiceById(serviceId) : null;
};

export const updateServiceStatusById = async (serviceId: number,isActive: boolean,): Promise<ServiceRow | null> => {
    const updated = await serviceRepository.updateServiceStatus(serviceId, isActive);
    return updated ? serviceRepository.findServiceById(serviceId) : null;
};

export const deleteServiceById = async (serviceId: number): Promise<boolean> => {
    if (!(await serviceRepository.findServiceById(serviceId))) {
        return false;
    }

    return serviceRepository.deleteService(serviceId);
};

const normalizeSubService = (input: SaveSubServiceInput): SaveSubServiceInput => ({
    ...input, name: input.name.trim(), image_url: input.image_url.trim(),
});

export const createSubService = async (serviceId: number, input: SaveSubServiceInput): Promise<SubServiceRow | null> => {
    if (!(await serviceRepository.findServiceById(serviceId))) return null;
    return serviceRepository.createSubService(serviceId, normalizeSubService(input));
};

export const updateSubService = (serviceId: number, id: number, input: SaveSubServiceInput): Promise<SubServiceRow | null> =>
    serviceRepository.updateSubService(serviceId, id, normalizeSubService(input));

export const deleteSubService = (serviceId: number, id: number): Promise<boolean> =>
    serviceRepository.deleteSubService(serviceId, id);
