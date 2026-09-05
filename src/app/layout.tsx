import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "SMART_MECHANIC // BACKEND ALLOCATION HUB",
  description: "First-principles engineering platform for dynamic vehicle telemetry diagnostics and component dispatch.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={cn(
          "min-h-screen bg-zinc-950 font-sans text-zinc-400 antialiased selection:bg-primary selection:text-white",
          inter.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}