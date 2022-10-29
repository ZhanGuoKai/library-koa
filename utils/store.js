import redisStore from 'koa-redis';
import { createClient } from 'redis';
import { REDIS } from '../config';

export const client = createClient(REDIS);
client.on('ready', () => console.log('Redis is ready.'));
client.on('error', err => console.error('Redis client error', err));
(async () => await client.connect())();

export default redisStore({ client });

/**
 * 设置redis
 *
 * @param {string} key 键
 * @param {*} val 值
 * @param {number=} timeout 有效时间
 */
export async function setRedis(key, val, timeout = 60 * 60) {
  if (typeof val == 'object') {
    val = JSON.stringify(val);
  }
  await client.set(key, val);
  await client.expire(key, timeout);
};

/**
 * 获取redis对应键的值
 *
 * @param {string} key 键
 * @returns {Promise<*>}
 */
export async function getRedis(key) {
  const val = await client.get(key);
  if (val == null) return null;
  try {
    const obj = JSON.parse(val);
    return obj;
  } catch (error) {
    return val;
  }
};
