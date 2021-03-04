import React, { useState, useRef, useEffect } from 'react';
import { Layout, Menu, Button, Space, Modal, message, Avatar } from 'antd';
import { v4 } from 'uuid';

import Convs from '../convs';

import style from './index.less';

const { session } = window.require('electron').remote;
const { ipcRenderer } = window.require('electron');
const { Header, Sider, Content } = Layout;

const Home = () => {
  const [visible, setVisible] = useState(false);
  const viewRef = useRef();
  const [shopes, setShopes] = useState([]);
  const [shopUid, setShopUid] = useState();

  const handleGetShopes = () => {
    ipcRenderer.invoke('get-shopes').then(res => {
      if (res.code === 0) {
        setShopes(res.data);
      }
    });
  };

  useEffect(() => {
    handleGetShopes();
  }, []);

  // 新增企业
  const handleAddShop = cookies => {
    if (shopUid) {
      let cookieString = '';
      const keys = Object.keys(cookies);
      keys.forEach(key => {
        cookieString += `${key}=${cookies[key]};`;
      });
      ipcRenderer
        .invoke('add-shop', {
          cookies: cookieString,
          shopUid
        })
        .then(res => {
          if (res.code === 0) {
            message.success('店铺添加成功');
            setVisible(false);
            handleGetShopes();
          }
        });
    }
  };

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
                handleAddShop(data);
              }
            });
        }
      });
    }
  }, [viewRef, visible, shopUid]);

  const openCreateModal = () => {
    setShopUid(v4());
    setVisible(true);
  };

  const closeCreateModal = () => {
    setShopUid('');
    setVisible(false);
  };

  return (
    <Layout className={style.main}>
      <Sider className={style.sider} width={140}>
        <div className={style.logo} />
        <Menu
          className={style.menu}
          defaultSelectedKeys={['1']}
          defaultOpenKeys={['sub1']}
          mode="inline"
          theme="dark">
          {shopes.map(shop => (
            <Menu.Item key={shop.shopUid}>
              <Avatar size="small" src={shop.shopLog} />
              <span style={{ paddingLeft: 4 }}>{shop.shopName}</span>
            </Menu.Item>
          ))}
        </Menu>
        <Space size={26} style={{ paddingLeft: 8 }}>
          <Button size="small" type="primary" onClick={openCreateModal}>
            新增
          </Button>
          <Button size="small" type="primary">
            编辑
          </Button>
        </Space>
      </Sider>
      <Layout>
        <Content>
          <Convs data={{ shopes }} />
        </Content>
      </Layout>
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
    </Layout>
  );
};

export default Home;
