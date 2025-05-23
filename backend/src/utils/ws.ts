import { io } from "..";

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("joinAuction", (auctionId) => {
    socket.join(`auction_${auctionId}`);
    console.log(`Socket ${socket.id} joined auction_${auctionId}`);

    socket.to(`auction_${auctionId}`).emit("userJoined", {
      message: "A user joined the auction",
      participantCount:
        io.sockets.adapter.rooms.get(`auction_${auctionId}`)?.size || 0,
    });
  });

  socket.on("leaveAuction", (auctionId) => {
    socket.leave(`auction_${auctionId}`);
    console.log(`Socket ${socket.id} left auction_${auctionId}`);

    socket.to(`auction_${auctionId}`).emit("userLeft", {
      message: "A user left the auction",
      participantCount:
        io.sockets.adapter.rooms.get(`auction_${auctionId}`)?.size || 0,
    });
  });

  socket.on("ping", () => {
    socket.emit("pong");
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});
