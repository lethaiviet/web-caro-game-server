import { SECRET_KEY } from '@/config';
import { HttpException } from '@/exceptions/HttpException';
import { DataStoredInToken, TokenData } from '@/interfaces/auth.interface';
import { User } from '@/interfaces/users.interface';
import { sign, verify } from 'jsonwebtoken';

class TokenService {
  private secretKey: string = SECRET_KEY;
  private expiresIn: number = 10 * 60 * 60; //10h

  public createToken(user: User, expiresIn: number = this.expiresIn): TokenData {
    const dataStoredInToken: DataStoredInToken = { _id: user._id };
    const token = sign(dataStoredInToken, this.secretKey, { expiresIn });
    return { expiresIn, token };
  }

  public verifyAndGetDataInToken(token: string): DataStoredInToken {
    try {
      return verify(token, this.secretKey) as DataStoredInToken;
    } catch (e) {
      throw new HttpException(401, e.message);
    }
  }
}

export default new TokenService();
