import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveApiBaseUrl, reserveAccess } from "./waitlist.ts";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("resolveApiBaseUrl", () => {
  it("falls back to the prod API when unset", () => {
    expect(resolveApiBaseUrl({})).toBe("https://app.brainbox.sh");
  });

  it("uses the env override and strips trailing slashes", () => {
    expect(resolveApiBaseUrl({ VITE_API_BASE_URL: "http://localhost:8787/" })).toBe(
      "http://localhost:8787",
    );
  });
});

describe("reserveAccess", () => {
  function stubFetch(impl: (url: string, init: RequestInit) => Response) {
    const fetchMock = vi.fn((url: string | URL | Request, init?: RequestInit) =>
      Promise.resolve(impl(String(url), init ?? {})),
    );
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  it("POSTs the email to {base}/waitlist and returns ok on success", async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 201 }));
    const result = await reserveAccess("me@acme.com", {
      VITE_API_BASE_URL: "http://localhost:8787",
    });
    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("http://localhost:8787/waitlist");
    expect(init!.method).toBe("POST");
    expect(JSON.parse(init!.body as string)).toEqual({ email: "me@acme.com" });
  });

  it("does not call fetch for an empty email", async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 201 }));
    const result = await reserveAccess("   ");
    expect(result).toEqual({ ok: false, error: "Please enter your email." });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps a 400 to an invalid-email message", async () => {
    stubFetch(() => new Response(null, { status: 400 }));
    const result = await reserveAccess("bad", {});
    expect(result).toEqual({ ok: false, error: "That email doesn't look right." });
  });

  it("maps a 429 to a rate-limit message", async () => {
    stubFetch(() => new Response(null, { status: 429 }));
    expect(await reserveAccess("me@acme.com", {})).toEqual({
      ok: false,
      error: "Too many attempts. Please try again in a minute.",
    });
  });

  it("returns a friendly error when the request throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("offline"))),
    );
    const result = await reserveAccess("me@acme.com", {});
    expect(result).toEqual({ ok: false, error: "Network error. Please check your connection." });
  });
});
