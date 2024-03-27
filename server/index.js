import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const secret = "geekymonk"
const PORT = 3000;

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/login', (req, res) => {
    const token = jwt.sign({ _id: 'Anmol' }, secret);
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" })
        .json({
            message: "User logged in successfully",
        });
});

io.use((socket, next) => {
    cookieParser()(socket.request, socket.request.res, (err) => {
        if (err) return next(err);
        const token = socket.request.cookies.token;
        if (!token) return next(new Error("Authentication Error"));

        const decoded = jwt.verify(token, secret);
        next();
    })
});

io.on('connection', (socket) => {
    console.log('User connected', socket.id);
    socket.emit('welcome', `Welcome! Your id is ${socket.id}`);

    socket.on('message', ({ message, room }) => {
        console.log('Message received:', { message, room });
        io.to(room).emit('receive-message', message);
    });

    socket.on('join-room', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room ${room}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});