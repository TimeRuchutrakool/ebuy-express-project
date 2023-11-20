const prisma = require("../models/prisma");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const { upload } = require("../utils/cloudinaryServices");

module.exports.getChatList = (socket) => {
  socket.on("getChatList", async (data, cb) => {
    const chatList = await prisma.chatroom.findMany({
      orderBy: {
        latestMessageTime: "desc",
      },
      where: {
        OR: [{ user1Id: data.userId }, { user2Id: data.userId }],
      },
      include: { user1: true, user2: true },
    });

    const chatRoomList = chatList.map((chat) => {
      return {
        id: chat.id,
        talkTo: chat.user1Id === data.userId ? chat.user2 : chat.user1,
      };
    });

    cb(chatRoomList);
  });
};

module.exports.joinRoom = (io, socket) => {
  socket.on("joinRoom", async (data) => {
    socket.join(`${data.roomId}`);
    const chats = await prisma.message.findMany({
      where: {
        chatroomId: data.roomId,
      },
      orderBy: {
        sendAt: "asc",
      },
    });
    io.of("/chat").in(`${data.roomId}`).emit("joinedRoom", chats);
  });
};

module.exports.sendMessage = (io, socket) => {
  socket.on("sendMessage", async (data) => {
    console.log(data);
    socket.join(`${data.roomId}`);
    let url;
    console.log(data);
    if (data.type === "IMAGE") {
      const path = `public/${uuidv4()}.jpeg`;
      fs.writeFile(path, Buffer.from(data.content), (err) => {
        if (err) {
          console.error("Error writing image file:", err);
        } else {
          console.log("Image file written successfully:", path);
        }
      });
      url = await upload(path);
      fs.unlink(path, (err) => {
        if (err) {
          console.error("Error removing file:", err);
        } else {
          console.log("File removed successfully.");
        }
      });
    }

    const messageId = uuidv4() + Date.now();
    io.of("/chat")
      .in(`${data.roomId}`)
      .emit("receivedMessage", {
        id: messageId,
        content: url ? url : data.content,
        chatroomId: data.roomId,
        senderId: data.senderId,
        sendAt: Date.now(),
        type: data.type,
      });
    await prisma.message.create({
      data: {
        id: messageId,
        content: url ? url : data.content,
        chatroomId: data.roomId,
        senderId: data.senderId,
        type: data.type,
      },
    });
    await prisma.chatroom.update({
      where: {
        id: data.roomId,
      },
      data: {
        latestMessageTime: new Date(),
      },
    });
  });
};

module.exports.findRoom = (socket) => {
  socket.on("findRoom", async (data, cb) => {
    let chatRoom = await prisma.chatroom.findFirst({
      where: {
        OR: [
          { user1Id: data.userId, user2Id: data.storeId },
          { user2Id: data.userId, user1Id: data.storeId },
        ],
      },
    });
    if (!chatRoom) {
      chatRoom = await prisma.chatroom.create({
        data: {
          user1Id: data.userId,
          user2Id: data.storeId,
        },
      });
    }
    const talkTo = await prisma.user.findFirst({ where: { id: data.storeId } });
    cb({ id: chatRoom.id, talkTo });
  });
};
