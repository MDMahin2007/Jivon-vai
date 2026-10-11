import assert from "node:assert/strict";
import { once } from "node:events";
import test, { after, before } from "node:test";
import app from "../app.js";
import { createContactHandler } from "../src/controllers/contact.controller.js";

let server;
let baseUrl;

before(async () => {
    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    if (server) {
        await new Promise((resolve, reject) => {
            server.close((error) => (error ? reject(error) : resolve()));
        });
    }
});

test("starts without a database and exposes a health response", async () => {
    const response = await fetch(baseUrl);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.message, "Contact API is running.");
});

test("keeps portfolio data APIs out of the contact-only backend", async () => {
    const response = await fetch(`${baseUrl}/api/projects`);
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.equal(body.message, "API route not found.");
});

test("allows the local Vite frontend to submit contact messages", async () => {
    const response = await fetch(`${baseUrl}/api/contact/send-email`, {
        method: "OPTIONS",
        headers: {
            Origin: "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    });

    assert.equal(response.status, 204);
    assert.equal(
        response.headers.get("access-control-allow-origin"),
        "http://localhost:5173",
    );
});

test("continues to allow the deployed Vercel frontend", async () => {
    const response = await fetch(`${baseUrl}/api/contact/send-email`, {
        method: "OPTIONS",
        headers: {
            Origin: "https://jivon-vai-five.vercel.app",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    });

    assert.equal(response.status, 204);
    assert.equal(
        response.headers.get("access-control-allow-origin"),
        "https://jivon-vai-five.vercel.app",
    );
});

test("allows the jivon-vai Vercel frontend alias", async () => {
    const response = await fetch(`${baseUrl}/api/contact/send-email`, {
        method: "OPTIONS",
        headers: {
            Origin: "https://jivon-vai.vercel.app",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    });

    assert.equal(response.status, 204);
    assert.equal(
        response.headers.get("access-control-allow-origin"),
        "https://jivon-vai.vercel.app",
    );
});

test("does not grant CORS access to unrelated or deceptive origins", async () => {
    for (const origin of [
        "https://unrelated-project.vercel.app",
        "http://localhost.attacker.example",
    ]) {
        const response = await fetch(`${baseUrl}/api/contact/send-email`, {
            method: "OPTIONS",
            headers: {
                Origin: origin,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        });

        assert.equal(response.headers.get("access-control-allow-origin"), null);
    }
});

test("validates contact messages before trying to send email", async () => {
    const response = await fetch(`${baseUrl}/api/contact/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "A" }),
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.message, "Name must be at least 2 characters.");
});

test("saves a queued email notification without waiting for email delivery", async () => {
    let savedContact;
    let saveOptions;
    let outboxWoken = false;
    const response = {
        statusCode: null,
        body: null,
        status(statusCode) {
            this.statusCode = statusCode;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        },
    };
    const handler = createContactHandler({
        saveMessage: async (contact, options) => {
            savedContact = contact;
            saveOptions = options;
        },
        hasEmailCredentials: () => true,
        wakeEmailOutbox: () => {
            outboxWoken = true;
        },
        logger: { error() {} },
    });

    await handler(
        {
            body: {
                name: "Arman Hosen",
                email: "arman@example.com",
                phone: "+8801882111979",
                message: "I would like to discuss a design project.",
            },
        },
        response,
    );

    assert.equal(savedContact.email, "arman@example.com");
    assert.equal(response.statusCode, 201);
    assert.equal(response.body.success, true);
    assert.equal(response.body.emailNotification, "pending");
    assert.equal(saveOptions.emailConfigured, true);
    assert.equal(outboxWoken, true);
});

test("reports when email notification credentials are missing", async () => {
    let savedContact;
    const response = {
        statusCode: null,
        body: null,
        status(statusCode) {
            this.statusCode = statusCode;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        },
    };
    const handler = createContactHandler({
        saveMessage: async (contact, options) => {
            savedContact = contact;
            assert.equal(options.emailConfigured, false);
        },
        hasEmailCredentials: () => false,
        wakeEmailOutbox: assert.fail,
        logger: { error() {} },
    });

    await handler(
        {
            body: {
                name: "Arman Hosen",
                email: "arman@example.com",
                phone: "+8801882111979",
                message: "I would like to discuss a design project.",
            },
        },
        response,
    );

    assert.equal(savedContact.email, "arman@example.com");
    assert.equal(response.statusCode, 201);
    assert.equal(response.body.success, true);
    assert.equal(response.body.emailNotification, "not_configured");
});