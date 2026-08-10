import { describe, expect, it } from "vitest";
import { getConfiguredUsers } from "./auth";

describe("getConfiguredUsers", () => {
  it("reads individual user environment variables without auth_env", () => {
    const users = getConfiguredUsers({
      user1_auth: '{ code = "download-code" }',
      user1_expire_date: "2030-12-31",
    });

    expect(users).toHaveLength(1);
    expect(users[0]?.user).toBe("user1");
    expect(users[0]?.code).toBe("download-code");
    expect(users[0]?.expiresAt.toISOString()).toBe("2030-12-31T14:59:59.000Z");
  });

  it("allows an individual user value to override auth_env", () => {
    const users = getConfiguredUsers({
      auth_env: 'user1_auth = { code = "old-code" }\nuser1_expire_date = "2030-01-01"',
      user1_auth: '{ code = "new-code" }',
      user1_expire_date: "2030-12-31",
    });

    expect(users[0]?.code).toBe("new-code");
    expect(users[0]?.expiresAt.toISOString()).toBe("2030-12-31T14:59:59.000Z");
  });
});
