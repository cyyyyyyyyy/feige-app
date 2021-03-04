import React, { useEffect, useState } from 'react';
import { Layout, Menu } from 'antd';

import Avatar from 'antd/lib/avatar/avatar';
import style from './index.less';

const { ipcRenderer } = window.require('electron');
const { Sider, Content } = Layout;

const Convs = ({ data }) => {
  const { shopes } = data;
  const [convs, setConvs] = useState([]);

  // 获取多个商铺的当前对话列表
  const handleGetConvs = shopUid => {
    ipcRenderer.invoke('get-shop-conv', { shopUid }).then(res => {
      if (res.code === 0) {
        // 添加shopId
        const newData = [];
        if (res.data.length > 0) {
          res.data.forEach(shop => {
            newData.push({ ...shop, shopUid });
          });
        }
        setConvs(newData);
      }
    });
  };

  // 创建socket连接
  const handleConnetShop = shopUid => {
    ipcRenderer
      .invoke('shop-ws-connect', {
        shopUid
      })
      .then(res => {
        console.log(res);
      });
  };

  const handleSendMessage = ({ shopUid, id }) => {
    ipcRenderer.invoke('shop-send-message', {
      shopUid,
      userId: id,
      message: '测试消息'
    });
  };

  useEffect(() => {
    if (shopes && shopes.length > 0) {
      shopes.forEach(val => {
        handleGetConvs(val.shopUid);
        handleConnetShop(val.shopUid);
      });
    }
  }, [shopes]);

  return (
    <Layout className={style.main}>
      <Sider style={{ backgroundColor: '#fff' }}>
        <Menu>
          {convs.map(conv => (
            <Menu.Item key={conv.id} onClick={() => handleSendMessage(conv)}>
              <Avatar src={conv.avatar_url} size="small" />
              <span style={{ paddingLeft: 8, fontSize: 16 }}>
                {conv.screen_name}
              </span>
            </Menu.Item>
          ))}
        </Menu>
      </Sider>
      <Content>
        {shopes &&
          shopes.map(({ shopUid }) => {
            return (
              <webview
                useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36"
                partition={`persist:${shopUid}`}
                style={{ height: '100%', width: '100%' }}
                src="https://im.jinritemai.com/pc_seller"
              />
            );
          })}
      </Content>
    </Layout>
  );
};

export default Convs;
