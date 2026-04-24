import ToggleLikeCommentUseCase from '../ToggleLikeCommentUseCase.js';

describe('ToggleLikeCommentUseCase', () => {
  it('should orchestrate the add like action correctly if not liked yet', async () => {
    const mockThreadRepository = { verifyThreadAvailability: vi.fn().mockResolvedValue() };
    const mockCommentRepository = { verifyCommentAvailability: vi.fn().mockResolvedValue() };
    const mockLikeRepository = {
      checkIsLiked: vi.fn().mockResolvedValue(false),
      addLike: vi.fn().mockResolvedValue(),
      deleteLike: vi.fn().mockResolvedValue(),
    };

    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    await toggleLikeCommentUseCase.execute('user-123', 'thread-123', 'comment-123');

    expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.verifyCommentAvailability).toHaveBeenCalledWith('comment-123');
    expect(mockLikeRepository.checkIsLiked).toHaveBeenCalledWith('user-123', 'comment-123');
    expect(mockLikeRepository.addLike).toHaveBeenCalledWith('user-123', 'comment-123');
    expect(mockLikeRepository.deleteLike).not.toHaveBeenCalled();
  });

  it('should orchestrate the delete like action correctly if already liked', async () => {
    const mockThreadRepository = { verifyThreadAvailability: vi.fn().mockResolvedValue() };
    const mockCommentRepository = { verifyCommentAvailability: vi.fn().mockResolvedValue() };
    const mockLikeRepository = {
      checkIsLiked: vi.fn().mockResolvedValue(true),
      addLike: vi.fn().mockResolvedValue(),
      deleteLike: vi.fn().mockResolvedValue(),
    };

    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    await toggleLikeCommentUseCase.execute('user-123', 'thread-123', 'comment-123');

    expect(mockLikeRepository.checkIsLiked).toHaveBeenCalledWith('user-123', 'comment-123');
    expect(mockLikeRepository.deleteLike).toHaveBeenCalledWith('user-123', 'comment-123');
    expect(mockLikeRepository.addLike).not.toHaveBeenCalled();
  });
});