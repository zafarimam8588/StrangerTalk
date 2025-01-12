import { useEffect, useRef, useState } from "react";
import Room from "./Room";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const Landing = () => {
  const [name, setName] = useState("");
  const [localAudioTrack, setLocalAudioTrack] =
    useState<MediaStreamTrack | null>(null);
  const [localVideoTrack, setlocalVideoTrack] =
    useState<MediaStreamTrack | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [joined, setJoined] = useState(false);

  const getCam = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const audioTrack = stream.getAudioTracks()[0];
    const videoTrack = stream.getVideoTracks()[0];
    setLocalAudioTrack(audioTrack);
    setlocalVideoTrack(videoTrack);

    if (!videoRef.current) {
      return;
    }
    videoRef.current.srcObject = new MediaStream([videoTrack]);
    videoRef.current.play();
    // console.log(localAudioTrack);
    // console.log(localVideoTrack);
  };
  useEffect(() => {
    if (videoRef && videoRef.current) {
      getCam();
      // console.log(
      //   "Inside useEffect of Landing component, after getCam function"
      // );
    }
  }, [videoRef]);

  if (!joined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 flex flex-col items-center justify-center min-h-screen">
          <Card className="w-[95%] sm:w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
            <CardContent className="p-6 space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  Random Video Chat
                </h1>
                <p className="text-muted-foreground">
                  Meet new people through video chat
                </p>
              </div>

              {/* Video Preview with Glow Effect */}
              <div className="relative rounded-lg overflow-hidden bg-black/20 aspect-video shadow-lg">
                <video
                  autoPlay
                  ref={videoRef}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 ring-1 ring-white/20 rounded-lg"></div>
              </div>

              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Enter your name"
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border-white/10 focus:ring-2 focus:ring-purple-500"
                />

                <Button
                  onClick={() => setJoined(true)}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-purple-500/25"
                >
                  Start Chatting
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <Room
      name={name}
      localAudioTrack={localAudioTrack}
      localVideoTrack={localVideoTrack}
    />
  );
};

export default Landing;
