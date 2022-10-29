import seq, { STRING, INTEGER } from '../utils/seq';

const User = seq.define('user', {
  id: {
    type: INTEGER,
    allowNull: false,
    unique: true,
    primaryKey: true,
    comment: '用户编码',
    autoIncrement: true
  },
  username: {
    type: STRING,
    allowNull: false,
    comment: '用户名'
  },
  password: {
    type: STRING,
    allowNull: false,
    comment: '密码'
  },
  role: {
    type: INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '角色类型：0为普通用户，1为管理员'
  }
});

export default User;
