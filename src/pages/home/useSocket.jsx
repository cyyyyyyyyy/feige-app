import { useEffect, useState } from 'react';

const { ipcRenderer } = window.require('electron');

const timer = {};

const useSocket = (onlineShopes, connectShop, quickReply) => {
  const [newConnectShop, setNewConnectShop] = useState([]);

  const handleSendMessage = ({ shopUid, id }) => {
    ipcRenderer.invoke('shop-send-message', {
      shopUid,
      userId: id,
      message: quickReply.autoMsg
    });
  };

  useEffect(() => {
    const { autoMsgTime } = quickReply;
    if (autoMsgTime) {
      ipcRenderer.on('new-message', (event, arg) => {
        const { customerId, shopUid, receiverId, auto_welcome_tag } = arg;

        // 自动回复消息不算。
        if (auto_welcome_tag !== '1') {
          clearTimeout(timer[receiverId]);
          timer[receiverId] = null;
        }

        if (customerId) {
          if (!timer[customerId]) {
            timer[customerId] = setTimeout(() => {
              handleSendMessage({ shopUid, id: customerId });
              timer[customerId] = null;
            }, 1000 * parseInt(autoMsgTime, 10));
          }
        }
      });
    }
    return () => {
      ipcRenderer.removeAllListeners(['new-message']);
    };
  }, [quickReply, timer]);

  const handleConnetShop = () => {
    const shopes = onlineShopes.filter(
      val => connectShop.indexOf(val.shopUid) === -1
    );

    const shopesPromise = shopes.map(({ shopUid }) => {
      return ipcRenderer.invoke('shop-ws-connect', {
        shopUid
      });
    });

    Promise.all(shopesPromise).then(values => {
      let shopesData = [];
      if (values) {
        shopesData = values.map(val => val.shopUid);
      }
      setNewConnectShop(shopesData);
    });
  };

  return { newConnectShop, handleConnetShop };
};

export default useSocket;
