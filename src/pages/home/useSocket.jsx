import { useEffect, useState } from 'react';

const { ipcRenderer } = window.require('electron');

const timer = {};

const useSocket = ({
  onlineShopes,
  connectShop,
  quickReply,
  handleAddNotifShop,
  selectShop,
  shopes,
  handleClickNotif,
  type
}) => {
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
        const { customerId, shopUid, receiverId, role, content } = arg;
        clearTimeout(timer[receiverId]);
        timer[receiverId] = null;

        if (customerId && role !== '2') {
          if (shopUid !== selectShop.shopUid || type !== '2') {
            const shop = shopes.find(val => val.shopUid === shopUid);
            const notif = new Notification(`${shop.shopName}`, {
              body: content
            });
            notif.onclick = () => {
              handleClickNotif(shop);
              ipcRenderer.invoke('show-app');
            };
          }

          if (shopUid !== selectShop.shopUid) {
            handleAddNotifShop(shopUid);
          }

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
  }, [quickReply, timer, selectShop]);

  const handleConnetShop = () => {
    const filtershopes = onlineShopes.filter(
      val => connectShop.indexOf(val.shopUid) === -1
    );

    const shopesPromise = filtershopes.map(({ shopUid }) => {
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
