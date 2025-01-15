import express from "express";

const app = express();

import { Server, Socket } from "socket.io";
import { createServer } from "http";
import { UserManager } from "./managers/UserManager";

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});
const userManager = new UserManager();

app.get("/", (req, res) => {
  res.send("Welcome to the backend!");
});

io.on("connection", (socket: Socket) => {
  // console.log("a user connected");
  socket.on("add-user", ({ name }) => {
    userManager.addUser(name, socket);
    console.log(name);
  });
  socket.on("disconnect", () => {
    // console.log("user disconnected");
    userManager.removeUser(socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server is listning on 5000");
});
