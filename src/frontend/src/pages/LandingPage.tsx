import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { MatrixRain } from "../components/MatrixRain";
import { Loader2 } from "lucide-react";

const BOOT_SEQUENCE = [
  "INITIALIZING SECURE CHANNEL...",
  "LOADING ENCRYPTION MODULES... [OK]",
  "ESTABLISHING ANONYMIZED TUNNEL... [OK]",
  "VERIFYING NODE INTEGRITY... [OK]",
  "CYBERMEET v2.6 ONLINE",
];

export function LandingPage() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const [bootLines, setBootLines] = useState<string[]>([]);

  const isLoggingIn = loginStatus === "logging-in";

  useEffect(() => {
    if (identity) return;
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < BOOT_SEQUENCE.length) {
        setBootLines((prev) => [...prev, BOOT_SEQUENCE[idx]]);
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 400);
    return () => clearInterval(interval);
  }, [identity]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background scanlines">
      <MatrixRain />

      {/* Overlay gradient */}
      <div className="fixed inset-0 z-10 bg-gradient-to-b from-background/80 via-background/60 to-background/80 pointer-events-none" />

      {/* Main content */}
      <div className="relative z-20 flex flex-col items-center gap-8 px-4 w-full max-w-xl">
        {/* Logo */}
        <div className="text-center">
          <h1
            className="animate-glitch text-5xl md:text-7xl font-mono font-black tracking-[0.3em] text-neon uppercase"
            data-text="CYBERMEET"
            style={{
              textShadow:
                "0 0 20px oklch(0.85 0.22 145 / 0.8), 0 0 60px oklch(0.85 0.22 145 / 0.4)",
            }}
          >
            CYBERMEET
          </h1>

          <p
            className="mt-4 font-mono text-xs md:text-sm tracking-[0.25em] uppercase"
            style={{ color: "oklch(0.82 0.17 200 / 0.8)" }}
          >
            SECURE COMMUNICATIONS FOR CYBER PROFESSIONALS
          </p>
        </div>

        {/* Boot sequence terminal */}
        <div
          className="w-full panel p-4 animate-fade-up"
          style={{ animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards" }}
        >
          <div className="panel-header -mx-4 -mt-4 mb-4">
            <span className="text-xs text-muted-foreground font-mono tracking-widest">
              [SYSTEM_BOOT]
            </span>
            <div className="ml-auto flex gap-1">
              <span className="w-2 h-2 rounded-full bg-destructive" />
              <span className="w-2 h-2 rounded-full" style={{ background: "oklch(0.75 0.2 80)" }} />
              <span className="w-2 h-2 rounded-full bg-primary" />
            </div>
          </div>

          <div className="space-y-1 min-h-[100px]">
            {bootLines.map((line) => (
              <div
                key={line}
                className="font-mono text-xs animate-scan-in"
                style={{
                  color: line.includes("[OK]")
                    ? "oklch(0.85 0.22 145)"
                    : line.includes("CYBERMEET")
                    ? "oklch(0.82 0.17 200)"
                    : "oklch(0.65 0.08 145)",
                }}
              >
                {line.includes("[OK]") ? `$ ${line}` : `> ${line}`}
              </div>
            ))}
            {bootLines.length === BOOT_SEQUENCE.length && (
              <div className="font-mono text-xs text-neon blink-cursor mt-2">
                $ AWAITING AUTHENTICATION
              </div>
            )}
          </div>
        </div>

        {/* Login button */}
        <div
          className="animate-fade-up"
          style={{ animationDelay: "0.6s", opacity: 0, animationFillMode: "forwards" }}
        >
          <button
            type="button"
            onClick={() => login()}
            disabled={isLoggingIn}
            className="btn-cli text-sm md:text-base px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-glow"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                AUTHENTICATING
              </span>
            ) : (
              "AUTHENTICATE"
            )}
          </button>
        </div>

        {/* Status */}
        <p
          className="font-mono text-xs text-muted-foreground animate-fade-up"
          style={{ animationDelay: "0.8s", opacity: 0, animationFillMode: "forwards" }}
        >
          {"POWERED BY INTERNET IDENTITY // ICP BLOCKCHAIN"}
        </p>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 z-20 font-mono text-xs text-muted-foreground">
        {"© 2026. Built with ♥ using "}
        <a
          href="https://caffeine.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary/70 hover:text-primary transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
