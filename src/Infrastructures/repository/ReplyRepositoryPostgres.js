import AddedReply from '../../Domains/replies/entities/AddedReply.js';
import ReplyRepository from '../../Domains/replies/ReplyRepository.js';
import NotFoundError from '../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../Commons/exceptions/AuthorizationError.js';

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(newReply, commentId, owner) {
    const { content } = newReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, commentId, content, owner, date, false],
    };

    const result = await this._pool.query(query);
    return new AddedReply(result.rows[0]);
  }

  async verifyReplyAvailability(replyId) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1',
      values: [replyId],
    };
    const result = await this._pool.query(query);
    if (result.rowCount === 0) throw new NotFoundError('balasan tidak ditemukan');
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId],
    };
    const result = await this._pool.query(query);
    if (result.rowCount === 0) throw new NotFoundError('balasan tidak ditemukan');
    if (result.rows[0].owner !== owner) throw new AuthorizationError('anda tidak berhak mengakses balasan ini');
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = true WHERE id = $1',
      values: [replyId],
    };
    await this._pool.query(query);
  }

  async getRepliesByThreadId(threadId) {
    const query = {
      text: `SELECT replies.id, replies.comment_id, replies.content, replies.date, replies.is_delete, users.username
             FROM replies
             JOIN users ON replies.owner = users.id
             JOIN comments ON replies.comment_id = comments.id
             WHERE comments.thread_id = $1
             ORDER BY replies.date ASC`,
      values: [threadId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }
}
export default ReplyRepositoryPostgres;