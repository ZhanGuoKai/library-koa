import createCode from '../utils/captcha';
import { login, register } from '../services/auth-service';

/** @typedef {import('koa-router').IMiddleware} IMiddleware 路由中间件 */

/** @class 身份验证控制层 */
class AuthController {
  /** @type {IMiddleware} 获取验证码 */
  static async getCode(ctx, next) {
    const code = createCode();
    ctx.session.captcha = code.text.toLowerCase();
    ctx.response.type = 'svg';
    ctx.body = code.data;
  }

  /** @type {IMiddleware} 用户登录 */
  static async login(ctx, next) {
    const captcha = ctx.session.captcha;
    ctx.session.captcha = '';
    ctx.body = await login(ctx.request.body, captcha);
  }

  /** @type {IMiddleware} 用户注册 */
  static async register(ctx, next) {
    const captcha = ctx.session.captcha;
    ctx.session.captcha = '';
    ctx.body = await register(ctx.request.body, captcha);
  }

}

export default AuthController;
