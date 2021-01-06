import React, { useState, useEffect } from 'react';

import style from './index.less';

const { ipcRenderer } = window.require('electron');
const path = window.require('path');

const Main = () => {
  const [apps, setApps] = useState([]);
  const [select, setSelect] = useState('');
  const [notif, setNotif] = useState([]);
  const [edit, setEdit] = useState(false);

  const getApps = () => {
    ipcRenderer.invoke('get-apps').then(({ data }) => {
      if (data) {
        setApps(data);
      }
    });
  };

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
    // document.getElementById(id).openDevTools();
    const newNotif = notif.filter(val => val.id !== id);
    setNotif(newNotif);
  };

  useEffect(() => {
    getApps();
  }, []);

  useEffect(() => {
    ipcRenderer.on('app-load-name', () => {
      getApps();
    });
  }, []);

  useEffect(() => {
    ipcRenderer.on('app-notification', (event, { id, unreadConv }) => {
      if (!notif.find(val => val.id === id) && id !== select) {
        setNotif([...notif, { id, unreadConv }]);
      }
    });
    return () => {
      ipcRenderer.removeAllListeners('app-notification');
    };
  }, [notif, select]);

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
                  <div onClick={() => deleteApp(app.id)}>删除</div>
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
        {apps.map(app => {
          return (
            <li
              key={app.index}
              style={{ visibility: select === app.id ? 'visible' : 'hidden' }}
              className={style['red-bg']}>
              <webview
                useragent={`Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36&&${app.id}`}
                // eslint-disable-next-line no-undef
                // preload={`file://${path.join(__static, './index.js')}`}
                preload="../static/index.js"
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
