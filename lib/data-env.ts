import { dataFiles } from "./files";

function parseKeyValueBlob(blob: string | undefined) {
  const values = new Map<string, string>();

  if (!blob) {
    return values;
  }

  for (const line of blob.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    values.set(key, stripQuotes(rawValue.trim()));
  }

  return values;
}

export function getDataUrl(fileId: string) {
  const file = dataFiles.find((item) => item.id === fileId);
  if (!file) {
    return null;
  }

  const blobValues = parseKeyValueBlob(process.env.data_env ?? process.env.DATA_ENV);
  return (
    process.env[file.envKey] ??
    blobValues.get(file.envKey) ??
    blobValues.get(file.name) ??
    null
  );
}

function stripQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
