import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "faviconir",
  description: "Generate favicons for your website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
