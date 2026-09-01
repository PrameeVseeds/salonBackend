import * as repository from "../repositories/serviceCategoryRepository.js";
import { sendBadRequest } from "../utils/responseHelper.js";
import { validateServiceCategory, validateServiceCategoryId } from "../validators/serviceCategoryValidator.js";
const format = (row) => row && ({
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    isActive: Boolean(row.is_active),
    serviceCount: Number(row.service_count ?? 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});
export const getAll = async (_req, res) => {
    try {
        res.json({
            success: true,
            data: {
                categories: (await repository.findAll()).map(format)
            }
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve service categories."
        });
    }
};
export const create = async (req, res) => {
    const validation = validateServiceCategory(req.body ?? {});
    if (!validation.isValid)
        return sendBadRequest(res, validation.message);
    try {
        res.status(201).json({
            success: true,
            message: "Service category created successfully.",
            data: { category: format(await repository.create(validation.data)) }
        });
    }
    catch (error) {
        const duplicate = error instanceof Error && "code" in error && error.code === "ER_DUP_ENTRY";
        res.status(duplicate ? 409 : 500).json({
            success: false,
            message: duplicate ? "Service category already exists." : "Failed to create service category."
        });
    }
};
export const update = async (req, res) => {
    const id = validateServiceCategoryId(req.params.id);
    const body = validateServiceCategory(req.body ?? {});
    if (!id.isValid)
        return sendBadRequest(res, id.message);
    if (!body.isValid)
        return sendBadRequest(res, body.message);
    try {
        const category = await repository.update(id.data, body.data);
        if (!category) {
            res.status(404).json({ success: false, message: "Service category not found." });
            return;
        }
        res.json({
            success: true,
            message: "Service category updated successfully.",
            data: { category: format(category) }
        });
    }
    catch (error) {
        const duplicate = error instanceof Error && "code" in error && error.code === "ER_DUP_ENTRY";
        res.status(duplicate ? 409 : 500).json({
            success: false,
            message: duplicate ? "Service category already exists." : "Failed to update service category."
        });
    }
};
export const remove = async (req, res) => {
    const id = validateServiceCategoryId(req.params.id);
    if (!id.isValid)
        return sendBadRequest(res, id.message);
    try {
        const category = await repository.findById(id.data);
        if (!category) {
            res.status(404).json({
                success: false,
                message: "Service category not found."
            });
            return;
        }
        if (Number(category.service_count) > 0) {
            res.status(409).json({
                success: false,
                message: "Move or delete the services in this category before deleting it."
            });
            return;
        }
        await repository.remove(id.data);
        res.json({
            success: true,
            message: "Service category deleted successfully."
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to delete service category."
        });
    }
};
//# sourceMappingURL=serviceCategoryController.js.map