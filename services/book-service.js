import ResModel from '../models/res';
import search from '../utils/search';
import { Op } from 'sequelize';
import { Book, User } from '../models';

class BookService {
  /**
   * 获取图书信息
   *
   * @param {Object} bookInfo 图书信息
   * @param {string} bookInfo.isbn 国际标准书号
   * @returns {Promise<ResModel>}
   */
  static async getDetails({ isbn }) {
    // 非空判断
    if (!isbn) return ResModel.error('isbn不能为空', 201);

    try {
      const data = await search(isbn);
      return ResModel.success('获取图书成功', data);
    } catch (error) {
      return ResModel.error(error, 301);
    }
  }

  /**
   * 获取图书信息
   *
   * @param {string} id 用户编码
   * @param {Object} bookInfo 图书信息
   * @param {string} bookInfo.key 搜索的属性
   * @param {string} bookInfo.value 搜索的属性对应的值
   * @param {number|string=} bookInfo.limit 搜索的限制数
   * @param {number|string=} bookInfo.offset 搜索跳过的数量
   * @returns {Promise<ResModel>}
   */
  static async search(id, { key, value, limit = 10, offset = 0 }) {
    // 非空判断
    if (!key) return ResModel.error('搜索的属性不能为空', 201);

    // 合法判断
    limit = parseInt(limit);
    offset = parseInt(offset);
    if (isNaN(limit) || limit <= 0) return ResModel.error('限制数不合法', 301);
    if (isNaN(offset) || offset < 0) return ResModel.error('跳过数不合法', 302);

    // 模糊查询
    const query = value
      .trim()
      .split(/\s+/)
      .map(value => ({ [key]: { [Op.like]: `%${value}%` } }));
    const { count: total, rows: books } = await Book.findAndCountAll({
      where: { [Op.and]: query },
      include: {
        model: User,
        where: { '$users.id$': id },
        attributes: ['id'],
        required: false
      },
      limit,
      offset,
      raw: true
    });
    // 如果数据库中不存在，则从外部获取信息
    if (total === 0) {
      if (key !== 'code')
        return ResModel.success('未找到图书', { total: 0, books });
      const { success, data } = await this.getDetails({ isbn: value });
      if (success) {
        data.borrowed = false;
        return ResModel.success('查询图书成功', { total: 1, books: [data] });
      }
      return ResModel.success('未找到图书', { total: 0, books });
    }

    // 判断用户是否借阅
    for (let i = 0; i < books.length; ++i) {
      if (books[i]['users.id']) books[i].borrowing = true;
      else books[i].borrowing = false;
      books[i]['users.id'] = undefined;
      books[i]['users.borrow.id'] = undefined;
      books[i]['users.borrow.userId'] = undefined;
      books[i]['users.borrow.bookId'] = undefined;
      books[i]['users.borrow.borrowTime'] = undefined;
    }
    return ResModel.success('查询图书成功', { total, books });
  }
}

export default BookService;
