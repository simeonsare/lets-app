import { Outlet } from "react-router";
import { Package, Menu } from "lucide-react";
import { useState } from "react";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Outlet />
    </div>
  );
}
