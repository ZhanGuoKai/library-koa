import { Book } from '../models';
import ResModel from '../models/res';
import search from '../utils/search';

/** 图书信息字段 */
const bookFields = [
  'name',
  'author',
  'publishing',
  'translator',
  'published',
  'pages',
  'code',
  'description',
  'authorIntro',
  'photoUrl'
];

class AdminService {
  /**
   * 获取借阅者
   *
   * @param {Object} bookInfo 图书信息
   * @param {string=} bookInfo.isbn 国际标准书号
   * @returns {Promise<ResModel>}
   */
  static async getBorrowers({ isbn }) {
    // 非空判断
    if (!isbn) return ResModel.error('isbn不能为空', 201);

    const book = await Book.findOne({ where: { code: isbn } });
    if (book === null) return ResModel.error('图书不存在', 301);
    const borrowers = await book.getUsers();
    return ResModel.success('获取借阅者成功', { book, borrowers });
  }

  /**
   * 录入图书
   *
   * @param {Object} bookInfo 图书信息
   * @param {string=} bookInfo.isbn 国际标准书号
   * @param {string=} bookInfo.num 录入数量
   * @returns {Promise<ResModel>}
   */
  static async enterBook({ isbn, num }) {
    // 非空判断
    if (!isbn) return ResModel.error('isbn不能为空', 201);
    if (!num && num !== 0) return ResModel.error('录入数量不能为空', 202);

    // 合法判断
    num = parseInt(num);
    if (isNaN(num) || num <= 0) return ResModel.error('录入的数量不合法', 301);

    // 如果数据库有对应的书，则直接添加数量
    const [[_, count]] = await Book.increment(
      { num },
      { where: { code: isbn } }
    );
    if (count !== 0) return ResModel.success('录入成功');

    // 如果数据库没有这本书，则从外部获取
    const book = await search(isbn);
    if (book === null) return ResModel.error('找不到这本书', 302);

    const bookInfo = { num };
    bookFields.forEach(field => (bookInfo[field] = book[field]));
    bookInfo.price = parseFloat(book.price);
    if (await Book.create(bookInfo)) return ResModel.success('录入成功');
    return ResModel.error('录入失败', 401);
  }
}

export default AdminService;
