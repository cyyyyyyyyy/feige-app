import React, { useState } from 'react';
import { Button, Table, Modal, Form, Input, InputNumber } from 'antd';

import style from './index.less';

const Setting = ({ data }) => {
  const {
    shopes,
    connectShop,
    onlineShopes,
    openUpdataModal,
    openCreateModal,
    handleUpdateQuickReply,
    handleDeleteShop,
    quickReply,
    handleConnetShop
  } = data;
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);

  const shopesData =
    shopes &&
    shopes.map(shop => {
      const isOnline = onlineShopes.find(val => val.shopUid === shop.shopUid);
      const isConnect = connectShop.find(val => val === shop.shopUid);
      return {
        ...shop,
        onlineStatus: isOnline,
        connectStatus: isConnect
      };
    });

  const columns = [
    {
      title: '登录状态',
      dataIndex: 'onlineStatus',
      width: 120,
      render(val) {
        return val ? (
          <span className={style.success}>已登录</span>
        ) : (
          <span className={style.error}>未登录</span>
        );
      }
    },
    {
      title: '连接状态',
      dataIndex: 'connectStatus',
      width: 120,
      render(val) {
        return val ? (
          <span className={style.success}>已连接</span>
        ) : (
          <span className={style.error}>未连接</span>
        );
      }
    },
    {
      title: '名称',
      dataIndex: 'shopName'
    },
    {
      title: '操作',
      width: 160,
      render(val, item) {
        return (
          <div>
            <a onClick={() => handleDeleteShop(item.shopUid)}>删除</a>
            {!item.onlineStatus ? (
              <a onClick={() => openUpdataModal(item.shopUid)}>重新登录</a>
            ) : null}
          </div>
        );
      }
    }
  ];

  return (
    <div style={{ margin: 16 }}>
      <div style={{ paddingBottom: 8 }}>
        <Button onClick={openCreateModal} type="primary">
          新增店铺
        </Button>
        <Button
          style={{ marginLeft: 8 }}
          onClick={() => setVisible(true)}
          type="primary">
          编辑自动回复话术
        </Button>
        <Button
          o
          style={{ marginLeft: 8 }}
          onClick={handleConnetShop}
          type="primary">
          重连
        </Button>
      </div>
      <Table
        size="small"
        dataSource={shopesData}
        columns={columns}
        pagination={false}
      />
      <Modal
        title="编辑自动回复话术"
        visible={visible}
        onOk={() => {
          form.validateFields().then(value => {
            handleUpdateQuickReply(value);
            setVisible(false);
          });
        }}
        onCancel={() => setVisible(false)}>
        <Form form={form} name="control-hooks" layout="vertical">
          <Form.Item
            name="autoMsg"
            label="自动回复消息"
            rules={[{ required: true }]}
            initialValue={quickReply.autoMsg}>
            <Input />
          </Form.Item>
        </Form>
        <Form form={form} name="control-hooks" layout="vertical">
          <Form.Item
            name="autoMsgTime"
            label="自动回复时间"
            rules={[{ required: true }]}
            initialValue={quickReply.autoMsgTime}>
            <InputNumber min={5} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Setting;
