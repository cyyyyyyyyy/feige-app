import React, { useState, useEffect } from 'react';
import { useWebSocket } from 'ahooks';

import style from './index.less';

const { ipcRenderer } = window.require('electron');
const { session } = window.require('electron').remote;

const Main = () => {
  const [apps, setApps] = useState([]);
  const [select, setSelect] = useState('');
  const [notif, setNotif] = useState([]);
  const [edit, setEdit] = useState(false);
  const itemEls = apps.map(() => React.createRef());

  const getApps = () => {
    ipcRenderer.invoke('get-apps').then(({ data }) => {
      if (data) {
        setApps(data);
      }
    });
  };

  const handleMessage = message => {
    const { type, data } = message;
    const { user, shopName, messageNum } = data;
    switch (type) {
      case 'connect':
        break;
      case 'newMsg':
        if (!notif.find(val => val.id === user) && user !== select) {
          setNotif([...notif, { id: user, unreadConv: messageNum }]);
        }
        break;
      case 'shopName':
        ipcRenderer.invoke('load-name', { id: user, name: shopName }).then(() => {
          getApps();
        });
        break;
      default:
        break;
    }
  };

  const { sendMessage } = useWebSocket('ws://niulixin.natapp1.cc:15673/feige/websocket', {
    onMessage: message => {
      const { data } = message;
      try {
        const paserData = JSON.parse(data);
        handleMessage(paserData);
      } catch (e) {
        console.error(e);
      }
    }
  });

  useEffect(() => {
    if (itemEls) {
      itemEls.forEach(view => {
        if (view.current) {
          view.current.addEventListener('did-navigate', ({ url }) => {
            if (view.current && view.current.partition && url.indexOf('pc_seller') !== -1) {
              session
                .fromPartition(view.current.partition)
                .cookies.get({ url })
                .then(cookies => {
                  const data = {};
                  if (cookies) {
                    cookies.forEach(val => {
                      data[val.name] = val.value;
                    });
                  }
                  sendMessage(
                    JSON.stringify({
                      user: view.current.id,
                      cookie: data
                    })
                  );
                });
            }
          });
        }
      });
    }
    return () => {
      if (itemEls) {
        itemEls.forEach(view => {
          if (view.current) {
            view.current.removeAllListeners('did-navigate');
          }
        });
      }
    };
  }, [itemEls, select]);

  const addApp = () => {
    ipcRenderer.invoke('add-app', '').then(data => {
      if (data.status === 0) {
        getApps();
      }
    });
  };

  const deleteApp = id => {
    ipcRenderer.invoke('delete-app', id).then(data => {
      if (data.status === 0) {
        getApps();
      }
    });
  };

  const selectApp = id => {
    setSelect(id);
    const newNotif = notif.filter(val => val.id !== id);
    setNotif(newNotif);
  };

  useEffect(() => {
    getApps();
  }, []);

  const handleDev = id => {
    document.getElementById(id).openDevTools();
  };

  return (
    <div className={style.main}>
      <div className={style.box}>
        <ul className={style.apps}>
          {apps.map(app => {
            const noti = notif.find(val => val.id === app.id);
            const isSelect = select === app.id;
            return (
              <li
                className={`${style.app_list} ${isSelect ? style.select : ''} ${noti ? style.border : ''}`}
                key={app.id}
                onClick={() => selectApp(app.id)}>
                <div>
                  <span>{app.name ? app.name : '未登录'}</span>
                </div>
                {edit ? (
                  <div style={{ fontSize: '12px' }}>
                    <span style={{ paddingRight: 4 }} onClick={() => handleDev(app.id)}>
                      调试
                    </span>
                    <span onClick={() => deleteApp(app.id)}>删除</span>
                  </div>
                ) : (
                  <div>
                    {noti && noti.unreadConv > 0 ? <span className={style.unread}>{noti.unreadConv}</span> : null}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <ul className={style.setting}>
          <li onClick={addApp}>新增</li>
          <li onClick={() => setEdit(!edit)}>{!edit ? '编辑' : '恢复'}</li>
        </ul>
      </div>
      <ul className={style.views}>
        {apps.length > 0 &&
          apps.map((app, index) => {
            return (
              <li
                key={app.index}
                style={{ visibility: select === app.id ? 'visible' : 'hidden' }}
                className={style['red-bg']}>
                <webview
                  ref={itemEls[index]}
                  useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36"
                  partition={`persist:${app.id}`}
                  id={app.id}
                  style={{ height: '100%', width: '100%' }}
                  src={
                    app.name
                      ? 'https://im.jinritemai.com/pc_seller/'
                      : 'https://fxg.jinritemai.com/index.html#/ffa/penalty/healthCenter'
                  }
                />
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default Main;
