"use client";

import { useMemo, useState } from "react";
import { Download, LogOut, ShieldCheck, Square, SquareCheckBig } from "lucide-react";
import { useRouter } from "next/navigation";
import type { DataGroup } from "@/lib/files";
import { formatBytes, sumBytes } from "@/lib/files";

type Props = {
  groups: DataGroup[];
};

export function DownloadClient({ groups }: Props) {
  const router = useRouter();
  const allFiles = useMemo(() => groups.flatMap((group) => group.files), [groups]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const selectedFiles = allFiles.filter((file) => selectedIds.has(file.id));
  const selectedBytes = sumBytes(selectedFiles);

  function toggleFile(fileId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(fileId)) {
        next.delete(fileId);
      } else {
        next.add(fileId);
      }
      return next;
    });
  }

  function toggleGroup(group: DataGroup) {
    setSelectedIds((current) => {
      const next = new Set(current);
      const isComplete = group.files.every((file) => next.has(file.id));

      for (const file of group.files) {
        if (isComplete) {
          next.delete(file.id);
        } else {
          next.add(file.id);
        }
      }

      return next;
    });
  }

  function downloadFile(fileId: string) {
    const anchor = document.createElement("a");
    anchor.href = `/api/download/${encodeURIComponent(fileId)}`;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  }

  function downloadSelected() {
    selectedFiles.forEach((file, index) => {
      window.setTimeout(() => downloadFile(file.id), index * 180);
    });
  }

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <section className="download-panel">
        <div className="download-toolbar">
          <div>
            <strong>Dataset files</strong>
            <p className="muted">Select individual files or a complete group.</p>
          </div>
          <div className="toolbar-actions">
            <span className="count-pill">
              {selectedFiles.length} selected · {formatBytes(selectedBytes)}
            </span>
            <button className="ghost-button" type="button" onClick={() => setSelectedIds(new Set())}>
              Clear
            </button>
            <button className="ghost-button" type="button" onClick={() => setSelectedIds(new Set(allFiles.map((file) => file.id)))}>
              Select all
            </button>
            <button
              className="primary-button"
              disabled={selectedFiles.length === 0}
              type="button"
              onClick={downloadSelected}
            >
              <Download size={18} />
              Download selected
            </button>
            <button className="icon-button" type="button" onClick={logout} title="Sign out" aria-label="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="file-list">
          {groups.map((group) => {
            const selectedCount = group.files.filter((file) => selectedIds.has(file.id)).length;
            const groupChecked = selectedCount === group.files.length;
            const groupPartial = selectedCount > 0 && !groupChecked;

            return (
              <div className="group" key={group.id}>
                <div className="row group-row">
                  <input
                    className="checkbox"
                    type="checkbox"
                    checked={groupChecked}
                    ref={(element) => {
                      if (element) {
                        element.indeterminate = groupPartial;
                      }
                    }}
                    onChange={() => toggleGroup(group)}
                    aria-label={`Select ${group.label}`}
                  />
                  <div>
                    <div className="file-name">{group.label}</div>
                    <div className="file-meta">
                      {group.description} · {group.files.length} file{group.files.length === 1 ? "" : "s"} ·{" "}
                      {formatBytes(sumBytes(group.files))}
                    </div>
                  </div>
                  <div className="file-actions">
                    <button className="ghost-button" type="button" onClick={() => toggleGroup(group)}>
                      {groupChecked ? <Square size={17} /> : <SquareCheckBig size={17} />}
                      {groupChecked ? "Deselect group" : "Select group"}
                    </button>
                  </div>
                </div>

                {group.files.map((file) => (
                  <div className="row file-row" key={file.id}>
                    <input
                      className="checkbox"
                      type="checkbox"
                      checked={selectedIds.has(file.id)}
                      onChange={() => toggleFile(file.id)}
                      aria-label={`Select ${file.name}`}
                    />
                    <div>
                      <div className="file-name">{file.name}</div>
                      <div className="file-meta">{formatBytes(file.size)}</div>
                    </div>
                    <div className="file-actions">
                      <button className="icon-button" type="button" onClick={() => downloadFile(file.id)} title="Download" aria-label={`Download ${file.name}`}>
                        <Download size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </section>

      <p className="warning">
        <ShieldCheck size={18} />
        <span>
          Raw URLs are resolved on the server after authorization. For Vercel production, make sure the
          MinIO URL in <code>data_env</code> is reachable from the downloader network.
        </span>
      </p>
    </>
  );
}
