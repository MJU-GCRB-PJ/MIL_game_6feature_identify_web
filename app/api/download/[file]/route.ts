import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDataUrl } from "@/lib/data-env";
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
  const url = getDataUrl(fileId);

  if (!dataFile || !url) {
    return NextResponse.json({ error: "Download URL is not configured." }, { status: 404 });
  }

  return NextResponse.redirect(url, { status: 302 });
}
