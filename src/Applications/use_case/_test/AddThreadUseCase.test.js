import { vi } from 'vitest';
import NewThread from '../../../Domains/threads/entities/NewThread.js';
import AddedThread from '../../../Domains/threads/entities/AddedThread.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import AddThreadUseCase from '../AddThreadUseCase.js';

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'sebuah thread',
      body: 'isi body thread',
    };
    const owner = 'user-123';
    
    const expectedAddedThread = new AddedThread({
      id: 'thread-123',
      // title: useCasePayload.title,
      title: 'TITLE SALAH',
      owner,
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.addThread = vi.fn()
      .mockImplementation(() => Promise.resolve(new AddedThread({
        id: 'thread-123',
        title: useCasePayload.title,
        owner,
      })));

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedThread = await addThreadUseCase.execute(useCasePayload, owner);

    // Assert
    expect(addedThread).toStrictEqual(expectedAddedThread);
    expect(mockThreadRepository.addThread).toBeCalledWith(new NewThread({
      title: useCasePayload.title,
      body: useCasePayload.body,
    }), owner);
  });
});