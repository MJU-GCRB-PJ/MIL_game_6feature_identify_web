import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { DataFile } from "./files";

const DEFAULT_BUCKET = "mjudcd-paper-data";
const DEFAULT_PREFIX = "6feature-identify";
const DEFAULT_REGION = "us-east-1";
const DOWNLOAD_URL_TTL_SECONDS = 60 * 60;

export type DownloadConfig = {
  accessKeyId: string;
  bucket: string;
  endpoint: string;
  prefix: string;
  region: string;
  secretAccessKey: string;
};

export class DownloadConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DownloadConfigurationError";
  }
}

export function getDownloadConfig(env: NodeJS.ProcessEnv = process.env): DownloadConfig {
  const endpoint = parsePublicHttpsEndpoint(required(env, "MINIO_ENDPOINT"));

  return {
    endpoint,
    accessKeyId: required(env, "MINIO_ACCESS_KEY"),
    secretAccessKey: required(env, "MINIO_SECRET_KEY"),
    bucket: optional(env, "MINIO_BUCKET") ?? DEFAULT_BUCKET,
    prefix: optional(env, "MINIO_PREFIX") ?? DEFAULT_PREFIX,
    region: optional(env, "MINIO_REGION") ?? DEFAULT_REGION,
  };
}

export function buildObjectKey(file: Pick<DataFile, "name">, prefix = DEFAULT_PREFIX) {
  return `${prefix.replace(/^\/+|\/+$/g, "")}/${file.name}`;
}

export async function createDownloadUrl(file: DataFile) {
  const config = getDownloadConfig();
  const client = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
  const command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: buildObjectKey(file, config.prefix),
    ResponseContentDisposition: `attachment; filename="${file.name}"`,
  });

  return getSignedUrl(client, command, { expiresIn: DOWNLOAD_URL_TTL_SECONDS });
}

function required(env: NodeJS.ProcessEnv, key: string) {
  const value = optional(env, key);
  if (!value) {
    throw new DownloadConfigurationError(`${key} is not configured.`);
  }

  return value;
}

function optional(env: NodeJS.ProcessEnv, key: string) {
  const value = env[key]?.trim();
  return value || undefined;
}

function parsePublicHttpsEndpoint(value: string) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new DownloadConfigurationError("MINIO_ENDPOINT must be a valid URL.");
  }

  if (url.protocol !== "https:" || isPrivateHost(url.hostname)) {
    throw new DownloadConfigurationError("MINIO_ENDPOINT must use a public HTTPS host.");
  }

  return url.toString().replace(/\/$/, "");
}

function isPrivateHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    host === "::" ||
    host === "::1" ||
    /^fe[89ab]/.test(host)
  ) {
    return true;
  }

  const octets = host.split(".").map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return host.startsWith("fc") || host.startsWith("fd");
  }

  const [first, second] = octets;
  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}
