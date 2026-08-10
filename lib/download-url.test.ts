import { describe, expect, it } from "vitest";
import {
  buildObjectKey,
  DownloadConfigurationError,
  getDownloadConfig,
} from "./download-url";

const configuredEnvironment: NodeJS.ProcessEnv = {
  MINIO_ENDPOINT: "https://downloads.example.org",
  MINIO_ACCESS_KEY: "access-key",
  MINIO_SECRET_KEY: "secret-key",
};

describe("getDownloadConfig", () => {
  it("uses the dataset defaults with a public HTTPS endpoint", () => {
    expect(getDownloadConfig(configuredEnvironment)).toMatchObject({
      endpoint: "https://downloads.example.org",
      bucket: "mjudcd-paper-data",
      prefix: "6feature-identify",
      region: "us-east-1",
    });
  });

  it("rejects a private or insecure endpoint", () => {
    expect(() =>
      getDownloadConfig({
        ...configuredEnvironment,
        MINIO_ENDPOINT: "http://192.168.0.41:9000",
      }),
    ).toThrow(DownloadConfigurationError);
  });

  it("requires signing credentials", () => {
    expect(() => getDownloadConfig({ MINIO_ENDPOINT: "https://downloads.example.org" })).toThrow(
      DownloadConfigurationError,
    );
  });
});

describe("buildObjectKey", () => {
  it("keeps object keys within the configured dataset prefix", () => {
    expect(buildObjectKey({ name: "stt_results.tar" })).toBe("6feature-identify/stt_results.tar");
  });
});
