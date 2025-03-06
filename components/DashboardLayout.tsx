"use client";

import { SidebarInset } from "@/components/ui/sidebar";
import type React from "react";
import { Header } from "./Header";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <SidebarInset className={`transition-all duration-300`}>
        <div className="flex flex-col flex-1">
          <Header />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </SidebarInset>
    </div>
  );
}
