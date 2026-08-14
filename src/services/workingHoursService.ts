import type { WorkingHoursInput } from "../interfaces/workingHoursInterface.js";
import type { BusinessHoursRow } from "../models/businessHoursModel.js";
import * as repository from "../repositories/workingHoursRepository.js";

export const createWorkingHours = async (input: WorkingHoursInput): Promise<BusinessHoursRow | null> => {
    if (await repository.findByDay(input.day_of_week)) throw new Error("Working hours for this day already exist.");
    return repository.create(input);
};

export const getWorkingHours = (): Promise<BusinessHoursRow[]> => repository.findAll();

export const getWorkingHoursById = (id: number): Promise<BusinessHoursRow | null> => repository.findById(id);

export const updateWorkingHours = async (id: number, input: WorkingHoursInput): Promise<BusinessHoursRow | null> => {
    if (await repository.dayExistsForAnotherRecord(input.day_of_week, id)) throw new Error("Working hours for this day already exist.");
    return await repository.update(id, input) ? repository.findById(id) : null;
};

export const updateWorkingHoursStatus = async (id: number, isClosed: boolean): Promise<BusinessHoursRow | null> =>
    await repository.updateStatus(id, isClosed) ? repository.findById(id) : null;
