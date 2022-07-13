import { hash } from 'bcrypt';
import { CreateUserDto, UpdateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { User, InsensitiveUserData, UserStates } from '@interfaces/users.interface';
import userModel from '@models/users.model';
import { isEmpty, getNameFromEmail } from '@utils/util';
import fs from 'fs-extra';
import { AllMessagesInRoom } from '@/interfaces/chat-messages.interface';
import PrivateChatRoomsService from './private-chat-rooms.service';
import mongoose from 'mongoose';
import { QUERY_GET_ALL_MSG_FROM_ALL_PRIVATE_ROOMS_BY_USER_ID } from '@/utils/queryDB';

class UserService {
  public users = userModel;
  public privateChatRoomService = new PrivateChatRoomsService();
  public ObjectId = mongoose.Types.ObjectId;

  public static getInsensitiveUserData(userData: User): InsensitiveUserData {
    const { _id, email, status, bio, name, avatar, exp } = userData;
    return { _id, email, status, bio, name, avatar, exp };
  }

  public async findAllUser(): Promise<InsensitiveUserData[]> {
    const users: User[] = await this.users.find();
    const usersOutput: InsensitiveUserData[] = users.map(x => UserService.getInsensitiveUserData(x));

    return usersOutput;
  }

  public async findUserById(userId: string): Promise<InsensitiveUserData> {
    if (isEmpty(userId)) throw new HttpException(400, "You're not userId");

    const findUser: User = await this.users.findOne({ _id: userId });
    if (!findUser) throw new HttpException(409, "You're not user");

    const userDataOuput = UserService.getInsensitiveUserData(findUser);
    return userDataOuput;
  }

  public async createUser(userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await this.users.findOne({ email: userData.email });
    if (findUser) throw new HttpException(409, `You're email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const name = getNameFromEmail(userData.email);
    const createUserData: User = await this.users.create({ ...userData, password: hashedPassword, name });

    return createUserData;
  }

  public async updateUser(userId: string, userData: UpdateUserDto): Promise<InsensitiveUserData> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    if (userData.name) {
      const findUser: User = await this.users.findOne({ name: userData.name });
      if (findUser && findUser._id != userId) throw new HttpException(409, `You're name ${userData.name} already exists`);
    }

    if (userData.email) {
      const findUser: User = await this.users.findOne({ email: userData.email });
      if (findUser && findUser._id != userId) throw new HttpException(409, `You're email ${userData.email} already exists`);
    }

    if (userData.password) {
      const hashedPassword = await hash(userData.password, 10);
      userData = { ...userData, password: hashedPassword };
    }

    const updateUserById: User = await this.users.findByIdAndUpdate(userId, userData, { new: true });
    if (!updateUserById) throw new HttpException(409, "You're not user");

    const userDataOutput = UserService.getInsensitiveUserData(updateUserById);

    return userDataOutput;
  }

  public async deleteUser(userId: string): Promise<User> {
    const deleteUserById: User = await this.users.findByIdAndDelete(userId);
    if (!deleteUserById) throw new HttpException(409, "You're not user");

    return deleteUserById;
  }

  public async uploadUserAvatar(userId: string, avatar: string, avatarLocalPath: string): Promise<void> {
    const findUser: User = await this.users.findById(userId);
    fs.removeSync(findUser.avatarLocalPath);

    const data: UpdateUserDto = { avatar, avatarLocalPath };
    await this.updateUser(userId, data);
  }

  public async joinPrivateChatRoom(userId: string, roomId: string): Promise<void> {
    await this.users.findByIdAndUpdate(userId, { $push: { privateChatRooms: roomId } });
  }

  public async getAllPrivateMessagesInAllRooms(userId: string): Promise<AllMessagesInRoom[]> {
    const findUser: User = await this.users.findById(userId);

    let result: AllMessagesInRoom[] = [];
    if (findUser && findUser.privateChatRooms.length > 0) {
      result = await this.users.aggregate<AllMessagesInRoom>(QUERY_GET_ALL_MSG_FROM_ALL_PRIVATE_ROOMS_BY_USER_ID(userId));

      result = result.map(x => {
        const roomName = x.roomName.replace('-vs-', '').replace(userId, '');
        return { ...x, roomName };
      });
    }

    return result;
  }

  public async getAllUserStatus(listUsersIdOnline: Set<string>, exclusiveUserId = ''): Promise<UserStates[]> {
    const users: InsensitiveUserData[] = await this.findAllUser();

    const usersStates: UserStates[] = users
      .filter(x => x._id.toString() !== exclusiveUserId)
      .map(x => {
        const status = listUsersIdOnline.has(x._id.toString()) ? 'Online' : 'Offline';
        return {
          _id: x._id,
          name: x.name,
          avatar: x.avatar,
          status,
        };
      });

    return usersStates;
  }
}

export default UserService;
