import Router from 'koa-router';
import AuthController from '../controllers/auth-controller';

const router = new Router();

router.prefix('/auth');

router.get('/code', AuthController.getCode);
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);

export default router;
