import assert from "node:assert/strict";
import { once } from "node:events";
import test, { after, before } from "node:test";
import app from "../app.js";

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