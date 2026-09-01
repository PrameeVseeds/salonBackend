export const getString = (value) => {
    if (typeof value !== "string") {
        return null;
    }
    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : null;
};
//# sourceMappingURL=validationUtils.js.map