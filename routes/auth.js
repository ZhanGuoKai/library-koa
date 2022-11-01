import Router from 'koa-router';
import AuthController from '../controllers/auth-controller';

const router = new Router();

router.prefix('/auth');

router.get('/code', AuthController.getCode);
router.post('/send-code', AuthController.sendCode);
router.post('/password-login', AuthController.loginByPassword);
router.post('/email-login', AuthController.loginByEmail);
router.post('/register', AuthController.register);

export default router;
