import express from 'express';
import authMiddleware from '../../middleware/auth.js';

const createThreadsRouter = (handler) => {
  const router = express.Router();

  router.post('/', authMiddleware, handler.postThreadHandler);
  router.get('/:threadId', handler.getDetailThreadHandler);

  return router;
};

export default createThreadsRouter;