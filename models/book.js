import seq, { STRING, INTEGER, TEXT, DATE, DECIMAL } from '../utils/seq';

const Book = seq.define('book', {
  id: {
    type: INTEGER,
    allowNull: false,
    unique: true,
    primaryKey: true,
    autoIncrement: true,
    comment: '图书编号'
  },
  name: {
    type: STRING(200),
    allowNull: false,
    comment: '书名'
  },
  author: {
    type: STRING(50),
    allowNull: true,
    comment: '作者'
  },
  publishing: {
    type: STRING(50),
    allowNull: true,
    comment: '出版社'
  },
  translator: {
    type: STRING(50),
    allowNull: true,
    comment: '译者'
  },
  published: {
    type: DATE,
    allowNull: true,
    comment: '出版时间'
  },
  pages: {
    type: INTEGER,
    allowNull: false,
    comment: '页数'
  },
  code: {
    type: STRING(20),
    allowNull: false,
    unique: true,
    comment: 'ISBN编码'
  },
  price: {
    type: DECIMAL(10, 2),
    allowNull: true,
    comment: '价格'
  },
  description: {
    type: TEXT,
    allowNull: true,
    comment: '图书简介'
  },
  authorIntro: {
    type: TEXT,
    allowNull: true,
    comment: '作者简介'
  },
  photoUrl: {
    type: STRING(20),
    allowNull: true,
    comment: '图书封面地址'
  },
  num: {
    type: INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '图书总数'
  },
  borrowedNum: {
    type: INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '借出的数量'
  }
});

export default Book;
