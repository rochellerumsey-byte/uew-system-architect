import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "System Architect",
  description: "Design, decompose, and document AI-augmented systems."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-uew-cream text-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
