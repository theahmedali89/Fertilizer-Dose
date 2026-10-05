"use client";

import { useState } from "react";
import { SelectField } from "@/components/admin/ui";
import { setUserRole } from "@/server/actions/admin";

type Role = "USER" | "EDITOR" | "ADMIN";

export function RoleSelect({ userId, role }: { userId: string; role: Role }) {
  const [value, setValue] = useState<Role>(role);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="min-w-[140px]">
      <SelectField
        label=""
        name={`role-${userId}`}
        value={value}
        disabled={busy}
        options={[
          { value: "USER", label: "USER" },
          { value: "EDITOR", label: "EDITOR" },
          { value: "ADMIN", label: "ADMIN" },
        ]}
        onChange={async (e) => {
          const next = e.target.value as Role;
          setError("");
          setBusy(true);
          const res = await setUserRole(userId, next);
          setBusy(false);
          if (res.ok) {
            setValue(next);
          } else {
            setError(res.error ?? "Role change failed.");
          }
        }}
      />
      {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>}
    </div>
  );
}
