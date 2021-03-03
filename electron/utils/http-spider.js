const request = require('request');

const UA = require('../constants/ua');

class HttpSpider {
  constructor(cookie) {
    this.headers = {
      'accept-language': 'en-US',
      Connection: 'keep-alive',
      accept: 'application/json, text/plain, */*',
      'User-Agent': UA,
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      referrer:
        'https://im.jinritemai.com/pc_seller/main/chat?selfId=64146895404',
      referrerPolicy: 'no-referrer-when-downgrade',
      Cookie: cookie // 如果携带了cookie
    };

    this.postHeader = {
      authority: 'pigeon.jinritemai.com',
      origin: 'https://im.jinritemai.com',
      accept: 'application/json, text/plain, */*',
      'content-type': 'application/json;charset=UTF-8',
      'User-Agent': UA,
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      referrer:
        'https://im.jinritemai.com/pc_seller/main/chat?selfId=64146895404',
      referrerPolicy: 'no-referrer-when-downgrade',
      Cookie: cookie
    };
  }

  get({ url }) {
    return new Promise((resolve, reject) => {
      const queryParams = new URLSearchParams(url);
      queryParams.set('_ts', new Date().getTime());
      queryParams.set('biz_type', '4');
      const setUrl = decodeURIComponent(queryParams.toString());

      request(
        {
          url: setUrl, // 你要请求的地址
          method: 'get',
          headers: this.headers
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

  post({ url, body }) {
    return new Promise((resolve, reject) => {
      const queryParams = new URLSearchParams(url);
      queryParams.set('_ts', new Date().getTime());
      queryParams.set('biz_type', '4');
      const setUrl = decodeURIComponent(queryParams.toString());
      request(
        {
          url: setUrl, // 你要请求的地址
          method: 'post',
          headers: this.postHeader,
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
