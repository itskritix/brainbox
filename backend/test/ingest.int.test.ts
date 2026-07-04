import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { app } from "../src/app.ts";
import { db } from "../src/db/client.ts";
import { issues } from "../src/db/schema/index.ts";
import { getStorage } from "../src/storage/index.ts";
import { LocalStorage } from "../src/storage/local.ts";
import { makeProject, makeUser } from "./helpers.ts";

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2, 3]);

function pngFile() {
  return new File([PNG], "s.png", { type: "image/png" });
}

function payload(projectKey: string) {
  return {
    projectKey,
    region: { x: 1, y: 2, width: 3, height: 4 },
    text: "broken",
    metadata: {
      url: "http://host/app",
      title: "App",
      viewport: { width: 800, height: 600 },
      devicePixelRatio: 1,
      userAgent: "UA",
      language: "en",
      timezone: "UTC",
      consoleErrors: ["e1"],
    },
  };
}

function post(fd: FormData, headers: Record<string, string> = {}) {
  return app.request("/ingest", { method: "POST", body: fd, headers });
}

function form(json: object, screenshot: File | null = pngFile()) {
  const fd = new FormData();
  fd.append("json", JSON.stringify(json));
  if (screenshot) fd.append("screenshot", screenshot);
  return fd;
}

describe("POST /ingest", () => {
  it("stores a screenshot and persists an issue (201)", async () => {
    const user = await makeUser();
    const project = await makeProject(user.id);

    const res = await post(form(payload(project.key)));
    expect(res.status).toBe(201);
    const body = (await res.json()) as { id: string };
    expect(body.id).toBeTruthy();

    const row = (await db.select().from(issues).where(eq(issues.id, body.id)))[0]!;
    expect(row.projectId).toBe(project.id);
    expect(row.text).toBe("broken");
    expect(row.region).toEqual({ x: 1, y: 2, width: 3, height: 4 });

    const storage = getStorage();
    expect(storage).toBeInstanceOf(LocalStorage);
    const bytes = await (storage as LocalStorage).read(row.screenshotKey ?? "");
    expect([...bytes.slice(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47]);
  });

  it("rejects an unknown project key (401)", async () => {
    const res = await post(form(payload("pk_does_not_exist")));
    expect(res.status).toBe(401);
  });

  it("enforces the origin allowlist (403 mismatch, 201 match)", async () => {
    const user = await makeUser();
    const project = await makeProject(user.id, ["https://allowed.example"]);

    const bad = await post(form(payload(project.key)), { origin: "https://evil.example" });
    expect(bad.status).toBe(403);

    const good = await post(form(payload(project.key)), { origin: "https://allowed.example" });
    expect(good.status).toBe(201);
  });

  it("rejects a non-image screenshot (400)", async () => {
    const user = await makeUser();
    const project = await makeProject(user.id);
    const fd = form(payload(project.key), null);
    fd.append("screenshot", new File(["x"], "s.txt", { type: "text/plain" }));
    expect((await post(fd)).status).toBe(400);
  });

  it("rejects a missing json part (400)", async () => {
    const fd = new FormData();
    fd.append("screenshot", pngFile());
    expect((await post(fd)).status).toBe(400);
  });
});
