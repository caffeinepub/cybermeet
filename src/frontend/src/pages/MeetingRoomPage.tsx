import { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  useGetMessages,
  useSendMessage,
  useGetRoomParticipants,
  useGetNote,
  useSaveNote,
  useLeaveRoom,
} from "../hooks/useQueries";
import { RoleBadge } from "../components/RoleBadge";
import { formatMilitaryTime, formatRoomCode } from "../utils/formatters";
import { Loader2, Terminal, Users, MessageSquare, FileText, Send, Save, LogOut } from "lucide-react";
import { toast } from "sonner";
import type { Profile } from "../backend.d";

interface MeetingRoomPageProps {
  roomId: bigint;
  roomTitle: string;
  roomCode: bigint;
  profile: Profile;
}

export function MeetingRoomPage({ roomId, roomTitle, roomCode, profile }: MeetingRoomPageProps) {
  const navigate = useNavigate();
  const [messageInput, setMessageInput] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading: messagesLoading } = useGetMessages(roomId);
  const { data: participants = [], isLoading: participantsLoading } = useGetRoomParticipants(roomId);
  const { data: savedNote = "" } = useGetNote(roomId);
  const { mutateAsync: sendMessage, isPending: isSending } = useSendMessage();
  const { mutateAsync: saveNote, isPending: isSavingNote } = useSaveNote();
  const { mutateAsync: leaveRoom, isPending: isLeaving } = useLeaveRoom();

  // Initialize note from backend
  useEffect(() => {
    if (savedNote) {
      setNoteContent(savedNote);
    }
  }, [savedNote]);

  // Auto-scroll chat to bottom on every render (intentional)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    try {
      await sendMessage({ roomId, content: messageInput.trim() });
      setMessageInput("");
    } catch {
      toast.error("TRANSMISSION FAILED");
    }
  };

  const handleSaveNote = async () => {
    try {
      await saveNote({ roomId, note: noteContent });
      setNoteSaved(true);
      toast.success("NOTE ENCRYPTED & SAVED");
      setTimeout(() => setNoteSaved(false), 2000);
    } catch {
      toast.error("NOTE SAVE FAILED");
    }
  };

  const handleLeave = async () => {
    try {
      await leaveRoom(roomId);
      toast.success("SESSION TERMINATED");
      void navigate({ to: "/" });
    } catch {
      toast.error("LEAVE FAILED");
    }
  };

  // Build a participant lookup map
  const participantMap = new Map(
    participants.map(([principal, prof]) => [principal.toString(), prof])
  );

  return (
    <div className="min-h-screen bg-background scanlines flex flex-col">
      {/* Top bar */}
      <header className="border-b border-primary/20 bg-card/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-4 py-2 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" />
            <span className="font-mono font-black text-sm tracking-[0.25em] text-neon">
              CYBERMEET
            </span>
          </div>

          <div className="h-4 w-px bg-border mx-1" />

          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-sm text-foreground font-bold truncate">
              {roomTitle}
            </span>
            <span className="font-mono text-xs shrink-0" style={{ color: "oklch(0.82 0.17 200)" }}>
              CODE: {formatRoomCode(roomCode)}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground hidden sm:block">
              {profile.displayName}
            </span>
            <RoleBadge role={profile.role} />
            <button
              type="button"
              onClick={handleLeave}
              disabled={isLeaving}
              className="btn-cli-red text-xs px-3 py-1.5 ml-2"
            >
              {isLeaving ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <LogOut className="h-3 w-3 inline mr-1" />
                  LEAVE_ROOM
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main 3-column layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[220px_1fr_240px] gap-0 min-h-0">

        {/* LEFT: Participants */}
        <aside className="border-r border-primary/20 flex flex-col">
          <div className="panel-header">
            <Users className="h-3 w-3 text-primary" />
            <span className="font-mono text-xs text-muted-foreground tracking-widest">
              [PARTICIPANTS]
            </span>
            <span className="ml-auto font-mono text-xs text-muted-foreground">
              {participants.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {participantsLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-4">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="font-mono text-xs">SCANNING...</span>
              </div>
            ) : participants.length === 0 ? (
              <p className="font-mono text-xs text-muted-foreground">{"// NO PARTICIPANTS"}</p>
            ) : (
              participants.map(([principal, p]) => (
                <div
                  key={principal.toString()}
                  className="border border-border/40 p-2 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-1 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                    <span className="font-mono text-xs text-foreground truncate">{p.displayName}</span>
                  </div>
                  <RoleBadge role={p.role} className="ml-2.5" />
                </div>
              ))
            )}
          </div>
        </aside>

        {/* CENTER: Chat */}
        <section className="flex flex-col border-r border-primary/20 min-h-0">
          <div className="panel-header">
            <MessageSquare className="h-3 w-3 text-primary" />
            <span className="font-mono text-xs text-muted-foreground tracking-widest">
              [SECURE_CHANNEL]
            </span>
            <span className="ml-auto font-mono text-xs text-primary/60 animate-pulse">
              ● LIVE
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0" style={{ minHeight: "300px" }}>
            {messagesLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-mono text-xs">DECRYPTING CHANNEL...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <p className="font-mono text-xs text-muted-foreground">
                  {"// CHANNEL EMPTY — INITIATE COMMS"}
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const senderProfile = participantMap.get(msg.sender.toString());
                const isMe = false; // We compare sender but profile match is best-effort
                return (
                  <div
                    key={`msg-${idx}-${msg.timestamp.toString()}`}
                    className="group"
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs text-muted-foreground/60">
                        {formatMilitaryTime(msg.timestamp)}
                      </span>
                      <span className="font-mono text-xs font-bold text-primary">
                        {senderProfile?.displayName ?? msg.sender.toString().slice(0, 12) + "..."}
                      </span>
                      {senderProfile && (
                        <RoleBadge role={senderProfile.role} />
                      )}
                    </div>
                    <div className="ml-4 pl-2 border-l border-primary/20">
                      <p className="font-mono text-xs text-foreground/90 leading-relaxed break-words">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <div className="border-t border-primary/20 p-3">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <span className="text-primary font-mono text-sm shrink-0">{">_"}</span>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="ENTER MESSAGE..."
                className="terminal-input flex-1 text-xs"
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={isSending || !messageInput.trim()}
                className="btn-cli text-xs px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {isSending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
              </button>
            </form>
          </div>
        </section>

        {/* RIGHT: Notes */}
        <aside className="flex flex-col">
          <div className="panel-header">
            <FileText className="h-3 w-3 text-secondary" />
            <span className="font-mono text-xs text-secondary/70 tracking-widest">
              [PERSONAL_NOTES]
            </span>
          </div>

          <div className="flex-1 flex flex-col p-3 gap-3">
            <p className="font-mono text-xs text-muted-foreground/60">
              {"// ENCRYPTED TO CALLER ONLY"}
            </p>

            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="> ENTER INTEL, OBSERVATIONS, NOTES..."
              className="flex-1 bg-transparent border border-secondary/20 p-3 font-mono text-xs text-foreground resize-none outline-none focus:border-secondary/50 transition-colors leading-relaxed placeholder:text-muted-foreground/40"
              style={{ minHeight: "300px" }}
            />

            <button
              type="button"
              onClick={handleSaveNote}
              disabled={isSavingNote}
              className={`btn-cli-cyan text-xs ${noteSaved ? "border-primary text-primary" : ""}`}
            >
              {isSavingNote ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  ENCRYPTING
                </span>
              ) : noteSaved ? (
                <span className="flex items-center justify-center gap-2">
                  <Save className="h-3 w-3" />
                  SAVED
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Save className="h-3 w-3" />
                  SAVE_NOTE
                </span>
              )}
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
