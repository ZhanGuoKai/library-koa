import Router from 'koa-router';
import BookController from '../controllers/book-controller';

const router = new Router();

router.prefix('/book');

router.get('/details', BookController.getDetails);
router.get('/search', BookController.search);

export default router;