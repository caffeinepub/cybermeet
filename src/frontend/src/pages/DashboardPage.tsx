import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetMyRooms,
  useCreateRoom,
  useJoinRoom,
  useGetCallerUserProfile,
} from "../hooks/useQueries";
import { RoleBadge } from "../components/RoleBadge";
import { formatRoomCode } from "../utils/formatters";
import { Loader2, Terminal, Plus, LogIn, LogOut, RefreshCw, Wifi } from "lucide-react";
import { toast } from "sonner";
import type { Profile } from "../backend.d";

interface DashboardPageProps {
  profile: Profile;
}

export function DashboardPage({ profile }: DashboardPageProps) {
  const navigate = useNavigate();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: rooms = [], isLoading: roomsLoading, refetch: refetchRooms } = useGetMyRooms();
  const { mutateAsync: createRoom, isPending: isCreating } = useCreateRoom();
  const { mutateAsync: joinRoom, isPending: isJoining } = useJoinRoom();

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const roomId = await createRoom({ title: newTitle.trim(), description: newDesc.trim() });
      toast.success("SESSION CREATED");
      setNewTitle("");
      setNewDesc("");
      void navigate({ to: "/room/$roomId", params: { roomId: roomId.toString() } });
    } catch {
      toast.error("SESSION CREATION FAILED");
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    try {
      const code = BigInt(joinCode.trim());
      await joinRoom(code);
      toast.success("JOINED SESSION");
      setJoinCode("");
    } catch {
      toast.error("INVALID CODE OR JOIN FAILED");
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen bg-background scanlines flex flex-col">
      {/* Header */}
      <header className="border-b border-primary/20 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" />
            <span
              className="font-mono font-black text-lg tracking-[0.25em] text-neon"
              style={{ textShadow: "0 0 8px oklch(0.85 0.22 145 / 0.5)" }}
            >
              CYBERMEET
            </span>
          </div>

          <div className="h-4 w-px bg-border mx-1" />

          <div className="flex items-center gap-2">
            <Wifi className="h-3 w-3 text-primary animate-pulse" />
            <span className="font-mono text-sm text-foreground">{profile.displayName}</span>
            <RoleBadge role={profile.role} />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => refetchRooms()}
              className="text-muted-foreground hover:text-primary transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="btn-cli-red text-xs px-3 py-1.5"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-6">

          {/* LEFT: My Sessions */}
          <section className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-mono text-xs tracking-widest">$</span>
              <h2 className="font-mono text-sm font-bold text-neon tracking-widest uppercase">
                MY_SESSIONS
              </h2>
              <span className="ml-auto font-mono text-xs text-muted-foreground">
                [{rooms.length} ACTIVE]
              </span>
            </div>

            {roomsLoading ? (
              <div className="panel p-8 flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-mono text-xs">FETCHING SESSIONS...</span>
              </div>
            ) : rooms.length === 0 ? (
              <div className="panel p-8 text-center">
                <p className="font-mono text-xs text-muted-foreground">
                  {"// NO ACTIVE SESSIONS FOUND"}
                </p>
                <p className="font-mono text-xs text-muted-foreground/60 mt-1">
                  {"CREATE OR JOIN A SESSION TO BEGIN"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {rooms.map((room) => (
                  <div
                    key={room.id.toString()}
                    className="panel p-4 hover:border-primary/60 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-muted-foreground">
                            {">"}
                          </span>
                          <h3 className="font-mono text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {room.title}
                          </h3>
                        </div>
                        {room.description && (
                          <p className="font-mono text-xs text-muted-foreground ml-4 mb-2 truncate">
                            {room.description}
                          </p>
                        )}
                        <div className="ml-4 flex items-center gap-3">
                          <span className="font-mono text-xs text-secondary/80">
                            CODE: {formatRoomCode(room.code)}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground/60">
                            [{room.participants.length} PARTICIPANTS]
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          navigate({
                            to: "/room/$roomId",
                            params: { roomId: room.id.toString() },
                          })
                        }
                        className="btn-cli-cyan text-xs px-3 py-1.5 shrink-0"
                      >
                        JOIN_ROOM
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* RIGHT: Initiate + Join panels */}
          <section className="lg:col-span-2 space-y-6">
            {/* Create room */}
            <div className="panel">
              <div className="panel-header">
                <Plus className="h-3 w-3 text-primary" />
                <span className="font-mono text-xs text-muted-foreground tracking-widest">
                  [INITIATE_SESSION]
                </span>
              </div>
              <form onSubmit={handleCreate} className="p-4 space-y-4">
                <div className="space-y-1">
                  <label
                    htmlFor="session-title"
                    className="font-mono text-xs text-muted-foreground tracking-widest"
                  >
                    {"// SESSION_TITLE"}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-primary text-xs font-mono">$</span>
                    <input
                      id="session-title"
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="OPERATION NAME"
                      maxLength={64}
                      className="terminal-input text-xs flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="session-desc"
                    className="font-mono text-xs text-muted-foreground tracking-widest"
                  >
                    {"// SESSION_BRIEF"}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-primary text-xs font-mono">$</span>
                    <input
                      id="session-desc"
                      type="text"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="MISSION DESCRIPTION"
                      maxLength={256}
                      className="terminal-input text-xs flex-1"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isCreating || !newTitle.trim()}
                  className="btn-cli w-full text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      CREATING
                    </span>
                  ) : (
                    "CREATE SESSION"
                  )}
                </button>
              </form>
            </div>

            {/* Join room */}
            <div className="panel-cyan">
              <div className="panel-header-cyan">
                <LogIn className="h-3 w-3 text-secondary" />
                <span className="font-mono text-xs text-secondary/70 tracking-widest">
                  [JOIN_SESSION]
                </span>
              </div>
              <form onSubmit={handleJoin} className="p-4 space-y-4">
                <div className="space-y-1">
                  <label
                    htmlFor="join-code"
                    className="font-mono text-xs text-muted-foreground tracking-widest"
                  >
                    {"// ACCESS_CODE"}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-secondary text-xs font-mono">$</span>
                    <input
                      id="join-code"
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      placeholder="ENTER ROOM CODE"
                      className="terminal-input text-xs flex-1"
                      style={{ borderBottomColor: "oklch(0.82 0.17 200 / 0.4)" }}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isJoining || !joinCode.trim()}
                  className="btn-cli-cyan w-full text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isJoining ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      CONNECTING
                    </span>
                  ) : (
                    "CONNECT"
                  )}
                </button>
              </form>
            </div>

            {/* System info */}
            <div className="panel p-3">
              <div className="space-y-1 font-mono text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>{"OPERATOR:"}</span>
                  <span className="text-primary truncate ml-2">{profile.displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span>{"ACCESS_LEVEL:"}</span>
                  <span className="text-secondary uppercase">{profile.role}</span>
                </div>
                <div className="flex justify-between">
                  <span>{"STATUS:"}</span>
                  <span className="text-primary">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse mr-1" />
                    ONLINE
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{"SESSIONS:"}</span>
                  <span className="text-foreground">{rooms.length}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-border/30 py-3 text-center font-mono text-xs text-muted-foreground">
        {"© 2026. Built with ♥ using "}
        <a
          href="https://caffeine.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary/70 hover:text-primary transition-colors"
        >
          caffeine.ai
        </a>
        {" // CYBERMEET v2.6"}
      </footer>
    </div>
  );
}


