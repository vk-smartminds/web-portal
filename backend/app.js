import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import router from "./routes/routes.js";
import DBconnection from './database/db.js';
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();

const app = express();

// Trust proxy for real client IPs
app.set('trust proxy', true);

// Middleware
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://172.16.201.50:3000',
    //add frontend URL here
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/', router);
app.use('/uploads', express.static('backend/public/uploads'));

app.get('/', (req, res) => {
    res.send('Welcome to the VK Publications');
});

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://172.16.201.50:3000',
    ],
    credentials: true
  }
});

// Store userId <-> socketId mapping
const userSocketMap = new Map();

io.on('connection', (socket) => {
  // Expect userId in handshake query
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap.set(userId, socket.id);
  }
  socket.on('disconnect', () => {
    if (userId) userSocketMap.delete(userId);
  });
});

app.set('io', io);
app.set('userSocketMap', userSocketMap);

DBconnection();

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`server is listening on port ${PORT}`);
});