import AdminService from '../services/admin-service';

/** @typedef {import('koa-router').IMiddleware} Middleware 路由中间件 */

/** @class 用户控制层 */
class AdminController {
  /** @type {Middleware} 获取借阅者信息 */
  static async getBorrowers(ctx, next) {
    ctx.body = await AdminService.getBorrowers(ctx.query);
  }

  /** @type {Middleware} 录入图书 */
  static async enterBook(ctx, next) {
    ctx.body = await AdminService.enterBook(ctx.request.body);
  }
}

export default AdminController;
