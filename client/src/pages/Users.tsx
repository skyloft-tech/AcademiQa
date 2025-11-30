import React, { useState } from "react";
import Sidebar from "@/components/ui/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, UserX, UserCheck } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "Active" | "Inactive";
}

const mockUsers: User[] = [
  {
    id: "U001",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+254 712 345 678",
    status: "Active",
  },
  {
    id: "U002",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+254 798 123 456",
    status: "Inactive",
  },
  {
    id: "U003",
    name: "Alex Mwangi",
    email: "alex.mwangi@ipsos.com",
    phone: "+254 722 900 111",
    status: "Active",
  },
];

export default function Users() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [filter, setFilter] = useState("");

  const filtered = users.filter((u) => {
    const q = filter.toLowerCase().trim();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      u.status.toLowerCase().includes(q)
    );
  });

  const handleEdit = (id: string) => {
    alert(`Edit user ${id} (mock)`);
  };

  const handleDeactivate = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "Inactive" } : u))
    );
  };

  const handleActivate = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "Active" } : u))
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-notusBg">
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 ml-64 p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-notusText">User Management</h1>
            <p className="text-sm text-secondary">
              Manage registered users and their access permissions
            </p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Total Users", value: users.length },
              {
                label: "Active Users",
                value: users.filter((u) => u.status === "Active").length,
              },
              {
                label: "Inactive Users",
                value: users.filter((u) => u.status === "Inactive").length,
              },
              { label: "New This Month", value: 4 },
            ].map((s) => (
              <Card
                key={s.label}
                className="bg-white shadow-md border border-gray-100 rounded-2xl scale-[1.05] hover:scale-[1.07] transition-transform duration-200"
              >
                <CardContent className="p-5 text-center">
                  <div className="text-sm text-gray-600">{s.label}</div>
                  <div className="text-2xl font-semibold text-notusText mt-1">
                    {s.value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filter/Search */}
          <div className="bg-white flex items-center gap-3 mb-3 p-3 rounded-lg">
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search by name, email, phone, or status..."
              className="max-w-xl text-base"
            />
            <div className="text-sm text-gray-500">
              Showing {filtered.length} of {users.length}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-notus shadow-notus border border-gray-100 overflow-x-auto">
            <table className="min-w-full text-base">
              <thead className="bg-gray-50">
                <tr>
                  {["User ID", "Name", "Email", "Phone", "Status", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-3 py-3 font-semibold text-notusText text-sm"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <td className="px-3 py-3 text-sm font-medium text-notusText">
                      {user.id}
                    </td>
                    <td className="px-3 py-3 text-sm">{user.name}</td>
                    <td className="px-3 py-3 text-sm">{user.email}</td>
                    <td className="px-3 py-3 text-sm">{user.phone}</td>
                    <td className="px-3 py-3 text-sm">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          user.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="p-1.5"
                          onClick={() => handleEdit(user.id)}
                        >
                          <Edit className="w-4 h-4 text-blue-500" />
                        </Button>

                        {user.status === "Active" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="p-1.5"
                            onClick={() => handleDeactivate(user.id)}
                          >
                            <UserX className="w-4 h-4 text-yellow-500" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="p-1.5"
                            onClick={() => handleActivate(user.id)}
                          >
                            <UserCheck className="w-4 h-4 text-green-500" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          className="p-1.5"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 pt-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} AcademiQa. All rights reserved.
      </footer>
    </div>
  );
}
