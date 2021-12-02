import express, { RequestHandler } from 'express';
import cors from 'cors';
import Logger from '../libs/logger';
import apis from './api';
import middlewares from '../middlewares/middleFunctions';
import { expressHandler } from '../interfaces/expressHandler';
import validator from '../middlewares/validator';

async function ExpressServer() {
  const app = express();
  const logger = Logger.create('EXPRESS SERVER');
  // add cors
  app.use(cors());
  // setup middleware
  app.use(...middlewares);
  // setup apis
  apis.forEach(async (api: expressHandler) => {
    const funcs: RequestHandler[] = [];
    // setup custom middleware
    if (api.customMiddleWares && api.customMiddleWares.length > 0) {
      funcs.push(...api.customMiddleWares);
    }
    // setup validator
    if (api.params) funcs.push(validator);
    // add handler
    funcs.push(api.action);
    // register api
    switch (api.method.toLowerCase()) {
      case 'get':
        app.get(`${api.path}`, ...funcs);
        break;
      case 'post':
        app.post(`${api.path}`, ...funcs);
        break;
      case 'delete':
        app.delete(`${api.path}`, ...funcs);
        break;
      case 'put':
        app.put(`${api.path}`, ...funcs);
        break;
      case 'patch':
        app.patch(`${api.path}`, ...funcs);
        break;
      default:
        app.all(`${api.path}`, ...funcs);
        break;
    }
  });
  // start server
  const port = process.env.HTTP_PORT || process.env.PORT || 8080;
  app.listen(port, () => {
    logger.info('SERVER STARTED AT', port);
  });
}
export default ExpressServer;
