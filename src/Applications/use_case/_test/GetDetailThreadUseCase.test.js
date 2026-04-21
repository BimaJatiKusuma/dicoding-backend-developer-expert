import { vi } from 'vitest';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import GetDetailThreadUseCase from '../GetDetailThreadUseCase.js';

describe('GetDetailThreadUseCase', () => {
  it('should orchestrating the get detail thread action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    
    const mockThread = { id: threadId, title: 'sebuah thread', body: 'isi body', date: '2023-01-01', username: 'dicoding' };
    
    const mockComments = [
      { id: 'comment-1', username: 'johndoe', date: '2023-01-01', content: 'komentar 1', is_delete: false },
      { id: 'comment-2', username: 'dicoding', date: '2023-01-01', content: 'komentar 2', is_delete: true },
    ];

    const mockReplies = [
      { id: 'reply-1', comment_id: 'comment-1', content: 'balasan 1', date: '2023-01-01', username: 'johndoe', is_delete: false },
      { id: 'reply-2', comment_id: 'comment-1', content: 'balasan 2', date: '2023-01-01', username: 'dicoding', is_delete: true },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = vi.fn().mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = vi.fn().mockImplementation(() => Promise.resolve(mockComments));
    mockReplyRepository.getRepliesByThreadId = vi.fn().mockImplementation(() => Promise.resolve(mockReplies));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const detailThread = await getDetailThreadUseCase.execute(threadId);

    // Assert
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(threadId);

    // Assert mapping logic
    expect(detailThread.id).toEqual(mockThread.id);
    expect(detailThread.comments).toHaveLength(2);
    
    // Assert non-deleted comment and replies
    expect(detailThread.comments[0].content).toEqual('komentar 1');
    expect(detailThread.comments[0].replies).toHaveLength(2);
    expect(detailThread.comments[0].replies[0].content).toEqual('balasan 1');
    expect(detailThread.comments[0].replies[1].content).toEqual('**balasan telah dihapus**');

    // Assert deleted comment
    expect(detailThread.comments[1].content).toEqual('**komentar telah dihapus**');
    expect(detailThread.comments[1].replies).toHaveLength(0);
  });
});