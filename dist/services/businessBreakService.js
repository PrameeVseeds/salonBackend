import * as repository from "../repositories/businessBreakRepository.js";
export const createBusinessBreak = (input) => repository.create(input);
export const getBusinessBreaks = (date) => repository.findAll(date);
export const getBusinessBreakById = (id) => repository.findById(id);
export const updateBusinessBreak = async (id, input) => await repository.update(id, input) ? repository.findById(id) : null;
export const deleteBusinessBreak = (id) => repository.remove(id);
//# sourceMappingURL=businessBreakService.js.map