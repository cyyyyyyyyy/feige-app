const { clipboard, Menu } = require('electron');

const contextMenu = window => {
  // 页面内右键菜单
  window.on('context-menu', (event, params) => {
    const menuTmpl = [
      {
        label: '刷新',
        click() {
          window.reload();
        }
      },
      {
        label: '后退',
        click() {
          window.goBack();
        }
      }
    ];
    if (params.editFlags.canCopy) menuTmpl.push({ label: '复制', role: 'copy' });
    if (params.editFlags.canCut) menuTmpl.push({ label: '剪切', role: 'cut' });
    if (params.editFlags.canPaste) menuTmpl.push({ label: '粘贴', role: 'paste' });
    if (params.editFlags.canDelete) menuTmpl.push({ label: '删除', role: 'delete' });

    if (params.linkURL) {
      menuTmpl.push({
        label: '复制链接地址',
        click() {
          clipboard.writeText(params.linkURL);
        }
      });
    }
    if (['image'].indexOf(params.mediaType) > -1) {
      menuTmpl.push({
        label: '复制图片',
        click() {
          window.copyImageAt(params.x, params.y);
        }
      });
    }
    const menu = Menu.buildFromTemplate(menuTmpl);
    const { x, y } = params;
    menu.popup({ window, x, y });
  });
};

module.exports = contextMenu;
