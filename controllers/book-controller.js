import BookService from '../services/book-service';

/** @typedef {import('koa-router').IMiddleware} Middleware 路由中间件 */

/** 图书控制层 */
class BookController {
  /** @type {Middleware} 获取图书信息 */
  static async getDetails(ctx, next) {
    ctx.body = await BookService.getDetails(ctx.query);
  }

  /** @type {Middleware} 获取图书信息 */
  static async search(ctx, next) {
    ctx.body = await BookService.search(
      ctx.state.user && ctx.state.user.id,
      ctx.query
    );
  }
}

export default BookController;
