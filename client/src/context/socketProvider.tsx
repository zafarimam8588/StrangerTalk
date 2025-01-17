import { createContext, useContext, useMemo } from "react";
import { Socket, io } from "socket.io-client";

const SocketContext = createContext<Socket | null | string>(null);

export const useSocket = () => {
  const socket: Socket | null | string = useContext(SocketContext);
  return socket;
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socket = "abc";
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
