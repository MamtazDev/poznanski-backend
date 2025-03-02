const socketIo = require("socket.io");
require("dotenv").config();

let usersById = new Map();

const addUser = (userInfo, socketId) => {
  if (!usersById.has(userInfo.id)) {
    const user = {
      userId: userInfo.id,
      socketId: socketId,
    };
    usersById.set(userInfo.id, user);
  }
};

const getSocketUser = async (userId) => {
  return usersById.get(userId);
};

const removeUser = async (socketId) => {
  const user = usersById.get(socketId);
  if (user) {
    usersById.delete(user.userId);
  }

  return user;
};

const getUsers = async () => {
  // get all users as array
  const users = Array.from(usersById.values());
  return users;
};

let io;
const initializeSocket = (Server) => {
  io = socketIo(Server, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
      ],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("addUser", async (user) => {
      console.log("connected! 🟢 : ", user.id);
      addUser(user, socket.id);
      const users = await getUsers();
      console.log(users.length);
    });

    // send notification to user
    socket.on("sendNotification", async (data) => {
      const user = await getSocketUser(data.receiverId);
      if (user) {
        io.to(user.socketId).emit("notification", data);
      }
    });

    //when disconnect
    socket.on("disconnect", async () => {
      await removeUser(socket.id);

      console.log("disconnected! 🔴");
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = { initializeSocket, getIo, getSocketUser };
