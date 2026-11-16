import type { Metadata } from "next";
import { Sarabun, Inter } from "next/font/google";
import "./globals.css";

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-thai",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-eng",
  display: "swap",
});

export const metadata: Metadata = {
  title: "แบบประเมินพฤติกรรมการใช้ AI",
  description:
    "แบบประเมินพฤติกรรมการใช้ปัญญาประดิษฐ์ (AI) เพื่อส่งเสริมการเรียนรู้ของนักเรียน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${sarabun.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-bg font-thai text-text antialiased">
        {children}
      </body>
    </html>
  );
}
