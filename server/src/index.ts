import express from "express";

const app = express();

import { Server, Socket } from "socket.io";
import { createServer } from "http";
import { UserManager } from "./managers/UserManager";

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});
const userManager = new UserManager();

io.on("connection", (socket: Socket) => {
  console.log("a user connected");
  userManager.addUser("randomName", socket);
  socket.on("disconnect", () => {
    console.log("user disconnected");
    userManager.removeUser(socket.id);
  });
});

server.listen(5000, () => {
  console.log("Server is listning on 5000");
});
