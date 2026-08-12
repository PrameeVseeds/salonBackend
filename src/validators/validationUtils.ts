export type ValidationResult<T> =
    | { isValid: true; data: T }
    | { isValid: false; message: string };

export const getString = (value: unknown): string | null => {
    if (typeof value !== "string") {
        return null;
    }

    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : null;
};
