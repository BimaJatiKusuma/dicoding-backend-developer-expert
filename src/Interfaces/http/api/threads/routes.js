import express from 'express';
import authMiddleware from '../../middleware/auth.js';

const createThreadsRouter = (handler) => {
  const router = express.Router();

  router.post('/', authMiddleware, handler.postThreadHandler);
  router.get('/:threadId', handler.getDetailThreadHandler);
  
  router.post('/:threadId/comments', authMiddleware, handler.postCommentHandler);
  router.delete('/:threadId/comments/:commentId', authMiddleware, handler.deleteCommentHandler);

  return router;
};
export default createThreadsRouter;