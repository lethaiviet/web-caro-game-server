import { hash, compare } from 'bcrypt';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { InsensitiveUserData, User, LoginedUserData } from '@interfaces/users.interface';
import userModel from '@models/users.model';
import { getNameFromEmail, isEmpty } from '@utils/util';
import TokenService from './token.service';
import UserService from './users.service';

class AuthService {
  public users = userModel;

  public async signup(userData: CreateUserDto): Promise<[InsensitiveUserData, string]> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await this.users.findOne({ email: userData.email });
    if (findUser) throw new HttpException(409, `You're email ${userData.email} already exists`);

    const name = getNameFromEmail(userData.email);
    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = await this.users.create({ ...userData, password: hashedPassword, name, accessToken: name });

    const tokenData = TokenService.createToken(createUserData);
    await this.users.findByIdAndUpdate(createUserData._id, { accessToken: tokenData.token });

    const userDataOutput = UserService.getInsensitiveUserData(createUserData);
    return [userDataOutput, tokenData.token];
  }

  public async login(userData: CreateUserDto): Promise<{ cookie: string; findUser: LoginedUserData }> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    let findUser: User = await this.users.findOne({ email: userData.email });
    if (!findUser) throw new HttpException(409, `You're email ${userData.email} not found`);

    if (findUser.status !== 'active') throw new HttpException(401, 'Pending account, please verify your email');

    const isPasswordMatching: boolean = await compare(userData.password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(409, "You're password not matching");

    const tokenData = TokenService.createToken(findUser);
    const update = { accessToken: tokenData.token };
    findUser = await this.users.findByIdAndUpdate(findUser._id, update, { new: true });

    const cookie = this.createCookie(tokenData);

    return { cookie, findUser: { _id: findUser._id, accessToken: findUser.accessToken } };
  }

  public async logout(userData: User): Promise<InsensitiveUserData> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await this.users.findOne({ email: userData.email, password: userData.password });
    if (!findUser) throw new HttpException(409, `You're email ${userData.email} not found`);

    const userDataOutput = UserService.getInsensitiveUserData(findUser);
    return userDataOutput;
  }

  public createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }

  public async verifyConfirmationCode(accessToken: string): Promise<void> {
    const findUser: User = await this.users.findOne({ accessToken: accessToken });
    if (!findUser) throw new HttpException(409, 'Wrong confirmation code.');

    const data: DataStoredInToken = TokenService.verifyAndGetDataInToken(accessToken);
    const _id = data._id;
    if (findUser._id.toString() !== _id) throw new HttpException(409, 'Wrong confirmation code');

    await this.users.findOneAndUpdate({ _id }, { status: 'active' });
  }

  public async verifyAccessToken(accessToken: string): Promise<InsensitiveUserData> {
    const data: DataStoredInToken = TokenService.verifyAndGetDataInToken(accessToken);
    const _id = data._id;

    const findUser: User = await this.users.findById(_id);
    if (!findUser) throw new HttpException(404, 'Wrong Token.');

    const userDataOutput = UserService.getInsensitiveUserData(findUser);
    return userDataOutput;
  }
}

export default AuthService;
