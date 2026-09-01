import * as repository from "../repositories/closedDateRepository.js";
export const createClosedDate = async (input) => {
    if (await repository.findByDate(input.closed_date))
        throw new Error("This date is already closed.");
    return repository.create(input);
};
export const getClosedDates = (date) => repository.findAll(date);
export const getClosedDateById = (id) => repository.findById(id);
export const updateClosedDate = async (id, input) => {
    if (await repository.dateExistsForAnotherRecord(input.closed_date, id))
        throw new Error("This date is already closed.");
    return await repository.update(id, input) ? repository.findById(id) : null;
};
export const deleteClosedDate = (id) => repository.remove(id);
//# sourceMappingURL=closedDateService.js.map