const WebSocket = require('ws');
const btoa = require('btoa');

const dy = require('../lib/dycode');
const uuid = require('./uuid');

const headers = {
  user_agent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36',
  cookie_enabled: 'true',
  browser_language: 'zh-CN',
  browser_platform: 'Win64',
  browser_name: 'Mozilla',
  browser_version:
    '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36',
  browser_online: 'true',
  screen_width: '1920',
  screen_height: '1080',
  referer: 'https://fxg.jinritemai.com/',
  timezone_name: 'Asia/Shanghai',
  session_aid: '1383',
  app_name: 'ecom.im',
  priority_region: 'CN'
};

class Ws {
  constructor(token, customerId, shopId) {
    this.token = token;
    this.ws = null;
    this.sendMsgData = {
      customerId,
      shopId
    };
  }

  connect() {
    this.ws = new WebSocket(
      `wss://frontier.snssdk.com/ws/v2?token=${this.token}&aid=1383&fpid=92&device_id=41157968724&access_key=8d2165ffb6a5eacf6b6d947118424ea1&version_code=10000&device_platform=web`
    );
    this.ws.on('open', () => {
      console.log('connect success');
    });
  }

  onMessage() {
    this.ws.on('message', val => {
      // 进行加解密
      try {
        console.log(this.sendMsgData.shopId);
        const str = String.fromCharCode(...new Uint8Array(val));
        const str2 = btoa(str);
        const decodeStr = dy.decode(str2);
        const msgObj = JSON.parse(decodeStr);
        console.log(msgObj);
        // 判断为发消息验证请求，模拟一条消息发送出去。
        if (msgObj.payload.cmd === 609) {
          const { create_conversation_v2_body: sendData } = msgObj.payload.body;
          const { conversation } = sendData;
          const {
            conversation_id,
            ticket,
            conversation_short_id
          } = conversation;

          const client_message_id = uuid();
          const secendSendData = {
            headers,
            body: {
              send_message_body: {
                conversation_id,
                conversation_short_id,
                conversation_type: 1,
                content: '测试消息',
                mentioned_users: [],
                client_message_id,
                ticket,
                message_type: 1000,
                ext: {
                  receiver_id: this.sendMsgData.userId,
                  // shop_id: this.sendMsgData.shopId,
                  src: 'pc',
                  source: '',
                  type: 'text',
                  tag_valid: '1',
                  's:client_message_id': client_message_id,
                  's:send_response_check_code': '0',
                  's:send_response_check_msg': '',
                  's:send_response_extra_info': '',
                  's:send_response_status': '0'
                }
              }
            },
            cmd: 100,
            sequence_id: { low: 10062, high: 0, unsigned: false },
            refer: 3,
            token: this.token,
            device_id: '0',
            inbox_type: 1,
            device_platform: 'web',
            auth_type: 2
          };
          const sendDataCode = dy.encode(secendSendData);
          const myBuffer = Buffer.from(sendDataCode, 'base64');
          this.ws.send(myBuffer);
        }
      } catch (e) {
        // console.log(val);
      }
    });
  }

  sendMessage({ userId }) {
    this.sendMsgData.userId = userId;
    // 格式化id
    const customerIdCode = JSON.parse(
      dy.fromString(this.sendMsgData.customerId)
    );
    const userIdCode = JSON.parse(dy.fromString(userId));

    const firstSendData = {
      headers,
      body: {
        create_conversation_v2_body: {
          conversation_type: 1,
          participants: [userIdCode, customerIdCode]
        }
      },
      cmd: 609,
      sequence_id: { low: 10005, high: 0, unsigned: false },
      refer: 3,
      token: this.token,
      device_id: '0',
      inbox_type: 1,
      device_platform: 'web',
      auth_type: 2
    };
    const firstSendDataCode = dy.encode(firstSendData);
    const myBuffer = Buffer.from(firstSendDataCode, 'base64');
    this.ws.send(myBuffer);
  }
}

module.exports = Ws;
