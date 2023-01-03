import ResModel from '../models/res';

/** @type {import('koa-router').IMiddleware} 判断身份信息 */
export default async function (ctx, next) {
  if (ctx.state.user) {
    if (isNaN(ctx.state.user.id)) ctx.body = ResModel.error('用户信息错误', 902);
    else await next();
  } else {
    ctx.body = ResModel.error('登录过期，请重新登录', 901);
  }
}
