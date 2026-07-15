export type DataFile = {
  id: string;
  name: string;
  envKey: string;
  size: number;
  group: "game_play_raw_video" | "ocr" | "stt" | "checksum";
};

export type DataGroup = {
  id: DataFile["group"];
  label: string;
  description: string;
  files: DataFile[];
};

const rawFiles = [
  ["SHA256SUMS.txt", 3864, "checksum"],
  ["game_play_raw_video.parts", 1258, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0000", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0001", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0002", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0003", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0004", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0005", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0006", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0007", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0008", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0009", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0010", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0011", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0012", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0013", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0014", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0015", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0016", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0017", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0018", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0019", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0020", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0021", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0022", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0023", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0024", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0025", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0026", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0027", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0028", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0029", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0030", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0031", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0032", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0033", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0034", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0035", 10737418240, "game_play_raw_video"],
  ["game_play_raw_video.tar.part-0036", 8204058624, "game_play_raw_video"],
  ["ocr_results.tar", 93323264, "ocr"],
  ["stt_results.tar", 9437184, "stt"],
] as const;

export const dataFiles: DataFile[] = rawFiles.map(([name, size, group]) => ({
  id: name,
  name,
  envKey: toEnvKey(name),
  size,
  group,
}));

export const dataGroups: DataGroup[] = [
  {
    id: "game_play_raw_video",
    label: "game_play_raw_video",
    description: "Split raw gameplay video tar archive and parts manifest",
    files: dataFiles.filter((file) => file.group === "game_play_raw_video"),
  },
  {
    id: "ocr",
    label: "ocr_results.tar",
    description: "OCR result archive",
    files: dataFiles.filter((file) => file.group === "ocr"),
  },
  {
    id: "stt",
    label: "stt_results.tar",
    description: "STT result archive",
    files: dataFiles.filter((file) => file.group === "stt"),
  },
  {
    id: "checksum",
    label: "SHA256SUMS.txt",
    description: "Checksums for verifying downloaded files",
    files: dataFiles.filter((file) => file.group === "checksum"),
  },
];

export function findDataFile(id: string) {
  return dataFiles.find((file) => file.id === id);
}

export function toEnvKey(fileName: string) {
  return `DATA_URL_${fileName
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "")}`;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB", "TB"];
  let size = bytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 1 : 2)} ${units[unitIndex]}`;
}

export function sumBytes(files: Pick<DataFile, "size">[]) {
  return files.reduce((total, file) => total + file.size, 0);
}
