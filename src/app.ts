import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { createServer, Server as httpServer } from 'http';
import { Server } from 'socket.io';
import { connect, set } from 'mongoose';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS } from '@config';
import { dbConnection } from '@databases';
import { Routes } from '@interfaces/routes.interface';
import errorMiddleware from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';
import { ASSETS_FOLDER } from './utils/fileUtils';
import ChatSpace from './socket-name-spaces/chat.space';
import GameSpace from './socket-name-spaces/game.space';
import socketAuthMiddleware from './middlewares/socketAuth.middleware';
import { SocketIOService } from './services/socketio.service';

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  public httpServer: httpServer;
  public socketControl: Server;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;
    this.httpServer = createServer(this.app);
    this.socketControl = SocketIOService.getInstance().initialize(this.httpServer);

    this.connectToDatabase();
    this.initializeServingStaticFiles();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    // this.initializeSwagger();
    this.initializeErrorHandling();
    this.initializeSocketio();
  }

  public listen() {
    this.httpServer.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.httpServer;
  }

  private connectToDatabase() {
    if (this.env !== 'production') {
      set('debug', true);
    }

    connect(dbConnection.url, dbConnection.options)
      .then(() => logger.info(`Connected successfully to database url ${dbConnection.url}`))
      .catch(e => logger.error(`Cannot connected to database url ${dbConnection.url} with ${e}`));
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(cors({ origin: ORIGIN.split(','), credentials: CREDENTIALS }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
  }

  private initializeServingStaticFiles() {
    this.app.use('/static', express.static(ASSETS_FOLDER));
  }

  private initializeSocketio() {
    this.socketControl.of('/chat').use(socketAuthMiddleware).on('connection', ChatSpace.initConnection);
    this.socketControl.of('/game').use(socketAuthMiddleware).on('connection', GameSpace.initConnection);
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: 'REST API',
          version: '1.0.0',
          description: 'Example docs',
        },
      },
      apis: ['swagger.yaml'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
