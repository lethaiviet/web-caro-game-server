import userModel from '@/models/users.model';
import cookie from 'cookie';
import TokenService from '@/services/token.service';
import { NextFunction } from 'express';
import { Socket } from 'socket.io';
import { SocketClientEvents, InterServerEvents, SocketServerEvents, SocketData } from '@/interfaces/socket.interface';

const socketAuthMiddleware = async (socket: Socket<SocketClientEvents, SocketServerEvents, InterServerEvents, SocketData>, next: NextFunction) => {
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
  // const findUser = await userModel.findById('62bc10b7fc9a494f6dc8afb7'); //lethaiviet92
  // // const findUser = await userModel.findById('62beaf78c979fc51f6e60da1'); //spiritstorm
  // socket.data.user = findUser;
  // next();
};

export default socketAuthMiddleware;
