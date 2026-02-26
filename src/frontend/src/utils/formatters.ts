// Convert bigint nanoseconds timestamp to military time HH:MM:SS
export function formatMilitaryTime(nanoseconds: bigint): string {
  const ms = Number(nanoseconds / BigInt(1_000_000));
  const date = new Date(ms);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

// Convert bigint room code to display string
export function formatRoomCode(code: bigint): string {
  return code.toString().padStart(7, "0");
}

// Role badge display
export const ROLE_LABELS: Record<string, string> = {
  analyst: "ANALYST",
  consultant: "CONSULTANT",
  engineer: "ENGINEER",
  client: "CLIENT",
  admin: "ADMIN",
};

export const ROLE_COLORS: Record<string, string> = {
  analyst: "text-primary border-primary/60",
  consultant: "text-secondary border-secondary/60",
  engineer: "text-chart-4 border-chart-4/60",
  client: "text-chart-5 border-chart-5/60",
  admin: "text-destructive border-destructive/60",
};
