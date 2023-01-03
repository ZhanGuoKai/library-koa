import nodemailer from 'nodemailer';
import { EMAIL_CONFIG } from '../config';

const transport = nodemailer.createTransport(EMAIL_CONFIG);

const from = { name: 'do-not-reply', address: EMAIL_CONFIG.auth.user };

/** @typedef {import('nodemailer/lib/smtp-transport').SentMessageInfo} Info */

/**
 * 发送验证码
 *
 * @param {string} to 接收方邮箱
 * @param {string} subject 邮件主题
 * @param {string} text 邮件文本内容
 * @param {string} html 邮件html内容
 * @return {Promise<Info>}
 */
export async function sendEmail(to, subject, text, html) {
  return await transport.sendMail({ from, to, subject, text, html });
}

/**
 * 获取HTML格式文本
 * 
 * @param {string} code 验证码
 * @returns {string}
 */
export function getCodeHTML(code) {
  return `\
<div style="background-color: #ececec; padding: 35px">
  <table
    cellpadding="0"
    align="center"
    style="
      width: 800px;
      height: 100%;
      margin: 0px auto;
      text-align: left;
      position: relative;
      border-top-left-radius: 5px;
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
      border-bottom-left-radius: 5px;
      font-size: 14px;
      font-family: 微软雅黑, 黑体;
      line-height: 1.5;
      box-shadow: rgb(153, 153, 153) 0px 0px 5px;
      border-collapse: collapse;
      background-position: initial initial;
      background-repeat: initial initial;
      background: #fff;
    "
  >
    <tbody>
      <tr>
        <th
          valign="middle"
          style="
            height: 25px;
            line-height: 25px;
            padding: 15px 35px;
            border-bottom-width: 1px;
            border-bottom-style: solid;
            border-bottom-color: RGB(148, 0, 211);
            background-color: RGB(148, 0, 211);
            border-top-left-radius: 5px;
            border-top-right-radius: 5px;
            border-bottom-right-radius: 0px;
            border-bottom-left-radius: 0px;
          "
        >
          <font face="微软雅黑" size="5" style="color: rgb(255, 255, 255)">
            图书管理系统
          </font>
        </th>
      </tr>
      <tr>
        <td style="word-break: break-all">
          <div
            style="
              padding: 25px 35px 40px;
              background-color: #fff;
              opacity: 0.8;
            "
          >
            <h2 style="margin: 5px 0px">
              <font color="#333333" style="line-height: 20px">
                <font style="line-height: 22px" size="4"> 尊敬的用户：</font>
              </font>
            </h2>
            <!-- 中文 -->
            <p>
              您好！感谢您使用图书管理系统，您的账号正在进行邮箱验证，验证码为：
              <font color="#ff8c00">${code}</font>
              ，有效期5分钟，请尽快填写验证码完成验证！
            </p>
            <br />
            <!-- 英文 -->
            <h2 style="margin: 5px 0px">
              <font color="#333333" style="line-height: 20px">
                <font style="line-height: 22px" size="4"> Dear user:</font>
              </font>
            </h2>
            <p>
              Hello! Thanks for using Library management system, your account is
              being authenticated by email, the verification code is:
              <font color="#ff8c00">${code}</font>
              , valid for 5 minutes. Please fill in the verification code as
              soon as possible!
            </p>
            <div style="width: 100%; margin: 0 auto">
              <div
                style="
                  padding: 10px 10px 0;
                  border-top: 1px solid #ccc;
                  color: #747474;
                  margin-bottom: 20px;
                  line-height: 1.3em;
                  font-size: 12px;
                "
              >
                <p>
                  此为系统邮件，请勿回复<br />
                  Please do not reply to this system email
                </p>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>\
`;
}
