// src/components/ui/Sidebar.tsx
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  FileBarChart,
  Settings,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";   // ← ADD THIS

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // ← THIS IS THE FIX: role updates in real-time
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const updateRole = () => {
      setRole(localStorage.getItem("role") || "client");
    };

    updateRole(); // initial load
    const interval = setInterval(updateRole, 500); // check every 0.5s

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const adminNavItems = [
    { name: "Dashboard", path: "/admin", icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
    { name: "Tasks", path: "/admin/tasks", icon: <ClipboardCheck className="w-5 h-5 mr-3" /> },
    { name: "Users", path: "/admin/users", icon: <Users className="w-5 h-5 mr-3" /> },
    { name: "Reports", path: "/admin/reports", icon: <FileBarChart className="w-5 h-5 mr-3" /> },
    { name: "Settings", path: "/admin/settings", icon: <Settings className="w-5 h-5 mr-3" /> },
  ];

  const clientNavItems = [
    { name: "Dashboard", path: "/client", icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
    { name: "My Tasks", path: "/client/tasks", icon: <ClipboardCheck className="w-5 h-5 mr-3" /> },
    { name: "Add Task", path: "/client/tasks/add", icon: <FileBarChart className="w-5 h-5 mr-3" /> },
  ];

  const navItems = role === "admin" ? adminNavItems : clientNavItems;

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-notus z-20 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-primary tracking-wide">AcademiQa</h2>
      </div>

      <nav className="flex-1 mt-4 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center px-6 py-3 text-secondary transition-all ${
              location.pathname.startsWith(item.path)
                ? "bg-primary text-white font-medium"
                : "hover:bg-primary hover:text-white"
            }`}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-gray-100">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center text-secondary hover:bg-primary hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}