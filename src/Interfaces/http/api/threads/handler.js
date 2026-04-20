import AddThreadUseCase from '../../../../Applications/use_case/AddThreadUseCase.js';
import AddCommentUseCase from '../../../../Applications/use_case/AddCommentUseCase.js';
import DeleteCommentUseCase from '../../../../Applications/use_case/DeleteCommentUseCase.js';
import GetDetailThreadUseCase from '../../../../Applications/use_case/GetDetailThreadUseCase.js';

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.getDetailThreadHandler = this.getDetailThreadHandler.bind(this);
  }

  async postThreadHandler(req, res, next) {
    try {
      const { id: owner } = req.auth;
      const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
      const addedThread = await addThreadUseCase.execute(req.body, owner);

      res.status(201).json({ status: 'success', data: { addedThread } });
    } catch (error) { next(error); }
  }

  async postCommentHandler(req, res, next) {
    try {
      const { id: owner } = req.auth;
      const { threadId } = req.params;
      const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
      const addedComment = await addCommentUseCase.execute(req.body, threadId, owner);

      res.status(201).json({ status: 'success', data: { addedComment } });
    } catch (error) { next(error); }
  }

  async deleteCommentHandler(req, res, next) {
    try {
      const { id: owner } = req.auth;
      const { threadId, commentId } = req.params;
      const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
      await deleteCommentUseCase.execute(threadId, commentId, owner);

      res.json({ status: 'success' });
    } catch (error) { next(error); }
  }

  async getDetailThreadHandler(req, res, next) {
    try {
      const { threadId } = req.params;
      const getDetailThreadUseCase = this._container.getInstance(GetDetailThreadUseCase.name);
      const thread = await getDetailThreadUseCase.execute(threadId);

      res.json({ status: 'success', data: { thread } });
    } catch (error) { next(error); }
  }
}
export default ThreadsHandler;