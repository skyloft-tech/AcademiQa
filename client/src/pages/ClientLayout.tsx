// src/components/layout/ClientLayout.tsx
import { ReactNode } from "react";
import Sidebar from "@/components/ui/Sidebar";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="min-h-screen flex bg-notusBg">
      <Sidebar />
      <main className="flex-1 ml-64 p-6 flex flex-col">
        {children}
      </main>
    </div>
  );
}
