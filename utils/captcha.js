import { create } from 'svg-captcha';

/** 获取验证码 */
export default function () {
  return create({
    size: 4,
    width: 120,
    height: 34,
    ignoreChars: '0o1iIl',
    noise: 3,
    color: true,
    background: '#fff',
    fontSize: 60
  });
};
