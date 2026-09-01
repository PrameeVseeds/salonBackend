export const formatEmployee = (employee) => ({
    id: employee.id,
    firstName: employee.first_name,
    lastName: employee.last_name,
    phone: employee.phone,
    email: employee.email,
    profileImage: employee.profile_image,
    isActive: Boolean(employee.is_active),
    createdAt: employee.created_at,
    updatedAt: employee.updated_at,
});
//# sourceMappingURL=employeeMapper.js.map