import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const metadata = {
  title: "Smart Mechanic // Gateway Authentication",
  description: "Secure workspace terminal initialization portal.",
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="bg-zinc-950 text-zinc-400 min-h-screen w-full selection:bg-primary selection:text-white antialiased">
      {children}
    </div>
  );
}