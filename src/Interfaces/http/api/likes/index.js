import { Router } from 'express';
import LikesHandler from './handler.js';
import routes from './routes.js';

export default (container) => {
  const router = Router();
  const handler = new LikesHandler(container);

  routes(handler).forEach((route) => {
    router[route.method](route.path, route.handler);
  });

  return router;
};