import User from './user';
import Book from './book';
import seq, { DATE, INTEGER, NOW } from '../utils/seq';

const Record = seq.define('record', {
  id: {
    type: INTEGER,
    allowNull: false,
    unique: true,
    primaryKey: true,
    autoIncrement: true,
    comment: '借阅编号'
  },
  userId: {
    type: INTEGER,
    allowNull: false,
    comment: '用户编号',
    references: {
      model: User,
      key: 'id'
    }
  },
  bookId: {
    type: INTEGER,
    allowNull: false,
    comment: '图书编号',
    references: {
      model: Book,
      key: 'id'
    }
  },
  borrowedTime: {
    type: DATE,
    allowNull: false,
    defaultValue: NOW,
    comment: '借阅时间'
  },
  returnedTime: {
    type: DATE,
    allowNull: true,
    comment: '归还时间'
  }
});

export default Record;
