import React, { useState } from 'react';
import { Layout, Menu, Avatar } from 'antd';

import style from './index.less';

const { Content, Sider } = Layout;

const Conv = React.forwardRef(({ data }, ref) => {
  const { onlineShopes, connectShop, shopes, openUpdataModal } = data;
  const [selectShop, setSelectShop] = useState(shopes[0] || {});

  return (
    <Layout className={style.main}>
      <Sider width={200}>
        <div className={style.sider}>
          <Menu
            defaultSelectedKeys={selectShop.shopUid}
            onSelect={({ key }) => {
              const shop = shopes.find(val => val.shopUid === key);
              setSelectShop(shop);
            }}
            className={style.menu}
            mode="inline">
            {shopes.map(shop => {
              const isOnline = onlineShopes.find(
                val => val.shopUid === shop.shopUid
              );
              const isConnect = connectShop.find(val => val === shop.shopUid);
              return (
                <Menu.Item key={shop.shopUid}>
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
          {selectShop.shopUid ? (
            <webview
              key={selectShop.shopUid}
              ref={ref}
              useragent="Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36"
              partition={`persist:${selectShop.shopUid}`}
              style={{ height: '100%', width: '100%' }}
              src="https://im.jinritemai.com/pc_seller/main/chat"
            />
          ) : null}
        </Content>
      </Layout>
    </Layout>
  );
});

export default Conv;
