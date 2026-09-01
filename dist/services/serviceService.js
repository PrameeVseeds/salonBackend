import * as serviceRepository from "../repositories/serviceRepository.js";
const normalizeInput = (input) => ({
    ...input,
    name: input.name.trim(),
    description: input.description.trim(),
    image_url: input.image_url.trim(),
});
export const createService = async (input) => {
    const normalizedInput = normalizeInput(input);
    if (await serviceRepository.findServiceByName(normalizedInput.name)) {
        throw new Error("A service with this name already exists.");
    }
    if (normalizedInput.max_concurrent_appointments !== null) {
        throw new Error("Use automatic capacity until employees are assigned to the service.");
    }
    return serviceRepository.createService(normalizedInput);
};
export const getAllServices = () => serviceRepository.findAllServices();
export const getServiceById = (serviceId) => serviceRepository.findServiceById(serviceId);
export const updateServiceById = async (serviceId, input) => {
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
export const updateServiceStatusById = async (serviceId, isActive) => {
    const updated = await serviceRepository.updateServiceStatus(serviceId, isActive);
    return updated ? serviceRepository.findServiceById(serviceId) : null;
};
export const deleteServiceById = async (serviceId) => {
    if (!(await serviceRepository.findServiceById(serviceId))) {
        return false;
    }
    return serviceRepository.deleteService(serviceId);
};
const normalizeSubService = (input) => ({
    ...input, name: input.name.trim(), image_url: input.image_url.trim(),
});
export const createSubService = async (serviceId, input) => {
    if (!(await serviceRepository.findServiceById(serviceId)))
        return null;
    return serviceRepository.createSubService(serviceId, normalizeSubService(input));
};
export const updateSubService = (serviceId, id, input) => serviceRepository.updateSubService(serviceId, id, normalizeSubService(input));
export const deleteSubService = (serviceId, id) => serviceRepository.deleteSubService(serviceId, id);
//# sourceMappingURL=serviceService.js.map