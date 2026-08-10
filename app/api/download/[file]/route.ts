import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createDownloadUrl } from "@/lib/download-url";
import { findDataFile } from "@/lib/files";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { file } = await params;
  const fileId = decodeURIComponent(file);
  const dataFile = findDataFile(fileId);

  if (!dataFile) {
    return NextResponse.json({ error: "Requested file was not found." }, { status: 404 });
  }

  try {
    const url = await createDownloadUrl(dataFile);
    return NextResponse.redirect(url, { status: 302 });
  } catch {
    return NextResponse.json({ error: "Download service is unavailable." }, { status: 503 });
  }
}
