import { NextFunction, Request, Response } from 'express';
import { CreateUserDto, UserWithAccessToken } from '@dtos/users.dto';
import { RequestWithUser } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import AuthService from '@services/auth.service';
import EmailUtils from '@/utils/emailUtils';

class AuthController {
  public authService = new AuthService();

  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDto = req.body;
      const [signUpUserData, token] = await this.authService.signup(userData);
      res.status(201).json({ data: signUpUserData, message: 'signup' });

      const verifyAccountUrl = `${req.protocol}://${req.headers.host}/verify/${token}`;
      await EmailUtils.sendVerifyAccountEmail(signUpUserData.email, verifyAccountUrl);
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDto = req.body;
      const { cookie, findUser } = await this.authService.login(userData);

      res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({ data: findUser, message: 'login' });
    } catch (error) {
      next(error);
    }
  };

  public logOut = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;
      const logOutUserData: User = await this.authService.logout(userData);

      res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
      res.status(200).json({ data: logOutUserData, message: 'logout' });
    } catch (error) {
      next(error);
    }
  };

  public verifyCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const confirmationCode = req.params.confirmationCode;
      await this.authService.verifyConfirmationCode(confirmationCode);
      res.status(200).json({ message: 'Verify code successfully.' });
    } catch (error) {
      next(error);
    }
  };

  public checkAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: UserWithAccessToken = req.body;
      await this.authService.verifyConfirmationCode(userData.accessToken);
      res.status(200).json({ message: 'Verify token successfully.' });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
