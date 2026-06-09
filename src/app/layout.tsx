import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cursor Agent",
  description: "Cursor Agent Window Web 版",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
