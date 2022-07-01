import { Router } from 'express';
import UsersController from '@controllers/users.controller';
import { CreateUserDto, UpdateUserDto, UploadAvartarDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import uploadFileMiddleware from '@/middlewares/uploadFile.middleware';
import authMiddleware from '@/middlewares/auth.middleware';

class UsersRoute implements Routes {
  public path = '/users';
  public router = Router();
  public usersController = new UsersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, this.usersController.getUsers);
    this.router.get(`${this.path}/:id`, authMiddleware, this.usersController.getUserById);

    this.router.post(`${this.path}`, validationMiddleware(CreateUserDto, 'body'), this.usersController.createUser);
    this.router.post(
      `${this.path}/upload-avatar`,
      authMiddleware,
      uploadFileMiddleware.single('image'),
      validationMiddleware(UploadAvartarDto, 'body'),
      this.usersController.uploadAvatar,
    );

    this.router.put(`${this.path}/:id`, authMiddleware, validationMiddleware(UpdateUserDto, 'body'), this.usersController.updateUser);

    this.router.delete(`${this.path}/:id`, authMiddleware, this.usersController.deleteUser);
  }
}

export default UsersRoute;
