import ResModel from '../models/res';

/** @type {import('koa-router').IMiddleware} 验证管理员身份 */
export default async function (ctx, next) {
  if (ctx.state.user) {
    if (ctx.state.user.role === 1) await next();
    else ctx.body = ResModel.error('没有管理员权限，无法操作', 902);
  } else {
    ctx.body = ResModel.error('登录过期，请重新登录', 901);
  }
}
