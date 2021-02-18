/* eslint-disable */
const { remote, ipcRenderer } = require('electron');

const oldXHROpen = window.XMLHttpRequest.prototype.open;
const oldSocketSend = window.WebSocket.prototype.send;
window.XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
  this.addEventListener('load', function () {
    try {
      const { data } = JSON.parse(this.responseText);
      if (data && data.ShopName) {
        ipcRenderer.sendToHost('load-name', {
          name: data.ShopName
        });
      }
    } catch (e) {
      throw e;
    }
  });
  return oldXHROpen.apply(this, arguments);
};

let flag = false;

window.WebSocket.prototype.send = function () {
  const oldMessage = this.onmessage;
  const oldSend = this.send;

  if (!flag) {
    this.send = function (data) {
      const str = String.fromCharCode(...new Uint8Array(data));
      const star2 = window.btoa(str);
      return oldSend.apply(this, arguments);
    };
    this.onmessage = function (value) {
      const { data } = value;
      const str = String.fromCharCode(...new Uint8Array(data));
      const star2 = window.btoa(str);

      const unreadConv = document.getElementsByClassName('unreadNum').length;
      ipcRenderer.sendToHost('socket-message', {
        data: star2,
        unreadConv
      });
      return oldMessage.apply(this, arguments);
    };
    flag = true;
  }
  return oldSocketSend.apply(this, arguments);
};
