import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { SEARCH_CONFIG } from '../config';
import { redisGet, redisSet } from './store';

const { url, apikey, interval } = SEARCH_CONFIG;
const bookDir = path.join(__dirname, '../public/images/books/');

/**
 * @typedef BookDetails 图书详细信息
 * @property {number} id 国际编码
 * @property {string} name 书名
 * @property {string} subname 副标题
 * @property {string} author 作者
 * @property {string?} translator 译者
 * @property {string} publishing 出版社
 * @property {string} published 出版时间
 * @property {string} designed 装帧
 * @property {string} code 国际标准书号
 * @property {number} douban 豆瓣的图书编号
 * @property {number} doubanScore 豆瓣评分 0到100分
 * @property {number} numScore 评价人数
 * @property {string?} brand 丛书
 * @property {string} pages 页数
 * @property {string} photoUrl 图片地址
 * @property {string} price 价格
 * @property {number} num 图书数量
 * @property {string} authorIntro 作者简介
 * @property {string} description 图书简介
 */

/**
 * 保存图片
 * 
 * @param {string} url 图片地址
 * @param {string} filename 保存的文件名
 */
function saveImage(url, filename) {
  const imgPath = `${bookDir}${filename}`;
  if (!fs.existsSync(imgPath)) {
    axios
      .get(url, { responseType: 'arraybuffer' })
      .then(({ data }) => fs.writeFileSync(imgPath, data, 'binary'));
  }
}

/** 搜索请求类 */
class SearchRequest {
  /**
   * 搜索请求类构造函数
   *
   * @param {string} isbn 国际标准书号
   * @param {(data:*)=>void} resolve 成功处理函数
   * @param {(error:*)=>void} reject 失败处理函数
   */
  constructor(isbn, resolve, reject) {
    /** @type {string} 国际标准书号 */
    this.isbn = isbn;
    /** @type {(data:*)=>void} 成功处理函数 */
    this.resolve = resolve;
    /** @type {(error:*)=>void} 失败处理函数 */
    this.reject = reject;
    /** @type {SearchRequest?} 下一个请求指针 */
    this.next = null;
    /** @type {{resolve(data:*)=>void,reject(error:*)=>void}[]} 等待队列 */
    this.waitingQueue = [];
  }

  /**
   * 搜索
   * @returns {Promise<void>}
   */
  async search() {
    try {
      /** @type {{data:{data:BookDetails}}} 图书详细信息 */
      const {
        data: { data }
      } = await axios.get(url + this.isbn, { params: { apikey } });
      const photoUrl = data.photoUrl;
      if (photoUrl) {
        data.photoUrl = data.photoUrl.match(/([a-zA-Z\d]+\.jpg)$/)[1];
        saveImage(photoUrl, data.photoUrl);
      }
      this.resolve(data);
      this.waitingQueue.forEach(({ resolve }) => resolve(data));
    } catch (error) {
      this.reject(error);
      this.waitingQueue.forEach(({ reject }) => reject(error));
    }
  }

  /**
   * 等待请求完成
   * @returns {Promise<BookDetails?>}
   */
  waitFor() {
    return new Promise((resolve, reject) =>
      this.waitingQueue.push({ resolve, reject })
    );
  }
}

/** 搜索请求队列类 */
class SearchRequestQueue {
  /**
   * 搜索请求队列类构造函数
   * @param {number} max 请求队列最大容量
   */
  constructor(max = 10) {
    /** @type {SearchRequest?} 队列头指针 */
    this.head = null;
    /** @type {SearchRequest?} 队列尾指针 */
    this.tail = null;
    /** @type {((data:SearchRequest)=>void)?} 是否可以处理新请求 */
    this.hasNext = null;
    /** @type {number} 队列最大容量 */
    this.max = max;
    /** @type {number} 当前队列长度 */
    this.length = 0;

    // 循环处理请求
    (async () => {
      while (true) {
        // 处理请求
        const req = await this.getNext();
        await req.search();
        // 等待 interval 毫秒，避免频繁访问
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    })();
  }

  /**
   * 将搜索请求加入请求队列
   * @param {SearchRequest} request 搜索请求
   * @returns {void}
   */
  push(request) {
    // 如果队列中有为完成的请求，则直接加入队列
    if (this.length) {
      this.tail.next = request;
      this.tail = request;
      ++this.length;
    } else {
      // 判断是否可以处理新请求
      // 如果是则直接处理，否则添加到队列
      if (this.hasNext) {
        this.hasNext(request);
        this.hasNext = null;
      } else {
        this.head = this.tail = request;
        ++this.length;
      }
    }
  }

  /**
   * 获取下一个请求
   * @returns {Promise<SearchRequest>}
   */
  getNext() {
    // 判断队列中是否有请求
    // 如果有则直接返回队列头部的请求
    if (this.length) {
      const next = this.head;
      if (this.head.next) this.head = this.head.next;
      else this.head = this.tail = null;
      --this.length;
      return Promise.resolve(next);
    }
    // 否则等待下一个请求
    return new Promise(resolve => (this.hasNext = resolve));
  }

  /**
   * 添加新的搜索请求
   * @param {string} isbn 国际标准书号
   * @returns {Promise<BookDetails?>}
   */
  addSearchRequest(isbn) {
    // 当队列已满时无法发起请求
    if (this.length >= this.max) {
      return Promise.reject('服务器繁忙');
    }
    return new Promise((resolve, reject) =>
      this.push(new SearchRequest(isbn, resolve, reject))
    );
  }

  /**
   * 从请求队列中获取已有的相同请求
   * @param {string} isbn 国际标准书号
   * @returns {SearchRequest?}
   */
  getSameRequest(isbn) {
    let request = this.head;
    while (request) {
      if (request.isbn === isbn) return request;
      request = request.next;
    }
    return null;
  }
}

const srq = new SearchRequestQueue(15);

/**
 * 搜索图书
 * @param {string} isbn 图书编码
 * @returns {Promise<BookDetails?>}
 */
export default async function (isbn) {
  // 先从redis中查找
  /** @type {BookDetails} */
  let details = await redisGet(`isbn_${isbn}`);
  if (details) return details;

  // 如果redis中没有，则从请求队列中查找
  const request = srq.getSameRequest(isbn);
  if (request) return request.waitFor();

  // 如果请求队列中也没有，则发起请求并保存到redis
  details = await srq.addSearchRequest(isbn);
  if (details) await redisSet(`isbn_${isbn}`, details);
  return details;
}
