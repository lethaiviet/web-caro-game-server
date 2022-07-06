import { type } from 'os';

export interface User {
  _id: string;
  email: string;
  password: string;
  status: string;
  accessToken: string;
  bio: string;
  name: string;
  avatar: string;
  avatarLocalPath: string;
  exp: number;
}

export type InsensitiveUserData = Omit<User, 'password' | 'avatarLocalPath' | 'accessToken'>;

export interface LoginedUserData {
  _id: string;
  accessToken: string;
}

type Status = 'Online' | 'Offline';

export interface UserStates {
  _id: string;
  status: Status;
  name: string;
  avatar: string;
}
