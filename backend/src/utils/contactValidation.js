export function validateContactInput(input) {
    const data = input && typeof input === "object" && !Array.isArray(input)
        ? input
        : {};
    const { name, email, phone, message } = data;

    if (typeof name !== "string" || name.trim().length < 2) {
        return "Name must be at least 2 characters.";
    }
    if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
        return "Please provide a valid email address.";
    }
    if (typeof phone !== "string" || phone.trim().length < 5) {
        return "A valid phone number is required.";
    }
    if (typeof message !== "string" || message.trim().length < 10) {
        return "Message must be at least 10 characters.";
    }

    return null;
}