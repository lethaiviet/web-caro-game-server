import { Router } from 'express';
import UsersController from '@controllers/users.controller';
import { CreateUserDto, UpdateUserDto, UploadAvartarDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import uploadFileMiddleware from '@/middlewares/uploadFile.middleware';

class UsersRoute implements Routes {
  public path = '/users';
  public router = Router();
  public usersController = new UsersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.usersController.getUsers);
    this.router.get(`${this.path}/:id`, this.usersController.getUserById);

    this.router.post(`${this.path}`, validationMiddleware(CreateUserDto, 'body'), this.usersController.createUser);
    this.router.post(
      `${this.path}/upload-avatar`,
      uploadFileMiddleware.single('image'),
      validationMiddleware(UploadAvartarDto, 'body'),
      this.usersController.uploadAvatar,
    );

    this.router.put(`${this.path}/:id`, validationMiddleware(UpdateUserDto, 'body'), this.usersController.updateUser);

    this.router.delete(`${this.path}/:id`, this.usersController.deleteUser);
  }
}

export default UsersRoute;
