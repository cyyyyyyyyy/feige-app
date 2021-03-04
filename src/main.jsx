import React from 'react';
import { ConfigProvider } from 'antd';
import { Provider } from 'react-redux';
import zhCN from 'antd/lib/locale/zh_CN';

import store from './store';
import Home from './pages/home';

const Main = () => {
  return (
    <Provider store={store}>
      <ConfigProvider locale={zhCN}>
        <Home />
      </ConfigProvider>
    </Provider>
  );
};

export default Main;
