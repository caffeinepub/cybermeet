import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export type RoomId = bigint;
export interface RoomView {
    id: RoomId;
    title: string;
    creator: Principal;
    participants: Array<Principal>;
    code: RoomCode;
    description: string;
}
export type RoomCode = bigint;
export interface Profile {
    displayName: string;
    role: UserRole;
}
export interface Message {
    content: string;
    sender: Principal;
    timestamp: Time;
}
export enum UserRole {
    client = "client",
    admin = "admin",
    consultant = "consultant",
    engineer = "engineer",
    analyst = "analyst"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    createRoom(title: string, description: string): Promise<RoomId>;
    getCallerUserProfile(): Promise<Profile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getMessages(roomId: RoomId): Promise<Array<Message>>;
    getMyRooms(): Promise<Array<RoomView>>;
    getNote(roomId: RoomId): Promise<string>;
    getRoomParticipants(roomId: RoomId): Promise<Array<[Principal, Profile]>>;
    getUserProfile(user: Principal): Promise<Profile | null>;
    isCallerAdmin(): Promise<boolean>;
    joinRoom(code: RoomCode): Promise<void>;
    leaveRoom(roomId: RoomId): Promise<void>;
    saveCallerUserProfile(profile: Profile): Promise<void>;
    saveNote(roomId: RoomId, note: string): Promise<void>;
    sendMessage(roomId: RoomId, content: string): Promise<void>;
}
