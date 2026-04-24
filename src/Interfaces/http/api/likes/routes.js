import auth from '../../middleware/auth.js'; // Sesuaikan path dengan letak middleware auth Anda

const routes = (handler) => [
  {
    method: 'put', // Express routing
    path: '/threads/:threadId/comments/:commentId/likes',
    handler: [auth, handler.putLikeHandler], // Masukkan middleware auth sebelum handler
  },
];
export default routes;