import { ROLE_LABELS, ROLE_COLORS } from "../utils/formatters";

interface RoleBadgeProps {
  role: string;
  className?: string;
}

export function RoleBadge({ role, className = "" }: RoleBadgeProps) {
  const label = ROLE_LABELS[role] ?? role.toUpperCase();
  const colors = ROLE_COLORS[role] ?? "text-muted-foreground border-muted";

  return (
    <span
      className={`inline-block border px-1.5 py-0.5 text-xs font-mono tracking-widest uppercase ${colors} ${className}`}
      style={{ fontSize: "10px" }}
    >
      [{label}]
    </span>
  );
}
