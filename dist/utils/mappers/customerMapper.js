// Converts database customer rows into API-safe response objects.
export const formatCustomer = (customer) => ({
    id: customer.id,
    firstName: customer.first_name,
    lastName: customer.last_name,
    phone: customer.phone,
    email: customer.email,
    profileImage: customer.profile_image,
    isActive: Boolean(customer.is_active),
    createdAt: customer.created_at,
    updatedAt: customer.updated_at,
});
//# sourceMappingURL=customerMapper.js.map