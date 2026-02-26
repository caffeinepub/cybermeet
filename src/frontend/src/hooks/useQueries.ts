import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type { Profile, RoomId, RoomCode, RoomView, Message } from "../backend.d";

// ─── Profile ────────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<Profile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: Profile) => {
      if (!actor) throw new Error("Actor not available");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ─── Rooms ───────────────────────────────────────────────────────────────────

export function useGetMyRooms() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<RoomView[]>({
    queryKey: ["myRooms"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyRooms();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, description }: { title: string; description: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createRoom(title, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myRooms"] });
    },
  });
}

export function useJoinRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: RoomCode) => {
      if (!actor) throw new Error("Actor not available");
      await actor.joinRoom(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myRooms"] });
    },
  });
}

export function useLeaveRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: RoomId) => {
      if (!actor) throw new Error("Actor not available");
      await actor.leaveRoom(roomId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myRooms"] });
    },
  });
}

// ─── Messages ────────────────────────────────────────────────────────────────

export function useGetMessages(roomId: RoomId | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ["messages", roomId?.toString()],
    queryFn: async () => {
      if (!actor || roomId === null) return [];
      return actor.getMessages(roomId);
    },
    enabled: !!actor && !actorFetching && roomId !== null,
    refetchInterval: 3000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, content }: { roomId: RoomId; content: string }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.sendMessage(roomId, content);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.roomId.toString()] });
    },
  });
}

// ─── Participants ─────────────────────────────────────────────────────────────

export function useGetRoomParticipants(roomId: RoomId | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[import("@icp-sdk/core/principal").Principal, Profile]>>({
    queryKey: ["participants", roomId?.toString()],
    queryFn: async () => {
      if (!actor || roomId === null) return [];
      return actor.getRoomParticipants(roomId);
    },
    enabled: !!actor && !actorFetching && roomId !== null,
    refetchInterval: 5000,
  });
}

// ─── Notes ───────────────────────────────────────────────────────────────────

export function useGetNote(roomId: RoomId | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string>({
    queryKey: ["note", roomId?.toString()],
    queryFn: async () => {
      if (!actor || roomId === null) return "";
      return actor.getNote(roomId);
    },
    enabled: !!actor && !actorFetching && roomId !== null,
  });
}

export function useSaveNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, note }: { roomId: RoomId; note: string }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.saveNote(roomId, note);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["note", variables.roomId.toString()] });
    },
  });
}
