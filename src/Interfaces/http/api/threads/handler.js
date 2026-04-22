import AddThreadUseCase from '../../../../Applications/use_case/AddThreadUseCase.js';
import GetDetailThreadUseCase from '../../../../Applications/use_case/GetDetailThreadUseCase.js';

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
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