import jwt from 'jsonwebtoken';
import { SECRET, TOKEN_EXPIRES_TIME } from '../config';

/**
 * 获取一个令牌
 *
 * @param {Object} payload 负载
 * @returns {string} 令牌
 */
export function getToken(payload = {}) {
  return jwt.sign(payload, SECRET, { expiresIn: TOKEN_EXPIRES_TIME });
}
