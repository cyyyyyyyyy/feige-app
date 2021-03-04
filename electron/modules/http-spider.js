const request = require('request');
const queryString = require('query-string');

const UA = require('../constants/ua');

const baseHeader = {
  'accept-language': 'en-US',
  Connection: 'keep-alive',
  accept: 'application/json, text/plain, */*',
  'content-type': 'application/json;charset=UTF-8',
  'User-Agent': UA,
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-site',
  referrer: 'https://im.jinritemai.com/pc_seller/main/chat?selfId=64146895404',
  referrerPolicy: 'no-referrer-when-downgrade'
};

class HttpSpider {
  constructor() {
    this.cookies = {};
  }

  // 用于存储企业id所对应cookie
  setCookie(shopUid, cookie) {
    this.cookies[shopUid] = cookie;
  }

  get({ shopUid, url }) {
    return new Promise((resolve, reject) => {
      const paramUrl = queryString.stringifyUrl({
        url,
        query: { _ts: new Date().getTime(), biz_type: '4' }
      });
      const headers = { ...baseHeader, Cookie: this.cookies[shopUid] };
      request(
        {
          url: paramUrl,
          method: 'get',
          headers
        },
        (error, response, body) => {
          const data = JSON.parse(body);
          resolve(data);
          if (error) {
            reject(error);
          }
        }
      );
    });
  }

  post({ shopUid, url, body }) {
    return new Promise((resolve, reject) => {
      const paramUrl = queryString.stringifyUrl({
        url,
        query: { _ts: new Date().getTime(), biz_type: '4' }
      });
      const headers = { ...baseHeader, Cookie: this.cookies[shopUid] };

      request(
        {
          url: paramUrl, // 你要请求的地址
          method: 'post',
          headers,
          body: JSON.stringify(body)
        },
        (error, response, resBody) => {
          const data = JSON.parse(resBody);
          resolve(data);
          if (error) {
            reject(error);
          }
        }
      );
    });
  }
}

module.exports = HttpSpider;
