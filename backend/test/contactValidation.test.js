import assert from "node:assert/strict";
import test from "node:test";
import { validateContactInput } from "../src/utils/contactValidation.js";

const validInput = {
    name: "Arman Hosen",
    email: "arman@example.com",
    phone: "+8801882111979",
    message: "I would like to discuss a design project.",
};

test("accepts a valid contact submission", () => {
    assert.equal(validateContactInput(validInput), null);
});

test("rejects a name shorter than two characters", () => {
    assert.equal(
        validateContactInput({ ...validInput, name: "A" }),
        "Name must be at least 2 characters.",
    );
});

test("rejects malformed email addresses", () => {
    assert.equal(
        validateContactInput({ ...validInput, email: "not-an-email" }),
        "Please provide a valid email address.",
    );
});

test("rejects short phone numbers", () => {
    assert.equal(
        validateContactInput({ ...validInput, phone: "123" }),
        "A valid phone number is required.",
    );
});

test("rejects messages shorter than ten characters", () => {
    assert.equal(
        validateContactInput({ ...validInput, message: "Too short" }),
        "Message must be at least 10 characters.",
    );
});

test("rejects non-string values instead of throwing", () => {
    for (const field of ["name", "email", "phone", "message"]) {
        assert.notEqual(
            validateContactInput({ ...validInput, [field]: 42 }),
            null,
        );
    }
});

test("rejects non-object request bodies", () => {
    for (const input of [null, "not-an-object", [], {}]) {
        assert.notEqual(validateContactInput(input), null);
    }
});