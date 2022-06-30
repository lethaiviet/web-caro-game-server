import { hash } from 'bcrypt';
import { CreateUserDto, UpdateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { User, InsensitiveUserData } from '@interfaces/users.interface';
import userModel from '@models/users.model';
import { isEmpty, getNameFromEmail } from '@utils/util';
import fs from 'fs-extra';

class UserService {
  public users = userModel;

  public static getInsensitiveUserData(userData: User): InsensitiveUserData {
    const { _id, email, status, bio, name, avatar, exp } = userData;
    return { _id, email, status, bio, name, avatar, exp };
  }

  public async findAllUser(): Promise<User[]> {
    const users: User[] = await this.users.find();
    return users;
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

  public async updateUser(userId: string, userData: UpdateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

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

    return updateUserById;
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
}

export default UserService;
