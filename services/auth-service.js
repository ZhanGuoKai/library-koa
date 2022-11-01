import User from '../models/user';
import ResModel from '../models/res';
import { getToken } from '../utils/auth';
import { redisDel, redisGet, redisSet } from '../utils/store';
import { sendEmail, getCodeHTML } from '../utils/mailer';
import { TOKEN_EXPIRES_TIME } from '../config';

/** @constant {RegExp} 验证邮箱正则表达式 */
const emailReg =
  /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;

/** @class 身份验证业务层 */
class AuthService {
  /**
   * 发送邮箱验证码
   *
   * @param {Object} emailInfo 邮箱信息
   * @param {string} emailInfo.email 邮箱地址
   * @param {string} ip 客户端ip地址
   * @returns {Promise<ResModel>}
   */
  static async sendCode({ email }, ip) {
    // 非空判断
    if (!email) return ResModel.error('邮箱不能为空', 201);

    // 合法判断
    if (!emailReg.test(email)) return ResModel.error('邮箱格式错误', 301);

    const ipKey = `email_ip_${ip}`;
    const toKey = `email_to_${email}`;
    if ((await redisGet(ipKey)) || (await redisGet(toKey)))
      return ResModel.error('请求过于频繁', 302);

    // 避免频繁发送验证码
    redisSet(ipKey, 1, 60);
    redisSet(toKey, 1, 60);

    // 生成随机的6位验证码
    const code = Math.random().toString(16).slice(2, 8).toUpperCase();
    try {
      await sendEmail(
        email,
        '图书管理系统邮箱验证',
        `感谢您使用图书管理系统，您的账号正在进行邮箱验证，验证码为：${code}，有效期为5分钟。`,
        getCodeHTML(code)
      );
    } catch (error) {
      return ResModel.error('发送邮箱失败', 401);
    }
    redisSet(`email_code_${email}`, code, 300);
    return ResModel.success('发送邮箱成功');
  }

  /**
   * 账号密码登录
   *
   * @param {Object} loginInfo 登录信息
   * @param {string} loginInfo.username 用户名
   * @param {string} loginInfo.password 密码
   * @param {string} loginInfo.code 验证码
   * @param {string} captcha 验证码
   * @returns {Promise<ResModel>}
   */
  static async loginByPassword({ username, password, code }, captcha) {
    // 非空判断
    if (!code) return ResModel.error('验证码不能为空', 201);
    if (!username) return ResModel.error('用户名不能为空', 202);
    if (!password) return ResModel.error('密码不能为空', 203);

    // 合法判断
    if (username.length < 4) return ResModel.error('用户名太短', 301);
    if (username.length > 20) return ResModel.error('用户名太长', 302);
    if (password.length < 6) return ResModel.error('密码太短', 303);
    if (password.length > 20) return ResModel.error('密码太长', 304);
    if (!/^[a-zA-Z\d]*$/.test(username))
      return ResModel.error('用户名只能包含数字或字母', 305);
    if (!/^(?=.*\d)(?=.*[a-zA-Z])[\da-zA-Z]*$/.test(password))
      return ResModel.error('密码必须且只能包含数字和字母', 306);

    if (code.toLowerCase() !== captcha)
      return ResModel.error('验证码错误', 401);

    const user = await User.findOne({ where: { username, password } });
    if (user === null) return ResModel.error('账号或密码错误', 402);

    const token = getToken({ id: user.id });
    await redisSet(`jwt_${user.id}`, token, TOKEN_EXPIRES_TIME);
    return ResModel.success('登录成功', { token, role: user.role });
  }

  /**
   * 邮箱验证码登录
   *
   * @param {Object} loginInfo 登录信息
   * @param {string} loginInfo.email 邮箱
   * @param {string} loginInfo.code 验证码
   * @returns {Promise<ResModel>}
   */
  static async loginByEmail({ email, code }) {
    // 非空判断
    if (!email) return ResModel.error('邮箱不能为空', 201);
    if (!code) return ResModel.error('验证码不能为空', 202);

    // 合法判断
    if (!emailReg.test(email)) return ResModel.error('邮箱格式错误', 301);

    if (code.toUpperCase() !== (await redisGet(`email_code_${email}`)))
      return ResModel.error('验证码错误', 401);

    const user = await User.findOne({ where: { email } });
    if (user === null) return ResModel.error('用户不存在', 402);

    const token = getToken({ id: user.id });
    await redisSet(`jwt_${user.id}`, token, TOKEN_EXPIRES_TIME);
    redisDel(`email_code_${email}`);
    return ResModel.success('登录成功', { token, role: user.role });
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
  static async register({ username, password, email, code }) {
    // 非空判断
    if (!code) return ResModel.error('验证码不能为空', 201);
    if (!username) return ResModel.error('用户名不能为空', 202);
    if (!password) return ResModel.error('密码不能为空', 203);
    if (!email) return ResModel.error('邮箱不能为空', 204);

    // 合法判断
    if (username.length < 4) return ResModel.error('用户名太短', 301);
    if (username.length > 20) return ResModel.error('用户名太长', 302);
    if (password.length < 6) return ResModel.error('密码太短', 303);
    if (password.length > 20) return ResModel.error('密码太长', 304);
    if (!/^[a-zA-Z\d]*$/.test(username))
      return ResModel.error('用户名只能包含数字或字母', 305);
    if (!/^(?=.*\d)(?=.*[a-zA-Z])[\da-zA-Z]*$/.test(password))
      return ResModel.error('密码必须且只能包含数字和字母', 306);
    if (!emailReg.test(email)) return ResModel.error('邮箱格式错误', 307);

    if (code.toUpperCase() !== (await redisGet(`email_code_${email}`)))
      return ResModel.error('验证码错误', 401);
    if (await User.findOne({ where: { username } }))
      return ResModel.error('用户名已存在', 402);
    if (await User.findOne({ where: { email } }))
      return ResModel.error('邮箱已注册', 403);

    redisDel(`email_code_${email}`);

    const user = await User.create({ username, password, email });
    const token = getToken({ id: user.id });
    await redisSet(`jwt_${user.id}`, token, TOKEN_EXPIRES_TIME);
    return ResModel.success('注册成功', { token, role: user.role });
  }
}

export default AuthService;
