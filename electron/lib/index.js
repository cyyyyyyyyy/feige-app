const dy = require('./dycode');

const data = dy.encode({
  headers: {
    user_agent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
    cookie_enabled: 'true',
    browser_language: 'zh-CN',
    browser_platform: 'Win32',
    browser_name: 'Mozilla',
    browser_version:
      '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
    browser_online: 'true',
    screen_width: '1920',
    screen_height: '1080',
    referer: 'https://fxg.jinritemai.com/',
    timezone_name: 'Asia/Shanghai',
    session_aid: '1383',
    app_name: 'ecom.im',
    priority_region: 'CN'
  },
  body: {
    create_conversation_v2_body: { conversation_type: 1, participants: [] }
  },
  cmd: 609,
  sequence_id: { low: 10005, high: 0, unsigned: false },
  refer: 3,
  token: '123123123213',
  device_id: '0',
  inbox_type: 1,
  device_platform: 'web',
  auth_type: 2
});

console.log(data);
console.log(dy.decode(data));
