import createCode from '../utils/captcha';
import AuthService from '../services/auth-service';

/** @typedef {import('koa-router').IMiddleware} Middleware 路由中间件 */

/** @class 身份验证控制层 */
class AuthController {
  /** @type {Middleware} 获取验证码 */
  static async getCode(ctx, next) {
    const code = createCode();
    ctx.session.captcha = code.text.toLowerCase();
    ctx.response.type = 'svg';
    ctx.body = code.data;
  }

  /** @type {Middleware} 发送验证码 */
  static async sendCode(ctx, next) {
    ctx.body = await AuthService.sendCode(ctx.request.body, ctx.request.ip);
  }

  /** @type {Middleware} 账号密码登录 */
  static async loginByPassword(ctx, next) {
    const captcha = ctx.session.captcha;
    ctx.session.captcha = '';
    ctx.body = await AuthService.loginByPassword(ctx.request.body, captcha);
  }

  /** @type {Middleware} 邮箱登录 */
  static async loginByEmail(ctx, next) {
    ctx.body = await AuthService.loginByEmail(ctx.request.body);
  }

  /** @type {Middleware} 用户注册 */
  static async register(ctx, next) {
    ctx.body = await AuthService.register(ctx.request.body);
  }
}

export default AuthController;
