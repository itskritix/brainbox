import { beforeEach, describe, expect, it, vi } from "vitest";

const signOut = vi.hoisted(() => vi.fn(async () => undefined));
vi.mock("@hono/auth-js/react", () => ({ signOut }));

import { logout } from "./logout.ts";
import { LAST_PROJECT_KEY } from "./useProject.ts";

describe("logout", () => {
  beforeEach(() => {
    signOut.mockClear();
    localStorage.clear();
  });

  it("clears the remembered project so it can't follow the next account in", async () => {
    localStorage.setItem(LAST_PROJECT_KEY, "project-from-account-a");

    await logout();

    expect(localStorage.getItem(LAST_PROJECT_KEY)).toBeNull();
  });

  it("sends the user to /login rather than back through a protected route", async () => {
    await logout();

    expect(signOut).toHaveBeenCalledWith({
      callbackUrl: `${window.location.origin}/login`,
    });
  });

  it("still signs out when localStorage throws (private mode)", async () => {
    const removeItem = vi
      .spyOn(Storage.prototype, "removeItem")
      .mockImplementation(() => {
        throw new Error("storage disabled");
      });

    await expect(logout()).resolves.toBeUndefined();
    expect(signOut).toHaveBeenCalled();

    removeItem.mockRestore();
  });
});
