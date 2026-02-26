import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
} from "@tanstack/react-router";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import { useGetMyRooms } from "./hooks/useQueries";
import { LandingPage } from "./pages/LandingPage";
import { ProfileSetupPage } from "./pages/ProfileSetupPage";
import { DashboardPage } from "./pages/DashboardPage";
import { MeetingRoomPage } from "./pages/MeetingRoomPage";
import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";

// ─── Root component ─────────────────────────────────────────────────────────

function AppRoot() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  if (isInitializing || (isAuthenticated && profileLoading && !profileFetched)) {
    return <BootScreen />;
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  const showProfileSetup = isAuthenticated && profileFetched && userProfile === null;

  if (showProfileSetup) {
    return (
      <ProfileSetupPage
        onComplete={() => {
          // Profile saved, re-render will pick up new profile
        }}
      />
    );
  }

  if (!userProfile) {
    return <BootScreen />;
  }

  return (
    <>
      <Outlet />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "oklch(0.08 0.005 145)",
            border: "1px solid oklch(0.85 0.22 145 / 0.4)",
            color: "oklch(0.92 0.08 145)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "12px",
            borderRadius: "0",
          },
        }}
      />
    </>
  );
}

// ─── Dashboard wrapper ───────────────────────────────────────────────────────

function DashboardRoute() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  if (!identity || !userProfile) return <BootScreen />;

  return <DashboardPage profile={userProfile} />;
}

// ─── Room wrapper ────────────────────────────────────────────────────────────

function RoomRoute({ roomId }: { roomId: string }) {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: rooms = [] } = useGetMyRooms();

  const roomIdBig = BigInt(roomId);
  const room = rooms.find((r) => r.id === roomIdBig);

  if (!identity || !userProfile) return <BootScreen />;

  // Room may still be loading
  if (!room && rooms.length === 0) return <BootScreen />;

  return (
    <MeetingRoomPage
      roomId={roomIdBig}
      roomTitle={room?.title ?? "SESSION"}
      roomCode={room?.code ?? BigInt(0)}
      profile={userProfile}
    />
  );
}

// ─── Boot screen ─────────────────────────────────────────────────────────────

function BootScreen() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <div
        className="font-mono text-2xl font-black tracking-[0.3em] text-neon"
        style={{ textShadow: "0 0 20px oklch(0.85 0.22 145 / 0.6)" }}
      >
        CYBERMEET
      </div>
      <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs">
        <Loader2 className="h-3 w-3 animate-spin text-primary" />
        ESTABLISHING SECURE CHANNEL...
      </div>
    </div>
  );
}

// ─── Routes ──────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({ component: AppRoot });

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardRoute,
});

const roomRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/room/$roomId",
  component: () => {
    const { roomId } = roomRoute.useParams();
    return <RoomRoute roomId={roomId} />;
  },
});

const routeTree = rootRoute.addChildren([dashboardRoute, roomRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "oklch(0.08 0.005 145)",
            border: "1px solid oklch(0.85 0.22 145 / 0.4)",
            color: "oklch(0.92 0.08 145)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "12px",
            borderRadius: "0",
          },
        }}
      />
    </>
  );
}
