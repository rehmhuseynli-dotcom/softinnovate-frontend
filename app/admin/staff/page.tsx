'use client';

import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';

interface StaffMember {
  id: number;
  name: string;
  email: string;
  status: string;
  roles: { id: number; slug: string; name: string }[];
}

interface RoleOption {
  id: number;
  slug: string;
  name: string;
  isProtected: boolean;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.staff.list(), api.staff.roles()])
      .then(([staffRes, rolesRes]) => {
        setStaff(staffRes.data);
        setRoles(rolesRes.data);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Yüklenemedi.'));
  }, []);

  async function toggleRole(member: StaffMember, role: RoleOption) {
    const hasRole = member.roles.some((r) => r.id === role.id);
    const newRoleIds = hasRole
      ? member.roles.filter((r) => r.id !== role.id).map((r) => r.id)
      : [...member.roles.map((r) => r.id), role.id];

    try {
      await api.staff.updateRoles(member.id, newRoleIds);
      setStaff((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, roles: roles.filter((r) => newRoleIds.includes(r.id)) } : m)),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Rol güncellenemedi.');
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-6">
        <span className="font-mono text-[12px] uppercase tracking-widest text-brass">Yönetim Paneli</span>
        <h1 className="font-display text-2xl font-medium text-ink">Personel ve Roller</h1>
      </header>

      {error && <p className="mb-4 text-[13px] text-coral">{error}</p>}

      <div className="space-y-3">
        {staff.map((member) => (
          <div key={member.id} className="rounded-card border border-border bg-bg-surface p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] text-ink">{member.name}</p>
                <p className="text-[12px] text-ink-muted">{member.email}</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {roles.map((role) => {
                const isActive = member.roles.some((r) => r.id === role.id);

                return (
                  <button
                    key={role.id}
                    onClick={() => toggleRole(member, role)}
                    disabled={role.isProtected && !isActive}
                    title={role.isProtected ? 'Owner rolü sadece mevcut bir Owner tarafından atanabilir' : undefined}
                    className={`rounded-full border px-3 py-1.5 text-[12px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      isActive
                        ? 'border-brass bg-brass/10 text-ink'
                        : 'border-border text-ink-muted hover:border-border-strong'
                    }`}
                  >
                    {role.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
