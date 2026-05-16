const express = require("express");

const http = require("http");

const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

app.get("/", (req, res) => {
    res.send("Server running");
});

const users = {};

io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    socket.on("register_user", (username) => {

        users[username] = socket.id;

        console.log(username + " registered");
    });

    socket.on("send_message", (data) => {

        const targetSocketId = users[data.receiver];

        if (targetSocketId) {

            io.to(targetSocketId).emit(
                "receive_message",
                data
            );
        }
    });

    socket.on("disconnect", () => {

        for (let username in users) {

            if (users[username] === socket.id) {

                delete users[username];
            }
        }

        console.log("Disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server running");
});