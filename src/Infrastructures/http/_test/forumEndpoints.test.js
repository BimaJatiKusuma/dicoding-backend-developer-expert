import request from 'supertest';
import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import AuthenticationsTableTestHelper from '../../../../tests/AuthenticationsTableTestHelper.js';
import container from '../../container.js';
import createServer from '../createServer.js';

describe('Forum Endpoints', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  const getAccessTokenHelper = async (app, username = 'dicoding') => {
    await request(app).post('/users').send({
      username,
      password: 'secret_password',
      fullname: 'Dicoding Indonesia',
    });
    const response = await request(app).post('/authentications').send({
      username,
      password: 'secret_password',
    });
    return response.body.data.accessToken;
  };

  describe('Middleware auth.js', () => {
    it('should return 401 if authorization header is missing', async () => {
      const app = await createServer(container);
      const response = await request(app).post('/threads').send({
        title: 'sebuah thread',
        body: 'isi body',
      });
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual('Missing authentication');
    });

    it('should return 401 if authorization header not using Bearer', async () => {
      const app = await createServer(container);
      const response = await request(app)
        .post('/threads')
        .set('Authorization', 'Basic token')
        .send({
          title: 'sebuah thread',
          body: 'isi body',
        });
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual('Missing authentication');
    });

    it('should return 401 if token is invalid', async () => {
      const app = await createServer(container);
      const response = await request(app)
        .post('/threads')
        .set('Authorization', 'Bearer invalid_token')
        .send({
          title: 'sebuah thread',
          body: 'isi body',
        });
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual('Missing authentication');
    });
  });

  describe('when POST /threads', () => {
    it('should return 201 and added thread', async () => {
      const app = await createServer(container);
      const accessToken = await getAccessTokenHelper(app);

      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'sebuah thread',
          body: 'isi body',
        });

      expect(response.status).toEqual(201);
      expect(response.body.data.addedThread).toBeDefined();
    });
  });

  describe('when GET /threads/:threadId', () => {
    it('should return 200 and thread detail', async () => {
      const app = await createServer(container);
      const accessToken = await getAccessTokenHelper(app);

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'sebuah thread',
          body: 'isi body',
        });
      const threadId = threadRes.body.data.addedThread.id;

      const commentRes = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'sebuah komentar',
        });
      const commentId = commentRes.body.data.addedComment.id;

      await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'sebuah balasan',
        });

      const response = await request(app).get(`/threads/${threadId}`);
      expect(response.status).toEqual(200);
      expect(response.body.data.thread).toBeDefined();
      expect(response.body.data.thread.comments).toHaveLength(1);
      expect(response.body.data.thread.comments[0].replies).toHaveLength(1);
    });
  });

  describe('when POST /threads/:threadId/comments', () => {
    it('should return 201 and added comment', async () => {
      const app = await createServer(container);
      const accessToken = await getAccessTokenHelper(app);

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'sebuah thread',
          body: 'isi body',
        });
      const threadId = threadRes.body.data.addedThread.id;

      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'sebuah komentar',
        });

      expect(response.status).toEqual(201);
      expect(response.body.data.addedComment).toBeDefined();
    });
  });

  describe('when DELETE /threads/:threadId/comments/:commentId', () => {
    it('should return 200', async () => {
      const app = await createServer(container);
      const accessToken = await getAccessTokenHelper(app);

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'sebuah thread',
          body: 'isi body',
        });
      const threadId = threadRes.body.data.addedThread.id;

      const commentRes = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'sebuah komentar',
        });
      const commentId = commentRes.body.data.addedComment.id;

      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });

    it('should return 403 if not the owner of the comment', async () => {
      const app = await createServer(container);
      const accessToken1 = await getAccessTokenHelper(app, 'dicoding1');
      const accessToken2 = await getAccessTokenHelper(app, 'dicoding2');

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken1}`)
        .send({
          title: 'sebuah thread',
          body: 'isi body',
        });
      const threadId = threadRes.body.data.addedThread.id;

      const commentRes = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .send({
          content: 'sebuah komentar',
        });
      const commentId = commentRes.body.data.addedComment.id;

      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken2}`);

      expect(response.status).toEqual(403);
      expect(response.body.message).toEqual('anda tidak berhak mengakses komentar ini');
    });
  });

  describe('when POST /threads/:threadId/comments/:commentId/replies', () => {
    it('should return 201 and added reply', async () => {
      const app = await createServer(container);
      const accessToken = await getAccessTokenHelper(app);

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'sebuah thread',
          body: 'isi body',
        });
      const threadId = threadRes.body.data.addedThread.id;

      const commentRes = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'sebuah komentar',
        });
      const commentId = commentRes.body.data.addedComment.id;

      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'sebuah balasan',
        });

      expect(response.status).toEqual(201);
      expect(response.body.data.addedReply).toBeDefined();
    });
  });

  describe('when DELETE /threads/:threadId/comments/:commentId/replies/:replyId', () => {
    it('should return 200', async () => {
      const app = await createServer(container);
      const accessToken = await getAccessTokenHelper(app);

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'sebuah thread',
          body: 'isi body',
        });
      const threadId = threadRes.body.data.addedThread.id;

      const commentRes = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'sebuah komentar',
        });
      const commentId = commentRes.body.data.addedComment.id;

      const replyRes = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'sebuah balasan',
        });
      const replyId = replyRes.body.data.addedReply.id;

      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });

    it('should return 403 if not the owner of the reply', async () => {
      const app = await createServer(container);
      const accessToken1 = await getAccessTokenHelper(app, 'dicoding1');
      const accessToken2 = await getAccessTokenHelper(app, 'dicoding2');

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken1}`)
        .send({
          title: 'sebuah thread',
          body: 'isi body',
        });
      const threadId = threadRes.body.data.addedThread.id;

      const commentRes = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .send({
          content: 'sebuah komentar',
        });
      const commentId = commentRes.body.data.addedComment.id;

      const replyRes = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .send({
          content: 'sebuah balasan',
        });
      const replyId = replyRes.body.data.addedReply.id;

      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set('Authorization', `Bearer ${accessToken2}`);

      expect(response.status).toEqual(403);
      expect(response.body.message).toEqual('anda tidak berhak mengakses balasan ini');
    });
  });
});