"use client";

import { useEffect, useState } from "react";
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout";
import { UsersHeader } from "@/components/admin/users-header";
import { UsersTable } from "@/components/admin/users-table";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  credit_balance: number;
  role: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        ...(search && { search }),
      });

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch users");
      }

      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Gagal memuat data pengguna");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, offset]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setOffset(0);
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <UsersHeader 
          title="Kelola Pengguna"
          description="Lihat dan kelola semua pengguna yang terdaftar"
          total={total}
          onSearch={handleSearch}
        />
        
        <UsersTable 
          users={users}
          loading={loading}
          onRefresh={fetchUsers}
        />
      </div>
    </AdminDashboardLayout>
  );
}
