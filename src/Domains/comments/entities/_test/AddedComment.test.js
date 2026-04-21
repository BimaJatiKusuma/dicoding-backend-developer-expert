import AddedComment from '../AddedComment.js';

describe('a AddedComment entities', () => {
  it('should create addedComment object correctly', () => {
    const payload = { id: 'comment-123', content: 'sebuah komentar', owner: 'user-123' };
    const addedComment = new AddedComment(payload);
    expect(addedComment.id).toEqual(payload.id);
    expect(addedComment.content).toEqual(payload.content);
    expect(addedComment.owner).toEqual(payload.owner);
  });
});