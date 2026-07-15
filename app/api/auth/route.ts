import { NextResponse } from "next/server";
import { AUTH_COOKIE, authenticateCode, createSession, getConfiguredUsers } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { code?: string } | null;
  const configuredUsers = getConfiguredUsers();

  if (configuredUsers.length === 0) {
    return NextResponse.json(
      { error: "Authorization code is not configured." },
      { status: 503 },
    );
  }

  const user = authenticateCode(body?.code ?? "");
  if (!user) {
    return NextResponse.json({ error: "Authorization code is invalid or expired." }, { status: 401 });
  }

  const session = createSession(user);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, session.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: session.maxAge,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
