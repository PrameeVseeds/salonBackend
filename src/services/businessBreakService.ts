import type { BusinessBreakInput } from "../interfaces/businessBreakInterface.js";
import type { BusinessBreakRow } from "../models/businessBreakModel.js";
import * as repository from "../repositories/businessBreakRepository.js";

export const createBusinessBreak = (input: BusinessBreakInput): Promise<BusinessBreakRow | null> => repository.create(input);

export const getBusinessBreaks = (date?: string): Promise<BusinessBreakRow[]> => repository.findAll(date);

export const getBusinessBreakById = (id: number): Promise<BusinessBreakRow | null> => repository.findById(id);

export const updateBusinessBreak = async (id: number, input: BusinessBreakInput): Promise<BusinessBreakRow | null> =>
    await repository.update(id, input) ? repository.findById(id) : null;

export const deleteBusinessBreak = (id: number): Promise<boolean> => repository.remove(id);
