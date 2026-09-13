import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyAccessToken } from './utils/jwt.util';

let io: SocketIOServer;

export const isAllowedOrigin = (origin?: string): boolean => {
  if (!origin) return true;
  const cleanOrigin = origin.replace(/\/+$/, '');
  const allowed = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://car-rental-and-booking-system.vercel.app',
    process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/+$/, '') : null
  ].filter(Boolean) as string[];

  if (allowed.includes(cleanOrigin)) return true;

  // Only allow valid Vercel project preview deployments for this specific project
  if (/^https:\/\/car-rental-and-booking-system(-[a-zA-Z0-9_-]+)?\.vercel\.app$/.test(cleanOrigin)) {
    return true;
  }

  return false;
};

export const initSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS for Socket.io'));
      },
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token || typeof token !== 'string') {
      return next(new Error('Authentication error: Token required'));
    }
    try {
      const decoded = verifyAccessToken(token);
      (socket as any).user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    
    // Join personal room
    if (user?.userId) {
      socket.join(`user:${user.userId}`);
    }

    // Join admin room
    if (user?.role === 'ADMIN' || user?.role === 'STAFF') {
      socket.join('admin');
    }

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
