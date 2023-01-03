import ResModel from '../models/res';
import { Book, Record, User } from '../models';
import { redisDel, redisGet, redisSet } from '../utils/store';
import seq from '../utils/seq';
import { col, fn, Op, QueryTypes } from 'sequelize';

/** 查询推荐图书 */
const queryString = `\
SELECT book.id,
  MAX(
    (
      IF(book.author = record.author, 2, 0) 
      + IF(book.publishing = record.publishing, 1, 0) 
      + GetSimilarRate(book.name, record.name) * 5
    ) * record.times
  ) AS score
FROM
  book,
  (
    SELECT name, author, publishing, COUNT(record.id) AS times
    FROM record, book
    WHERE record.user_id = $id AND record.book_id = book.id
    GROUP BY book.id, name, author, publishing
    LIMIT 10
  ) AS record
WHERE book.id NOT IN (SELECT book_id FROM record WHERE user_id = $id)
GROUP BY book.id
ORDER BY score DESC
LIMIT 10\
`.replace(/\s+/g, ' ');

/**
 * 获取推荐图书
 * @param {number} id 用户编码
 * @returns {Promise<number[]>}
 */
async function getRecommendedById(id) {
  const user = await User.findByPk(id);
  let bookIds;
  // 如果用户没有借阅过图书，则推荐热门图书
  if ((await user.countRecords()) === 0) {
    bookIds = await Record.findAll({
      attributes: ['book_id', [fn('COUNT', col('id')), 'times']],
      group: 'book_id',
      order: [['times', 'DESC']],
      limit: 10,
      raw: true
    });
  } else {
    bookIds = (
      await seq.query(queryString, {
        raw: true,
        bind: { id },
        type: QueryTypes.SELECT
      })
    ).map(book => book.id);
  }
  // 将结果保存到redis
  await redisSet(`recommended_${id}`, bookIds, 4 * 60 * 60);
  return bookIds;
}

class UserService {
  /**
   * 获取用户信息
   *
   * @param {string} id 用户编码
   * @returns {Response<ResModel>}
   */
  static async getInfo(id) {
    const user = await User.findByPk(id, {
      attributes: ['username', 'email', 'role'],
      raw: true
    });
    if (user == null) return ResModel.error('用户不存在', 201);
    return ResModel.success('获取成功', user);
  }

  /**
   * 用户申请借书
   *
   * @param {string} id 用户编码
   * @param {Object} bookInfo 要借的图书信息
   * @param {string} bookInfo.isbn 国际标准书号
   * @returns {Response<ResModel>}
   */
  static async borrow(id, { isbn }) {
    // 非空判断
    if (!isbn) return ResModel.error('isbn不能为空', 201);

    const user = await User.findByPk(id);
    const book = await Book.findOne({ where: { code: isbn } });

    if (!book) return ResModel.error('没有这本书', 301);
    if (await user.hasBook(book))
      return ResModel.error('已借阅了这本书，不能重复借阅', 302);
    if (book.num - book.borrowedNum <= 0)
      return ResModel.error('这本书被借完了，无法借阅', 303);

    try {
      await seq.transaction(async transaction => {
        await user.addBook(book, { transaction });
      });
      // 每次借书时重新判断推荐的图书
      getRecommendedById(id);
      return ResModel.success('借阅成功');
    } catch ({ msg, code }) {
      if (msg && code) return ResModel.error(msg, code);
      else return ResModel.error('未知错误，借阅失败', 401);
    }
  }

  /**
   * 用户申请还书
   *
   * @param {string} id 用户编码
   * @param {Object} bookInfo 要还的图书信息
   * @param {string} bookInfo.isbn 国际标准书号
   * @returns {Response<ResModel>}
   */
  static async returnBook(id, { isbn }) {
    // 非空判断
    if (!isbn) return ResModel.error('isbn不能为空', 201);

    const user = await User.findByPk(id);
    const book = await Book.findOne({ where: { code: isbn } });

    if (!book) return ResModel.error('没有这本书', 301);
    if (!(await user.hasBook(book)))
      return ResModel.error('用户未借阅该书，不能还书', 302);

    try {
      await seq.transaction(async transaction => {
        await user.removeBook(book, { transaction });
      });
      return ResModel.success('归还成功');
    } catch ({ msg, code }) {
      if (msg && code) return ResModel.error(msg, code);
      else return ResModel.error('未知错误，归还失败', 401);
    }
  }

  /**
   * 获取借阅记录
   *
   * @param {string} id 用户编码
   * @param {Object} queryInfo 搜索信息
   * @param {number|string=} queryInfo.limit 搜索的限制数
   * @param {number|string=} queryInfo.offset 搜索跳过的数量
   * @returns {Promise<ResModel>}
   */
  static async getHistory(id, { limit = 10, offset = 0 }) {
    // 合法判断
    limit = parseInt(limit);
    offset = parseInt(offset);
    if (isNaN(limit) || limit <= 0) return ResModel.error('限制数不合法', 301);
    if (isNaN(offset) || offset < 0) return ResModel.error('跳过数不合法', 302);

    const user = await User.findByPk(id);
    const records = await user.getRecords({
      limit,
      offset,
      include: Book,
      attributes: { exclude: ['id', 'userId', 'bookId'] },
      order: seq.literal('borrowed_time DESC')
    });
    const total = await user.countRecords();
    return ResModel.success('获取借阅记录成功', { total, records });
  }

  /**
   * 获取用户信息
   *
   * @param {string} id 用户编码
   * @returns {Response<ResModel>}
   */
  static async getRecommended(id) {
    let bookIds = await redisGet(`recommended_${id}`);
    if (bookIds === null) {
      bookIds = await getRecommendedById(id);
    }
    const books = await Book.findAll({ where: { id: { [Op.in]: bookIds } } });
    return ResModel.success('获取推荐图书成功', books);
  }

  /**
   * 登出
   *
   * @param {string} id 用户编码
   * @returns {Promise<ResModel>}
   */
  static async logout(id) {
    await redisDel(`jwt_${id}`);
    return ResModel.success('登出成功');
  }
}

export default UserService;
