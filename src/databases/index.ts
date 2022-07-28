import { DB_URL, DB_DATABASE } from '@config';

export const dbConnection = {
  url: `${DB_URL}/${DB_DATABASE}`,
  options: {
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  },
};
