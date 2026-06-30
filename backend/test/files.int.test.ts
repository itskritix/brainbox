import { describe, expect, it } from "vitest";

import { app } from "../src/app.ts";
import { getStorage } from "../src/storage/index.ts";
import { authCookie, makeProject, makeUser } from "./helpers.ts";

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 9, 9, 9]);

describe("GET /api/files/*", () => {
  it("requires auth (401 without a cookie)", async () => {
    expect((await app.request("/api/files/p/x/s.png")).status).toBe(401);
  });

  it("streams the owner's stored bytes with the right mime", async () => {
    const me = await makeUser();
    const project = await makeProject(me.id);
    const key = `${project.id}/issue/screenshot.png`;
    await getStorage().put(key, PNG, "image/png");

    const res = await app.request(`/api/files/${key}`, {
      headers: { cookie: await authCookie(me.id) },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/png");
    const bytes = new Uint8Array(await res.arrayBuffer());
    expect([...bytes.slice(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47]);
  });

  it("404s a file under another user's project", async () => {
    const me = await makeUser();
    const other = await makeUser();
    const project = await makeProject(other.id);
    const key = `${project.id}/issue/screenshot.png`;
    await getStorage().put(key, PNG, "image/png");

    const res = await app.request(`/api/files/${key}`, {
      headers: { cookie: await authCookie(me.id) },
    });
    expect(res.status).toBe(404);
  });
});
