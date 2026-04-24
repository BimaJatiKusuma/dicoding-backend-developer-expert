class LikesHandler {
  constructor(container) {
    this._container = container;
    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async putLikeHandler(req, res, next) {
    try {
      const { threadId, commentId } = req.params;
      const { id: userId } = req.user; // Pastikan middleware auth Anda menyuntikkan req.user

      const toggleLikeCommentUseCase = this._container.getInstance('ToggleLikeCommentUseCase');
      await toggleLikeCommentUseCase.execute(userId, threadId, commentId);

      return res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      next(error);
    }
  }
}
export default LikesHandler;