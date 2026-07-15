import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "6-Feature Game Dataset",
  description: "Authorized dataset download page for the 6-feature game identification project.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
