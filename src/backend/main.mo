import Time "mo:core/Time";
import Text "mo:core/Text";
import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Array "mo:core/Array";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type RoomCode = Nat;
  type RoomId = Nat;
  var nextRoomId = 0;

  type UserRole = {
    #analyst;
    #consultant;
    #engineer;
    #client;
    #admin;
  };

  type Profile = {
    displayName : Text;
    role : UserRole;
  };

  module Profile {
    public func compare(p1 : Profile, p2 : Profile) : Order.Order {
      Text.compare(p1.displayName, p2.displayName);
    };
  };

  type Room = {
    id : RoomId;
    title : Text;
    description : Text;
    creator : Principal;
    code : RoomCode;
    participants : List.List<Principal>;
  };

  type RoomView = {
    id : RoomId;
    title : Text;
    description : Text;
    creator : Principal;
    code : RoomCode;
    participants : [Principal];
  };

  module Room {
    public func compare(room1 : Room, room2 : Room) : Order.Order {
      Nat.compare(room1.id, room2.id);
    };
  };

  type Message = {
    sender : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  module Message {
    public func compare(msg1 : Message, msg2 : Message) : Order.Order {
      Int.compare(msg1.timestamp, msg2.timestamp);
    };
  };

  type RoomNoteKey = { user : Principal; roomId : RoomId };

  module RoomNoteKey {
    public func compare(key1 : RoomNoteKey, key2 : RoomNoteKey) : Order.Order {
      switch (Principal.compare(key1.user, key2.user)) {
        case (#equal) { Nat.compare(key1.roomId, key2.roomId) };
        case (order) { order };
      };
    };
  };

  let profiles = Map.empty<Principal, Profile>();
  let rooms = Map.empty<RoomId, Room>();
  let roomMessages = Map.empty<RoomId, List.List<Message>>();
  let roomNotes = Map.empty<RoomNoteKey, Text>();

  public query ({ caller }) func getCallerUserProfile() : async ?Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    profiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?Profile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    profiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : Profile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    profiles.add(caller, profile);
  };

  public shared ({ caller }) func createRoom(title : Text, description : Text) : async RoomId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create rooms");
    };

    let id = nextRoomId;
    nextRoomId += 1;

    let participants = List.empty<Principal>();
    participants.add(caller);

    let room = {
      id;
      title;
      description;
      creator = caller;
      code = id;
      participants;
    };

    rooms.add(id, room);
    roomMessages.add(id, List.empty<Message>());
    id;
  };

  public shared ({ caller }) func joinRoom(code : RoomCode) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can join rooms");
    };

    switch (rooms.get(code)) {
      case (null) {
        Runtime.trap("Room not found");
      };
      case (?room) {
        if (room.participants.contains(caller)) {
          Runtime.trap("Already joined this room!");
        };
        room.participants.add(caller);
        rooms.add(code, room);
      };
    };
  };

  public shared ({ caller }) func leaveRoom(roomId : RoomId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can leave rooms");
    };

    switch (rooms.get(roomId)) {
      case (null) {
        Runtime.trap("Room not found");
      };
      case (?room) {
        if (not (room.participants.contains(caller))) {
          Runtime.trap("You are not a participant in this room");
        };

        let newParticipants = room.participants.filter(func(p) { p != caller });
        let newRoom = {
          room with
          participants = newParticipants;
        };
        rooms.add(roomId, newRoom);
      };
    };
  };

  public query ({ caller }) func getMyRooms() : async [RoomView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view this");
    };

    let filteredRooms = List.empty<RoomView>();
    for (room in rooms.values()) {
      if (room.participants.contains(caller)) {
        let snapshot = {
          id = room.id;
          title = room.title;
          description = room.description;
          creator = room.creator;
          code = room.code;
          participants = room.participants.toArray();
        };
        filteredRooms.add(snapshot);
      };
    };
    filteredRooms.toArray();
  };

  public query ({ caller }) func getRoomParticipants(roomId : RoomId) : async [(Principal, Profile)] {
    switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room does not exist") };
      case (?room) {
        if (not (room.participants.contains(caller)) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only room participants or admins can view participants");
        };
        room.participants.toArray().map(
          func(p) {
            switch (profiles.get(p)) {
              case (null) { Runtime.trap("Profile does not exist") };
              case (?profile) { (p, profile) };
            };
          }
        );
      };
    };
  };

  public shared ({ caller }) func sendMessage(roomId : RoomId, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    switch (rooms.get(roomId)) {
      case (null) {
        Runtime.trap("Room not found");
      };
      case (?room) {
        if (not (room.participants.contains(caller))) {
          Runtime.trap("You are not a participant in this room");
        };

        let message = {
          sender = caller;
          content;
          timestamp = Time.now();
        };

        switch (roomMessages.get(roomId)) {
          case (null) { Runtime.trap("Room does not exist") };
          case (?messagesList) {
            messagesList.add(message);
          };
        };
      };
    };
  };

  public query ({ caller }) func getMessages(roomId : RoomId) : async [Message] {
    switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room does not exist") };
      case (?room) {
        if (not (room.participants.contains(caller)) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only room participants or admins can view messages");
        };
        switch (roomMessages.get(roomId)) {
          case (null) { Runtime.trap("Room does not exist") };
          case (?messagesList) {
            messagesList.toArray().sort();
          };
        };
      };
    };
  };

  public shared ({ caller }) func saveNote(roomId : RoomId, note : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save notes");
    };

    switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room does not exist") };
      case (?room) {
        if (not (room.participants.contains(caller))) {
          Runtime.trap("You are not a participant in this room");
        };
        let key = { user = caller; roomId };
        roomNotes.add(key, note);
      };
    };
  };

  public query ({ caller }) func getNote(roomId : RoomId) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get notes");
    };

    let key = { user = caller; roomId };
    switch (roomNotes.get(key)) {
      case (null) { Runtime.trap("No note for this room") };
      case (?note) { note };
    };
  };
};
