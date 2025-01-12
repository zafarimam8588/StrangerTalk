let GLOBAL_ROOM_ID = 1;
import { User } from "./UserManager";

interface Room {
  user1: User;
  user2: User;
}
export class RoomManager {
  private rooms: Map<string, Room>;
  constructor() {
    this.rooms = new Map<string, Room>();
  }

  generate() {
    return GLOBAL_ROOM_ID++;
  }

  createRoom(user1: User, user2: User) {
    // console.log("inside createRoom");
    // console.log(user1, user2);
    const roomId = this.generate().toString();

    this.rooms.set(roomId, {
      user1,
      user2,
    });

    const temp1 = user1.socket.emit("send-offer", {
      roomId,
    });
    // console.log("BE: Inside function createRoom", temp1);
    const temp2 = user2.socket.emit("send-offer", {
      roomId,
    });
    // console.log("BE: Inside function createRoom", temp2);
  }

  onOffer(roomId: string, sdp: string, senderSocketId: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }
    const receivingUser =
      room.user1.socket.id === senderSocketId ? room.user2 : room.user1;

    const temp = receivingUser?.socket.emit("offer", {
      sdp,
      roomId,
    });
    // console.log("BE: Inside function onOffer", temp);
  }
  onAnswer(roomId: string, sdp: string, senderSocketid: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }

    const receivingUser =
      room.user1.socket.id === senderSocketid ? room.user2 : room.user1;

    receivingUser.socket.emit("answer", {
      sdp,
      roomId,
    });
    // console.log(
    //   "BE: Inside function onAnswer..................................................!!!!"
    // );
  }
  onIceCandidates(
    roomId: string,
    senderSocketid: string,
    candidate: any,
    type: "sender" | "receiver"
  ) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }
    const receivingUser =
      room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
    // console.log("BE:Inside function onIceCandidate", receivingUser.socket.id);
    const temp = receivingUser.socket.emit("add-ice-candidate", {
      candidate,
      type,
    });
    // console.log(temp);
  }
}
