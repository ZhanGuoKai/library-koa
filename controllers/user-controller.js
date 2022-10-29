import { getInfo } from '../services/user-service';

/** @typedef {import('koa-router').IMiddleware} IMiddleware 路由中间件 */

/** @class 用户控制层 */
class UserController {
  /** @type {IMiddleware} 获取用户信息 */
  static async getInfo(ctx, next) {
    ctx.body = await getInfo(ctx.session.user && ctx.session.user.id);
  }
}

export default UserController;
