import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "faviconir",
  description: "The designer of your icon",
  openGraph: {
    type: 'website',
  },
  // twitter: {
  //   site: '@huozhi',
  //   creator: '@huozhi',
  // }
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
