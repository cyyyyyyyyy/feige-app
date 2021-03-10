const WebSocket = require('ws');
const btoa = require('btoa');

const dy = require('../lib/dycode');
const uuid = require('../utils/uuid');
const ua = require('../constants/ua');

const headers = {
  user_agent: ua,
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

class WsSpider {
  constructor(db) {
    this.shopes = {};
    this.db = db;
  }

  connect({ shopUid, success, erorr, onMessage }) {
    if (!this.shopes[shopUid]) {
      const shop = this.db.getShopByUid(shopUid);
      this.shopes[shopUid] = {
        token: shop.token,
        customerId: shop.customerInfo.id
      };
      this.shopes[shopUid].ws = new WebSocket(
        `wss://frontier.snssdk.com/ws/v2?token=${shop.token}&aid=1383&fpid=92&device_id=41157968724&access_key=8d2165ffb6a5eacf6b6d947118424ea1&version_code=10000&device_platform=web`
      );
      const { ws } = this.shopes[shopUid];

      ws.on('open', () => {
        this.shopes[shopUid].wsStatus = 'success';
        success();
      });

      ws.on('message', mesage => {
        let msgObj;
        try {
          const str = String.fromCharCode(...new Uint8Array(mesage));
          const str2 = btoa(str);
          const decodeStr = dy.decode(str2);
          msgObj = JSON.parse(decodeStr);
        } catch (e) {
          console.error('消息解析失败');
        }

        // 发送消息
        try {
          const { userId, token, sendMessage } = this.shopes[shopUid];
          if (msgObj && msgObj.payload.cmd === 609) {
            const {
              create_conversation_v2_body: sendData
            } = msgObj.payload.body;
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
                  content: sendMessage,
                  mentioned_users: [],
                  client_message_id,
                  ticket,
                  message_type: 1000,
                  ext: {
                    receiver_id: userId,
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
              token,
              device_id: '0',
              inbox_type: 1,
              device_platform: 'web',
              auth_type: 2
            };

            const sendDataCode = dy.encode(secendSendData);
            const myBuffer = Buffer.from(sendDataCode, 'base64');
            ws.send(myBuffer);
            this.shopes[shopUid].sendMessage = '';
            this.shopes[shopUid].userId = '';
          }
        } catch (e) {
          console.error(e);
        }

        // 新消息提醒以及对话结束
        try {
          if (msgObj && msgObj.payload.cmd === 500) {
            const { message } = msgObj.payload.body.has_new_message_notify;
            const { ext, content } = message;
            const { o_sender, receiver_id } = ext;
            onMessage({
              senderId: o_sender,
              receiverId: receiver_id,
              shopUid,
              content
            });
          }
        } catch (e) {
          console.error('新消息提醒失败');
        }
      });

      ws.on('close', () => {
        delete this.shopes[shopUid];
      });

      ws.on('error', () => {
        erorr();
        delete this.shopes[shopUid];
      });
    }
  }

  sendMessage({ shopUid, message, userId }) {
    const { customerId, ws, wsStatus } = this.shopes[shopUid];
    if (wsStatus === 'success') {
      // 记录需要发送的消息
      this.shopes[shopUid].sendMessage = message;
      this.shopes[shopUid].userId = userId;
      const customerIdCode = JSON.parse(dy.fromString(customerId));
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
      ws.send(myBuffer);
    }
  }
}

module.exports = WsSpider;
