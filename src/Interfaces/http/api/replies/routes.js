import express from 'express';
import authMiddleware from '../../middleware/auth.js';

const createRepliesRouter = (handler) => {
  const router = express.Router();

  router.post('/:threadId/comments/:commentId/replies', authMiddleware, handler.postReplyHandler);
  router.delete('/:threadId/comments/:commentId/replies/:replyId', authMiddleware, handler.deleteReplyHandler);

  return router;
};

export default createRepliesRouter;