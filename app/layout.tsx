import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "friend98 // iteration 98",
  description: "we have been through this 98 times.....",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark bg-[#050805]">
      <body className="bg-void text-crt-green antialiased min-h-screen select-none overflow-hidden">
        {/* CRT Scanline & Curved Vignette Overlays */}
        <div className="crt-overlay" aria-hidden="true" />
        <div className="crt-vignette" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
