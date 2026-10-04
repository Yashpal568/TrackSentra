import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User';
import mongoose from 'mongoose';

export class SocketService {
  private static io: Server;

  static init(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: '*', // Adjust for production
        methods: ['GET', 'POST']
      }
    });

    // Authentication Middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        const user = await User.findById(decoded.userId).select('_id companyId role');

        if (!user) {
          return next(new Error('User not found'));
        }

        // Attach user info to socket
        (socket as any).user = user;
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const user = (socket as any).user;
      
      // Join tenant room
      if (user.companyId) {
        socket.join(`company:${user.companyId.toString()}`);
      }
      
      // Join specific user room for direct notifications
      socket.join(`user:${user._id.toString()}`);

      if (user.role === UserRole.SUPER_ADMIN) {
        socket.join('platform:super-admin');
      }

      socket.on('disconnect', () => {
        // Automatically handled by socket.io
      });
    });
  }

  static emitToUser(userId: string | mongoose.Types.ObjectId, event: string, payload: any) {
    if (this.io) {
      this.io.to(`user:${userId.toString()}`).emit(event, payload);
    }
  }

  static emitToCompany(companyId: string | mongoose.Types.ObjectId, event: string, payload: any) {
    if (this.io) {
      this.io.to(`company:${companyId.toString()}`).emit(event, payload);
    }
  }

  static emitToPlatform(event: string, payload: any) {
    if (this.io) {
      this.io.to('platform:super-admin').emit(event, payload);
    }
  }
}
