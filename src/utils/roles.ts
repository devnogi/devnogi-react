export const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

const ADMIN_ROLE_SET = new Set<AdminRole>(ADMIN_ROLES);

export function normalizeRole(role?: string | null): string | null {
  if (!role) {
    return null;
  }
  const normalized = role.trim().toUpperCase();
  return normalized.length > 0 ? normalized : null;
}

export function isAdminRole(role?: string | null): boolean {
  const normalized = normalizeRole(role);
  return normalized ? ADMIN_ROLE_SET.has(normalized as AdminRole) : false;
}
