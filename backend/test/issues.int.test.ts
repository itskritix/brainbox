import { describe, expect, it } from "vitest";

import { app } from "../src/app.ts";
import { authCookie, makeIssue, makeProject, makeUser } from "./helpers.ts";

describe("GET /api/issues/:id", () => {
  it("requires auth (401 without a cookie)", async () => {
    expect((await app.request("/api/issues/whatever")).status).toBe(401);
  });

  it("returns the owner's issue with a presigned screenshot url", async () => {
    const me = await makeUser();
    const project = await makeProject(me.id);
    const issue = await makeIssue(project.id);

    const res = await app.request(`/api/issues/${issue.id}`, {
      headers: { cookie: await authCookie(me.id) },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { id: string; screenshot: { url: string } };
    expect(body.id).toBe(issue.id);
    expect(body.screenshot.url).toContain("/api/files/");
  });

  it("404s an issue under another user's project", async () => {
    const me = await makeUser();
    const other = await makeUser();
    const project = await makeProject(other.id);
    const issue = await makeIssue(project.id);

    const res = await app.request(`/api/issues/${issue.id}`, {
      headers: { cookie: await authCookie(me.id) },
    });
    expect(res.status).toBe(404);
  });
});
