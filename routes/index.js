import Router from 'koa-router';
import redis, { redisGet } from '../utils/store';

import auth from './auth';
import book from './book';
import user from './user';
import admin from './admin';

const router = new Router();

router.use(auth.routes(), auth.allowedMethods());
router.use(book.routes(), book.allowedMethods());
router.use(user.routes(), user.allowedMethods());
router.use(admin.routes(), admin.allowedMethods());

export default router;
