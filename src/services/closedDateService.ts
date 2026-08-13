import type { ClosedDateInput } from "../interfaces/closedDateInterface.js";
import type { ClosedDateRow } from "../models/closedDateModel.js";
import * as repository from "../repositories/closedDateRepository.js";

export const createClosedDate = async (input: ClosedDateInput): Promise<ClosedDateRow | null> => {
    if (await repository.findByDate(input.closed_date)) throw new Error("This date is already closed.");
    return repository.create(input);
};

export const getClosedDates = (date?: string): Promise<ClosedDateRow[]> => repository.findAll(date);

export const getClosedDateById = (id: number): Promise<ClosedDateRow | null> => repository.findById(id);

export const updateClosedDate = async (id: number, input: ClosedDateInput): Promise<ClosedDateRow | null> => {
    if (await repository.dateExistsForAnotherRecord(input.closed_date, id)) throw new Error("This date is already closed.");
    return await repository.update(id, input) ? repository.findById(id) : null;
};

export const deleteClosedDate = (id: number): Promise<boolean> => repository.remove(id);
