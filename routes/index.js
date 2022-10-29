import Router from 'koa-router';

import users from './users';
import auth from './auth';

const router = new Router();

router.use(users.routes(), users.allowedMethods());
router.use(auth.routes(), auth.allowedMethods());

export default router;
