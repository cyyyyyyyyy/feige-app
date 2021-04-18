import React from 'react';
import { Layout, Menu, Avatar } from 'antd';

import style from './index.less';

const { Content, Sider } = Layout;

const Backend = React.forwardRef(({ data }, ref) => {
  const {
    onlineShopes,
    connectShop,
    shopes,
    notifShopes,
    selectShop,
    openUpdataModal,
    handleDelNotifShop,
    handleSelectShop
  } = data;

  return (
    <Layout className={style.main}>
      <Sider width={200}>
        <div className={style.sider}>
          <Menu
            selectedKeys={[selectShop.shopUid]}
            onSelect={({ key }) => {
              const shop = shopes.find(val => val.shopUid === key);
              handleSelectShop(shop);
              handleDelNotifShop(key);
            }}
            className={style.menu}
            mode="inline">
            {shopes.map(shop => {
              const { shopUid } = shop;
              const isOnline = onlineShopes.find(
                val => val.shopUid === shopUid
              );
              const isConnect = connectShop.find(val => val === shopUid);
              return (
                <Menu.Item
                  key={shop.shopUid}
                  style={{
                    backgroundColor:
                      shopUid !== selectShop.shopUid &&
                      notifShopes.indexOf(shopUid) !== -1
                        ? '#faad14'
                        : ''
                  }}>
                  <div className={style.item}>
                    <Avatar
                      size="small"
                      src={shop.shopLog}
                      className={style.logo}
                    />
                    <div className={style.item_text}>
                      {isOnline ? (
                        <span style={{ padding: '0 8px', overflow: 'hidden' }}>
                          {shop.shopName}
                        </span>
                      ) : (
                        <span
                          style={{ paddingLeft: 8 }}
                          onClick={() => openUpdataModal(shop.shopUid)}>
                          未登录
                        </span>
                      )}
                    </div>
                    <i
                      className={style.cirle}
                      style={{ backgroundColor: isConnect ? 'green' : '' }}
                    />
                  </div>
                </Menu.Item>
              );
            })}
          </Menu>
        </div>
      </Sider>
      <Layout className={style.main}>
        <Content>
          <webview
            key={selectShop.shopUid}
            ref={ref}
            useragent="Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36"
            partition={`persist:${selectShop.shopUid}`}
            style={{ height: '100%', width: '100%' }}
            src="https://fxg.jinritemai.com/ffa/mshop/homepage/index"
          />
        </Content>
      </Layout>
    </Layout>
  );
});

export default Backend;
