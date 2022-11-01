const Koa = require('koa');
const app = new Koa();
const json = require('koa-json');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const cors = require('koa-cors');
const session = require('koa-generic-session');

import jwt from 'koa-jwt';
import { SECRET, SESSION_MAX_AGE } from './config';
import auth from './middlewares/auth';
import index from './routes/index';

// session
app.keys = [SECRET];
app.use(
  session({
    cookie: {
      path: '/',
      httpOnly: true,
      maxAge: SESSION_MAX_AGE
    }
  })
);

// middlewares
app.use(
  bodyparser({
    enableTypes: ['json', 'form', 'text']
  })
);
app.use(json());
app.use(logger());
app.use(require('koa-static')(__dirname + '/public'));
app.use(cors());

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// jwt鉴权
app.use(jwt({ secret: SECRET, debug: true }).unless({ path: [/^\/auth/] }));

// 判断是否存在异地登录
app.use(auth);

// routes
app.use(index.routes(), index.allowedMethods());

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx);
});

module.exports = app;
