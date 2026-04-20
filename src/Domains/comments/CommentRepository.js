class CommentRepository {
  async addComment(newComment, threadId, owner) { throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED'); }
  async verifyCommentAvailability(commentId) { throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED'); }
  async verifyCommentOwner(commentId, owner) { throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED'); }
  async deleteComment(commentId) { throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED'); }
  async getCommentsByThreadId(threadId) { throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED'); }
}
export default CommentRepository;