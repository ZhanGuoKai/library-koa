import Router from 'koa-router';
import UserController from '../controllers/user-controller';
import user from '../middlewares/user';

const router = new Router();

router.prefix('/user');

router.use(user);
router.get('/info', UserController.getInfo);
router.post('/borrow', UserController.borrow);
router.post('/return', UserController.returnBook);
router.get('/history', UserController.getHistory);
router.get('/recommended', UserController.getRecommended);
router.post('/logout', UserController.logout)

export default router;
