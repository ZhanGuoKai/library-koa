/** 
 * @class 响应类
 */
export default class ResModel {
  /**
   * @param {string=} msg 返回消息
   * @param {number=} code 响应状态码
   * @param {Object=} data 返回数据
   * @param {boolean} success 是否成功
   */
  constructor(msg = '', code = 101, data = {}, success = false) {
    this.msg = msg;
    this.code = code;
    this.data = data;
    this.success = success;
  }

  /**
   * 获取成功的响应类
   *
   * @param {string=} msg 返回消息
   * @param {Object=} data 返回数据
   * @returns
   */
  static success(msg = '', data = {}) {
    return new ResModel(msg, 101, data, true);
  }

  /**
   * 获取失败的响应类
   *
   * @param {string=} msg 返回消息
   * @param {number=} code 响应状态码
   * @returns
   */
  static error(msg = '', code = 201) {
    return new ResModel(msg, code);
  }
}
