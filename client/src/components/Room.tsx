import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Loader2 } from "lucide-react";
// import { useSocket } from "../context/socketProvider";

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
  // const [socket, setSocket] = useState<null | Socket>(null);
  const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
  const [receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(
    null
  );
  const [remoteVideoTrack, setRemoteVideoTrack] =
    useState<MediaStreamTrack | null>(null);
  const [remoteAudioTrack, setRemoteAudioTrack] =
    useState<MediaStreamTrack | null>(null);
  // const [remoteMediaStream, setRemoteMediaStream] =
  //   useState<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // const socket = useSocket();
  // console.log("Inside Room component fe ,outside useeffect");

  useEffect(() => {
    // NEED TO CHECK THIS LINE AGAIN
    const socket = io("http://localhost:5000");
    socket.emit("add-user", { name });
    // setSocket(socketInstance);
    // console.log("Inside Room component fe,inside useeffect");
    socket?.on("send-offer", async ({ roomId }) => {
      // console.log("inside send-offer");
      setLobby(false);
      const pc = new RTCPeerConnection();
      setSendingPc(pc);
      // console.log(pc);

      if (localVideoTrack) {
        pc.addTrack(localVideoTrack);
      }
      if (localAudioTrack) {
        pc.addTrack(localAudioTrack);
      }
      pc.onicecandidate = async (e) => {
        // console.log("inside onicecandidate");
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "sender",
            roomId,
          });
          // setSocket(socket);
        }
      };
      // console.log(pc);
      pc.onnegotiationneeded = async () => {
        // console.log("inside onnegotiationneeded");
        const sdp = await pc.createOffer();
        await pc.setLocalDescription(sdp);

        socket?.emit("offer", {
          sdp,
          roomId,
        });

        // console.log("insside onnegotiationneeded after emit offer");
      };
      // setSendingPc(pc);
    });
    socket?.on("offer", async ({ sdp: remoteSdp, roomId }) => {
      setLobby(false);
      // console.log("inside offer");
      const pc = new RTCPeerConnection();
      const stream = new MediaStream();
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      // setRemoteMediaStream(stream);
      pc.ontrack = (e) => {
        // console.log("inside pc.ontrack");
        const { track, type } = e;
        // console.log(track);
        // console.log(type);
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

      pc.onicecandidate = async (e) => {
        if (!e.candidate) {
          return;
        }
        // console.log("inside onicecandidate");
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
      // console.log(
      //   "inside lobby,after setLobby(true) waiting for another person to join the room"
      // );
    });

    socket?.on("add-ice-candidate", ({ candidate, type }) => {
      // console.log("Inside add-ice-candidate");
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
    // console.log("bottom of useeffect");
    // setSocket(socket);
    // console.log("socket is ", socket);
    return () => {
      socket?.close();
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
        // console.log("inside local video ref useeffect");
      }
    }
  }, [localVideoRef]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 p-2 sm:p-4 md:p-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 mb-4 sm:mb-8">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white/10 backdrop-blur-sm">
              {name}
            </Badge>
          </div>
          <Button variant="outline" className="bg-white/10 backdrop-blur-sm">
            Next Person
          </Button>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 md:gap-8">
          {/* Local Video */}
          <Card className="bg-black/20 backdrop-blur-lg border-white/20 shadow-xl overflow-hidden w-full">
            <CardContent className="p-0 aspect-video relative w-full">
              <video
                autoPlay
                ref={localVideoRef}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm">
                You
              </Badge>
            </CardContent>
          </Card>

          {/* Remote Video */}
          <Card className="bg-black/20 backdrop-blur-lg border-white/20 shadow-xl overflow-hidden w-full">
            <CardContent className="p-0 aspect-video relative w-full">
              {lobby ? (
                <div className="w-full h-full flex items-center justify-center bg-black/40">
                  <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-500" />
                    <p className="text-sm sm:text-base text-muted-foreground px-4">
                      Finding someone to chat with...
                    </p>
                  </div>
                </div>
              ) : (
                <video
                  autoPlay
                  ref={remoteVideoRef}
                  className="w-full h-full object-cover"
                />
              )}
              <Badge className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm">
                Stranger
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Room;
