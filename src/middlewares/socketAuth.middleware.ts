import userModel from '@/models/users.model';
import cookie from 'cookie';
import TokenService from '@/services/token.service';
import { NextFunction } from 'express';
import { Socket } from 'socket.io';
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from '@/interfaces/socket.interface';

const socketAuthMiddleware = async (
  socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  next: NextFunction,
) => {
  console.log('midlleware socketAuth');
  try {
    const cookieStr = socket.handshake.headers.cookie || 'Authorization=';
    const Authorization = cookie.parse(cookieStr)['Authorization'];
    if (Authorization) {
      const verificationResponse = TokenService.verifyAndGetDataInToken(Authorization);
      const userId = verificationResponse._id;
      const findUser = await userModel.findById(userId);

      if (findUser) {
        socket.data.user = findUser;
        next();
      } else {
        next(new Error('Wrong authentication token'));
      }
    } else {
      next(new Error('Authentication token missing'));
    }
  } catch (error) {
    next(new Error('Wrong authentication token'));
  }
};

export default socketAuthMiddleware;
