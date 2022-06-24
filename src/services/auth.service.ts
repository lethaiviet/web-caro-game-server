import { hash, compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { SECRET_KEY } from '@config';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import userModel from '@models/users.model';
import { isEmpty } from '@utils/util';

class AuthService {
  public users = userModel;

  public async signup(userData: CreateUserDto): Promise<[User, string]> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await this.users.findOne({ email: userData.email });
    if (findUser) throw new HttpException(409, `You're email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = await this.users.create({ ...userData, password: hashedPassword });

    const tokenData = this.createToken(createUserData);
    await this.users.findOneAndUpdate({ email: userData.email }, { confirmationCode: tokenData.token });

    return [createUserData, tokenData.token];
  }

  public async login(userData: CreateUserDto): Promise<{ cookie: string; findUser: User }> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await this.users.findOne({ email: userData.email });
    if (!findUser) throw new HttpException(409, `You're email ${userData.email} not found`);

    if (findUser.status !== 'active') throw new HttpException(401, 'Pending account, please verify your email');

    const isPasswordMatching: boolean = await compare(userData.password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(409, "You're password not matching");

    const tokenData = this.createToken(findUser);
    const cookie = this.createCookie(tokenData);

    return { cookie, findUser };
  }

  public async logout(userData: User): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await this.users.findOne({ email: userData.email, password: userData.password });
    if (!findUser) throw new HttpException(409, `You're email ${userData.email} not found`);

    return findUser;
  }

  public createToken(user: User): TokenData {
    const dataStoredInToken: DataStoredInToken = { _id: user._id };
    const secretKey: string = SECRET_KEY;
    const expiresIn: number = 10 * 60 * 60;

    return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  private getDataInToken(token: string): DataStoredInToken {
    try {
      return verify(token, SECRET_KEY) as DataStoredInToken;
    } catch (e) {
      throw new HttpException(409, e.message);
    }
  }

  public createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }

  public async verifyConfirmationCode(code: string): Promise<void> {
    const findUser: User = await this.users.findOne({ confirmationCode: code });

    if (!findUser) throw new HttpException(409, 'Wrong confirmation code.');

    const data = this.getDataInToken(code);
    const _id = data._id;
    if (findUser._id.toString() !== _id) throw new HttpException(409, 'Wrong confirmation code');

    await this.users.findOneAndUpdate({ _id }, { status: 'active' });
  }
}

export default AuthService;
