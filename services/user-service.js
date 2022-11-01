import ResModel from '../models/res';
import User from '../models/user';

/**
 * 
 * @param {number} id 用户编码
 * @returns {Promise<ResModel>}
 */
export async function getInfo(id) {
  // 非空判断
  if (!id) return ResModel.error('id不能为空');

  const user = await User.findByPk(id);
  if (user == null) return ResModel.error('id不存在', 201);
  return ResModel.success('获取成功', { username: user.username });
}
