import Router from 'koa-router';
import AdminController from '../controllers/admin-controller';
import admin from '../middlewares/admin';

const router = new Router();

router.prefix('/admin');

router.use(admin);
router.get('/borrowers', AdminController.getBorrowers);
router.post('/enter-book', AdminController.enterBook);

export default router;
