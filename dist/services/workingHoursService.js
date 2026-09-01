import * as repository from "../repositories/workingHoursRepository.js";
export const createWorkingHours = async (input) => {
    if (await repository.findByDay(input.day_of_week))
        throw new Error("Working hours for this day already exist.");
    return repository.create(input);
};
export const getWorkingHours = () => repository.findAll();
export const getWorkingHoursById = (id) => repository.findById(id);
export const updateWorkingHours = async (id, input) => {
    if (await repository.dayExistsForAnotherRecord(input.day_of_week, id))
        throw new Error("Working hours for this day already exist.");
    return await repository.update(id, input) ? repository.findById(id) : null;
};
export const updateWorkingHoursStatus = async (id, isClosed) => await repository.updateStatus(id, isClosed) ? repository.findById(id) : null;
//# sourceMappingURL=workingHoursService.js.map