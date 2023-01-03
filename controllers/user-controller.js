import UserService from '../services/user-service';

/** @typedef {import('koa-router').IMiddleware} Middleware 路由中间件 */

/** @class 用户控制层 */
class UserController {
  /** @type {Middleware} 获取用户信息 */
  static async getInfo(ctx, next) {
    ctx.body = await UserService.getInfo(ctx.state.user.id);
  }

  /** @type {Middleware} 用户申请借书 */
  static async borrow(ctx, next) {
    ctx.body = await UserService.borrow(ctx.state.user.id, ctx.request.body);
  }

  /** @type {Middleware} 用户申请还书 */
  static async returnBook(ctx, next) {
    ctx.body = await UserService.returnBook(
      ctx.state.user.id,
      ctx.request.body
    );
  }

  /** @type {Middleware} 用户获取借阅记录 */
  static async getHistory(ctx, next) {
    ctx.body = await UserService.getHistory(ctx.state.user.id, ctx.query);
  }

  /** @type {Middleware} 用户获取借阅记录 */
  static async getRecommended(ctx, next) {
    ctx.body = await UserService.getRecommended(ctx.state.user.id);
  }

  /** @type {Middleware} 登出 */
  static async logout(ctx, next) {
    ctx.body = await UserService.logout(ctx.state.user.id);
  }
}

export default UserController;
