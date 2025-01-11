import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import { useSocket } from "../context/socketProvider";

declare global {
  interface Window {
    pcr: RTCPeerConnection;
  }
}
interface RoomProp {
  name: string;
  localAudioTrack: MediaStreamTrack | null;
  localVideoTrack: MediaStreamTrack | null;
}

const Room = ({ name, localAudioTrack, localVideoTrack }: RoomProp) => {
  const [lobby, setLobby] = useState(true);
  const [socket, setSocket] = useState<null | Socket>(null);
  const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
  const [receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(
    null
  );
  const [remoteVideoTrack, setRemoteVideoTrack] =
    useState<MediaStreamTrack | null>(null);
  const [remoteAudioTrack, setRemoteAudioTrack] =
    useState<MediaStreamTrack | null>(null);
  const [remoteMediaStream, setRemoteMediaStream] =
    useState<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // const socket = useSocket();
  console.log("Inside Room fe");

  useEffect(() => {
    // NEED TO CHECK THIS LINE AGAIN
    const socket = io("http://localhost:5000");
    console.log("Inside Room fe useeffect");
    socket.on("send-offer", async ({ roomId }) => {
      console.log("inside send-offer");
      setLobby(false);
      const pc = new RTCPeerConnection();
      setSendingPc(pc);
      console.log(pc);

      if (localVideoTrack) {
        pc.addTrack(localVideoTrack);
      }
      if (localAudioTrack) {
        pc.addTrack(localAudioTrack);
      }
      pc.onicecandidate = async (e) => {
        console.log("receiving ice candidate locally");
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "sender",
            roomId,
          });
        }
      };
      // console.log(pc);
      pc.onnegotiationneeded = async () => {
        const sdp = await pc.createOffer();
        await pc.setLocalDescription(sdp);
        socket.emit("offer", {
          sdp,
          roomId,
        });
      };
      setSendingPc(pc);
    });
    socket?.on("offer", async ({ sdp: remoteSdp, roomId }) => {
      setLobby(false);
      console.log("FE:Inside socket on:offer");
      const pc = new RTCPeerConnection();
      const stream = new MediaStream();
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      setRemoteMediaStream(stream);
      pc.ontrack = (e) => {
        const { track, type } = e;
        console.log(track);
        console.log(type);
        if (type == "audio") {
          setRemoteAudioTrack(track);
          //@ts-ignore
          remoteVideoRef.current?.srcObject?.addTrack(track);
        } else {
          setRemoteVideoTrack(track);
          // @ts-ignore
          remoteVideoRef.current.srcObject.addTrack(track);
        }
        //@ts-ignore
        remoteVideoRef.current.play();
      };
      await pc.setRemoteDescription(remoteSdp);
      const sdp = await pc.createAnswer();
      await pc.setLocalDescription(sdp);
      // trickle ice
      setReceivingPc(pc);
      window.pcr = pc;

      console.log("socket............", roomId, sdp);
      pc.onicecandidate = async (e) => {
        if (!e.candidate) {
          return;
        }
        console.log("on ice candidate on receiving seide");
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "receiver",
            roomId,
          });
        }
      };
      socket.emit("answer", {
        roomId,
        sdp: sdp,
      });
    });

    socket?.on("answer", ({ sdp: remoteSdp }) => {
      setSendingPc((pc) => {
        pc?.setRemoteDescription(remoteSdp);
        return pc;
      });
    });
    socket?.on("lobby", () => {
      setLobby(true);
    });

    socket?.on("add-ice-candidate", ({ candidate, type }) => {
      console.log(candidate);
      console.log("FE: add-ice-candidate");
      if (type == "sender") {
        setReceivingPc((pc) => {
          pc?.addIceCandidate(candidate);
          return pc;
        });
      } else {
        setSendingPc((pc) => {
          pc?.addIceCandidate(candidate);
          return pc;
        });
      }
    });
    console.log("remote video ref", remoteVideoRef);
    setSocket(socket);
    return () => {
      socket.close();
      sendingPc?.close();
      receivingPc?.close();
      remoteVideoTrack?.stop();
      remoteAudioTrack?.stop();
    };
  }, [name]);
  useEffect(() => {
    if (localVideoRef.current) {
      if (localVideoTrack) {
        localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
        localVideoRef.current.play();
      }
    }
  }, [localVideoRef]);

  return (
    <div>
      Hi {name}
      <video autoPlay width={400} height={400} ref={localVideoRef} />
      {lobby ? "Waiting to connect you to someone" : null}
      <video autoPlay width={400} height={400} ref={remoteVideoRef} />
    </div>
  );
};

export default Room;
