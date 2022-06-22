import { DB_HOST, DB_PORT, DB_DATABASE } from '@config';

export const dbConnection = {
  url: `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`,
  options: {
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  },
};
