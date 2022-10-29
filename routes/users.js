import Router from 'koa-router';
import UserController from '../controllers/user-controller';

const router = new Router();

router.prefix('/users');

router.get('/info', UserController.getInfo)

export default router;
