import { Database } from "lucide-react";
import { getSession } from "@/lib/auth";
import { dataGroups, sumBytes } from "@/lib/files";
import { DownloadClient } from "./ui/download-client";
import { LoginForm } from "./ui/login-form";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    return (
      <main className="auth-shell">
        <section className="auth-panel">
          <div className="brand-mark" aria-hidden="true">
            <Database size={22} />
          </div>
          <h1>6-Feature Game Dataset</h1>
          <p className="muted">Authorization code is required before dataset downloads are shown.</p>
          <LoginForm />
        </section>
      </main>
    );
  }

  const files = dataGroups.flatMap((group) => group.files);

  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <Database size={22} />
          </div>
          <div>
            <h1>6-Feature Game Dataset</h1>
            <p>{files.length} files · {sumBytes(files).toLocaleString()} bytes</p>
          </div>
        </div>
      </header>
      <DownloadClient groups={dataGroups} />
    </main>
  );
}
