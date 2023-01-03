import ResModel from '../models/res';
import { redisGet } from '../utils/store';

/** @type {import('koa').Middleware} 验证身份 */
export default async function (ctx, next) {
  const user = ctx.state.user;
  if (user) {
    const jwt = await redisGet(`jwt_${user.id}`);
    const token = ctx.header.authorization.trim().split(' ')[1];
    if (jwt != token) {
      ctx.body = ResModel.error('登录过期', 100);
      return;
    }
  }
  await next();
}
