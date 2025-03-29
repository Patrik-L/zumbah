import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { GameState, LobbyJoinParams, OrientationData } from "./types";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

interface hostMapping {
  [hostId: string]: { lobbyId: string };
}
interface playerMapping {
  [playerId: string]: string;
}

const hosts: hostMapping = {};
const players: playerMapping = {};

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("joinLobby", (lobbyJoin: LobbyJoinParams) => {
    const lobbyExists = Object.values(hosts).find(
      (host) => host.lobbyId === lobbyJoin.lobbyId
    );

    if (!lobbyExists) {
      socket.emit("lobbyClose");
      return;
    }

    socket.join(lobbyJoin.lobbyId);
    players[socket.id] = lobbyJoin.lobbyId;
    io.to(lobbyJoin.lobbyId).emit("playerJoin", lobbyJoin.player);

    console.log("player state:", hosts);
  });

  const userLeave = (uid: string) => {
    if (hosts[socket.id]) {
      closeRoom(socket.id);
      return;
    }

    for (const room of socket.rooms) {
      socket.to(room).emit("playerDisconnect", socket.id);
    }

    delete players[socket.id];
    console.log("player state:", hosts);
  };

  const closeRoom = (hostId: string) => {
    io.to(hosts[hostId].lobbyId).emit("lobbyClose");
    console.log("Lobby close!", hosts);

    const danglingPlayers = Object.entries(players).filter(
      (player) => player[1] === hosts[hostId].lobbyId
    );

    for (const player of danglingPlayers) {
      delete players[player[0]];
    }

    delete hosts[hostId];
  };

  socket.on("createLobby", (lobbyId: string) => {
    if (
      hosts[socket.id] ||
      Object.values(hosts).filter((val) => val.lobbyId === lobbyId).length
    ) {
      socket.emit("lobbyClose");
      return;
    }

    hosts[socket.id] = { lobbyId };
    socket.join(lobbyId);
  });

  socket.on("disconnect", () => {
    console.log("client disconnect!", socket.id);
    userLeave(socket.id);
  });

  socket.on("leaveLobby", () => {
    console.log("client to main screen!", socket.id);
    userLeave(socket.id);
  });

  socket.on("sendOrientationData", (data: OrientationData) => {
    const host = Object.entries(hosts).find(
      (host) => host[1].lobbyId === players[socket.id]
    );
    if (!host?.length) {
      console.error("Host not found!");
      return;
    }
    io.to(host[0]).emit("sendOrientationData", data);
  });

  socket.on("updateGameState", (data: GameState) => {
    console.log(players[socket.id]);
    socket.broadcast.to(data.lobbyId).emit("updateGameState", data);
  });

  socket.on("sendWinSignal", (uid: string) => {
    console.log("send win");
    io.to(uid).emit("sendWinSignal");
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
