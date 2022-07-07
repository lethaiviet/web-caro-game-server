import { NextFunction, Request, Response } from 'express';
import { CreateUserDto, UpdateUserDto, UploadAvartarDto } from '@dtos/users.dto';
import { InsensitiveUserData, User } from '@interfaces/users.interface';
import userService from '@services/users.service';
import { getLocalFilePath, getStaticAvatarFilePath } from '@/utils/fileUtils';

class UsersController {
  public userService = new userService();

  public getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllUsersData: InsensitiveUserData[] = await this.userService.findAllUser();

      res.status(200).json({ data: findAllUsersData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId: string = req.params.id;
      const findOneUserData: InsensitiveUserData = await this.userService.findUserById(userId);

      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDto = req.body;
      const createUserData: User = await this.userService.createUser(userData);

      res.status(201).json({ data: createUserData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId: string = req.params.id;
      const userData: UpdateUserDto = req.body;
      const updateUserData: InsensitiveUserData = await this.userService.updateUser(userId, userData);

      res.status(200).json({ data: updateUserData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId: string = req.params.id;
      const deleteUserData: User = await this.userService.deleteUser(userId);

      res.status(200).json({ data: deleteUserData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const uploadAvatarData: UploadAvartarDto = req.body;
      const avatarLocalPath = getLocalFilePath(req);
      const avatar = getStaticAvatarFilePath(req);
      await this.userService.uploadUserAvatar(uploadAvatarData.userId, avatar, avatarLocalPath);
      res.status(200).json({ message: 'Uploaded new avatar', data: { avatar } });
    } catch (error) {
      next(error);
    }
  };
}

export default UsersController;
