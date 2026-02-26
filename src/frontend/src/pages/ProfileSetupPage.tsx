import { useState } from "react";
import { UserRole } from "../backend.d";
import { useSaveCallerUserProfile } from "../hooks/useQueries";
import { Loader2, Shield } from "lucide-react";
import { toast } from "sonner";

const ROLE_OPTIONS: { value: UserRole; label: string; desc: string }[] = [
  { value: UserRole.analyst, label: "ANALYST", desc: "Threat analysis & intelligence" },
  { value: UserRole.consultant, label: "CONSULTANT", desc: "Security advisory services" },
  { value: UserRole.engineer, label: "ENGINEER", desc: "Systems & infrastructure security" },
  { value: UserRole.client, label: "CLIENT", desc: "Receiving security services" },
  { value: UserRole.admin, label: "ADMIN", desc: "Platform administration" },
];

interface ProfileSetupPageProps {
  onComplete: () => void;
}

export function ProfileSetupPage({ onComplete }: ProfileSetupPageProps) {
  const [displayName, setDisplayName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { mutateAsync: saveProfile, isPending } = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !selectedRole) return;

    try {
      await saveProfile({ displayName: displayName.trim(), role: selectedRole });
      toast.success("PROFILE INITIALIZED");
      onComplete();
    } catch {
      toast.error("PROFILE SAVE FAILED");
    }
  };

  return (
    <div className="min-h-screen bg-background scanlines flex flex-col items-center justify-center px-4">
      {/* Ambient glow */}
      <div
        className="fixed top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none opacity-10"
        style={{ background: "radial-gradient(circle, oklch(0.85 0.22 145), transparent 70%)" }}
      />

      <div className="relative z-10 w-full max-w-lg animate-fade-up">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-5 w-5 text-primary" />
          <h1
            className="font-mono text-xl font-bold tracking-widest text-neon uppercase"
            style={{ textShadow: "0 0 10px oklch(0.85 0.22 145 / 0.5)" }}
          >
            PROFILE_INIT
          </h1>
          <span className="text-muted-foreground text-xs animate-blink">▮</span>
        </div>

        {/* Terminal form */}
        <div className="panel">
          <div className="panel-header">
            <span className="text-xs font-mono text-muted-foreground tracking-widest">
              [NEW_OPERATOR_REGISTRATION]
            </span>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Display name */}
            <div className="space-y-2">
              <label
                htmlFor="display-name"
                className="block font-mono text-xs text-muted-foreground tracking-widest uppercase"
              >
                {"// OPERATOR DESIGNATION"}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-primary font-mono text-sm">$</span>
                <input
                  id="display-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="ENTER DISPLAY NAME"
                  maxLength={32}
                  className="terminal-input flex-1 text-sm"
                />
              </div>
            </div>

            {/* Role selection */}
            <fieldset className="space-y-3">
              <legend className="block font-mono text-xs text-muted-foreground tracking-widest uppercase">
                {"// SELECT ACCESS LEVEL"}
              </legend>
              <div className="grid gap-2">
                {ROLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedRole(opt.value)}
                    className={`w-full text-left p-3 border font-mono text-xs transition-all ${
                      selectedRole === opt.value
                        ? "border-primary bg-primary/10 text-primary glow-green"
                        : "border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-bold tracking-widest ${
                          selectedRole === opt.value ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {selectedRole === opt.value ? "▶" : "▷"} [{opt.label}]
                      </span>
                      <span className="text-muted-foreground">{opt.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending || !displayName.trim() || !selectedRole}
              className="btn-cli w-full text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  INITIALIZING
                </span>
              ) : (
                "INITIALIZE PROFILE"
              )}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center font-mono text-xs text-muted-foreground">
          {"IDENTITY SECURED VIA ICP BLOCKCHAIN"}
        </p>
      </div>
    </div>
  );
}
