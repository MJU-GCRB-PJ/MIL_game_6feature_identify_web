import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSession } from "@/lib/auth";
import { createDownloadUrl } from "@/lib/download-url";
import { GET } from "./route";

vi.mock("@/lib/auth", () => ({ getSession: vi.fn() }));
vi.mock("@/lib/download-url", () => ({ createDownloadUrl: vi.fn() }));

const getSessionMock = vi.mocked(getSession);
const createDownloadUrlMock = vi.mocked(createDownloadUrl);

function requestDownload(file: string) {
  return GET(new Request(`https://example.org/api/download/${encodeURIComponent(file)}`), {
    params: Promise.resolve({ file }),
  });
}

describe("GET /api/download/[file]", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getSessionMock.mockResolvedValue({ user: "user1", exp: 2_000_000_000 });
  });

  it("rejects unauthenticated requests", async () => {
    getSessionMock.mockResolvedValue(null);

    expect((await requestDownload("stt_results.tar")).status).toBe(401);
  });

  it("rejects files outside the allow list", async () => {
    expect((await requestDownload("not-a-dataset-file.tar")).status).toBe(404);
    expect(createDownloadUrlMock).not.toHaveBeenCalled();
  });

  it("redirects an authorized request to its signed MinIO URL", async () => {
    createDownloadUrlMock.mockResolvedValue("https://downloads.example.org/signed-object");

    const response = await requestDownload("stt_results.tar");

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://downloads.example.org/signed-object");
  });

  it("does not expose configuration failures", async () => {
    createDownloadUrlMock.mockRejectedValue(new Error("missing credentials"));

    const response = await requestDownload("stt_results.tar");

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "Download service is unavailable." });
  });
});
