import User from './user';
import Book from './book';
import seq, { BOOLEAN, DATE, INTEGER, NOW } from '../utils/seq';
import Record from './record';

const Borrow = seq.define(
  'borrow',
  {
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
    borrowTime: {
      type: DATE,
      allowNull: false,
      defaultValue: NOW,
      comment: '借阅时间'
    }
  },
  {
    hooks: {
      async afterBulkCreate([borrow], option) {
        const { transaction } = option;
        const user = await borrow.getUser();
        const book = await borrow.getBook();
        if (book.num - book.borrowedNum <= 0)
          throw { msg: '这本书被借完了，无法借阅', code: 303 };
        await book.increment('borrowedNum', { transaction });
        // 创建借阅记录
        await Record.create(
          { userId: user.id, bookId: book.id },
          { transaction }
        );
      },
      async beforeBulkDestroy(option) {
        const borrow = await Borrow.findOne({ where: option.where });
        const { transaction } = option;
        const user = await borrow.getUser();
        const book = await borrow.getBook();
        await book.decrement('borrowedNum', { transaction });
        // 更新归还记录
        await Record.update(
          { returnedTime: new Date() },
          {
            where: { userId: user.id, bookId: book.id, returnedTime: null },
            transaction
          }
        );
      }
    }
  }
);

export default Borrow;
