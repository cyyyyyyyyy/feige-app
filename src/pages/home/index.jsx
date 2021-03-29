import React, { useState, useRef, useEffect } from 'react';
import { Modal, message, Layout, Menu } from 'antd';
import { v4 } from 'uuid';

import Convs from '../convs';
import Setting from '../setting';
import useSocket from './useSocket';

import style from './index.less';

const electron = window.require('electron');
const { session } = electron.remote;
const { ipcRenderer } = electron;
const { Header, Content } = Layout;

const Home = () => {
  const [visible, setVisible] = useState(false);
  const viewRef = useRef();
  const convRef = useRef();
  const [shopes, setShopes] = useState([]);
  const [onlineShopes, setOnlineShopes] = useState([]);
  const [connectShop, setConnectShop] = useState([]);
  const [shopUid, setShopUid] = useState({});
  const [shopUidStatus, setShopUidStatus] = useState('');
  const [quickReply, setQuickReply] = useState({});
  const { newConnectShop, handleConnetShop } = useSocket(
    onlineShopes,
    connectShop,
    quickReply
  );
  const [type, setType] = useState('1');

  const openCreateModal = () => {
    setShopUid(v4());
    setShopUidStatus('create');
    setVisible(true);
  };

  const closeCreateModal = () => {
    setShopUid('');
    setShopUidStatus('');
    setVisible(false);
    if (convRef.current) {
      convRef.current.reload();
    }
  };

  const openUpdataModal = id => {
    setShopUid(id);
    setShopUidStatus('update');
    setVisible(true);
  };

  const handleGetShopes = () => {
    ipcRenderer.invoke('get-shopes').then(res => {
      if (res.code === 0) {
        setShopes(res.data);
      }
    });
  };

  const handleDeleteShop = value => {
    ipcRenderer.invoke('delete-shope', value).then(res => {
      if (res.code === 0) {
        handleGetShopes();
      }
    });
  };

  const getQuickReply = () => {
    ipcRenderer.invoke('get-quick-reply').then(res => {
      if (res.code === 0) {
        setQuickReply(res.data);
      }
    });
  };

  const handleUpdateQuickReply = data => {
    ipcRenderer.invoke('update-quick-reply', data).then(res => {
      if (res.code === 0) {
        getQuickReply(res.data);
      }
    });
  };

  // 新增企业
  const handleUpdateShop = cookies => {
    if (shopUid) {
      let cookieString = '';
      const keys = Object.keys(cookies);
      keys.forEach(key => {
        cookieString += `${key}=${cookies[key]};`;
      });
      ipcRenderer
        .invoke('update-shop', {
          cookies: cookieString,
          shopUid,
          shopUidStatus
        })
        .then(res => {
          if (res.code === 0) {
            message.success(res.message);
            closeCreateModal();
            handleGetShopes();
          }
        });
    }
  };

  useEffect(() => {
    handleGetShopes();
    getQuickReply();
  }, []);

  useEffect(() => {
    ipcRenderer.invoke('check-shopes').then(({ code, data }) => {
      if (code === 0) {
        setOnlineShopes(data);
      }
    });
    ipcRenderer.invoke('get-ws-connect-shop').then(({ data }) => {
      setConnectShop(data);
    });
  }, [shopes]);

  useEffect(() => {
    handleConnetShop();
  }, [onlineShopes, connectShop]);

  useEffect(() => {
    if (viewRef && viewRef.current) {
      viewRef.current.addEventListener('did-navigate', ({ url }) => {
        if (
          viewRef.current &&
          viewRef.current.partition &&
          url.indexOf('index.html') !== -1
        ) {
          session
            .fromPartition(viewRef.current.partition)
            .cookies.get({ url })
            .then(cookies => {
              const data = {};
              if (cookies) {
                cookies.forEach(val => {
                  data[val.name] = val.value;
                });
                handleUpdateShop(data);
              }
            });
        }
      });
    }
  }, [viewRef, visible, shopUid, shopUidStatus]);

  const propsData = {
    shopes,
    connectShop: [...connectShop, ...newConnectShop],
    onlineShopes,
    openUpdataModal,
    openCreateModal,
    quickReply,
    handleUpdateQuickReply,
    handleDeleteShop
  };

  return (
    <Layout className={style.main}>
      <Header className={style.header}>
        <div className={style.logo}>飞鸽客户端</div>
        <Menu
          theme="dark"
          mode="horizontal"
          onSelect={({ key }) => {
            setType(key);
          }}
          defaultSelectedKeys={[type]}
          style={{ flex: '1 1 auto' }}>
          <Menu.Item key="1">监控</Menu.Item>
          <Menu.Item key="2">对话</Menu.Item>
        </Menu>
      </Header>
      <Content>
        {type === '1' ? (
          <Setting data={propsData} />
        ) : (
          <Convs data={propsData} />
        )}
        <Modal
          width={800}
          visible={visible}
          footer={null}
          onCancel={closeCreateModal}
          title="登录模块">
          <div className={style.web_view}>
            <webview
              key={shopUid}
              ref={viewRef}
              useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36"
              partition={`persist:${shopUid}`}
              style={{ height: '100%', width: '100%' }}
              src="https://fxg.jinritemai.com/login"
            />
          </div>
        </Modal>
      </Content>
    </Layout>
  );
};

export default Home;
