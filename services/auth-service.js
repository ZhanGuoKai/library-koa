import { getToken } from '../utils/auth';
import User from '../models/user';
import ResModel from '../models/res';
import { setRedis } from '../utils/store';
import { TOKEN_EXPIRES_TIME } from '../config';

/**
 * 登录
 *
 * @param {Object} loginInfo 登录信息
 * @param {string} loginInfo.username 用户名
 * @param {string} loginInfo.password 密码
 * @param {string} loginInfo.code 验证码
 * @param {string} captcha 验证码
 * @returns {Promise<ResModel>}
 */
export async function login({ username, password, code }, captcha) {
  // 非空判断
  if (!code) return ResModel.error('验证码不能为空', 1011);
  if (!username) return ResModel.error('用户名不能为空', 1012);
  if (!password) return ResModel.error('密码不能为空', 1013);

  // 合法判断
  if (username.length < 4) return ResModel.error('用户名太短', 1021);
  if (username.length > 20) return ResModel.error('用户名太长', 1022);
  if (password.length < 6) return ResModel.error('密码太短', 1023);
  if (password.length > 20) return ResModel.error('密码太长', 1024);
  if (!/^[a-zA-Z\d]*$/.test(username))
    return ResModel.error('用户名只能包含数字或字母', 1025);
  if (!/^(?=.*\d)(?=.*[a-zA-Z])[\da-zA-Z]*$/.test(password))
    return ResModel.error('密码必须且只能包含数字和字母', 1026);

  if (code.toLowerCase() !== captcha) return ResModel.error('验证码错误', 1031);

  const user = await User.findOne({ where: { username, password } });
  if (user == null) return ResModel.error('账号或密码错误', 1032);

  const token = getToken({ id: user.id });
  await setRedis(`jwt_${user.id}`, token, TOKEN_EXPIRES_TIME);
  return ResModel.success('登录成功！', { token, role: user.role });
}

/**
 * 注册
 *
 * @param {Object} loginInfo 注册信息
 * @param {string} loginInfo.username 用户名
 * @param {string} loginInfo.password 密码
 * @param {string} loginInfo.code 验证码
 * @param {string} captcha 验证码
 * @returns {Promise<ResModel>}
 */
export async function register({ username, password, code }, captcha) {
  // 非空判断
  if (!code) return ResModel.error('验证码不能为空', 1011);
  if (!username) return ResModel.error('用户名不能为空', 1012);
  if (!password) return ResModel.error('密码不能为空', 1013);

  // 合法判断
  if (username.length < 4) return ResModel.error('用户名太短', 1021);
  if (username.length > 20) return ResModel.error('用户名太长', 1022);
  if (password.length < 6) return ResModel.error('密码太短', 1023);
  if (password.length > 20) return ResModel.error('密码太长', 1024);
  if (!/^[a-zA-Z\d]*$/.test(username))
    return ResModel.error('用户名只能包含数字或字母', 1025);
  if (!/^(?=.*\d)(?=.*[a-zA-Z])[\da-zA-Z]*$/.test(password))
    return ResModel.error('密码必须且只能包含数字和字母', 1026);

  if (code.toLowerCase() !== captcha) return ResModel.error('验证码错误', 1031);
  if (await User.findOne({ where: { username } }))
    return ResModel.error('用户名已存在', 1032);

  const user = await User.create({ username, password });
  const token = getToken({ id: user.id });
  await setRedis(`jwt_${user.id}`, token, TOKEN_EXPIRES_TIME);
  return ResModel.success('注册成功！', { token, role: user.role });
}
