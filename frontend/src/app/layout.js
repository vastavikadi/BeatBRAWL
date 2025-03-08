"use client";
import "./globals.css";
// import { SessionProvider } from "next-auth/react";
import { Inter } from "next/font/google";
import { Toaster } from "./components/ui/Toaster";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.className} h-full bg-gradient-to-br from-purple-950 via-gray-900 to-black text-white antialiased`}
      >
          {children}
          <Toaster />
      </body>
    </html>
  );
}