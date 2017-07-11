/*global chrome*/

let connections = [];

chrome.browserAction.onClicked.addListener(tab => {
  const connection = connections.find(c => c.target.tab.id === tab.id);
  if (connection) {
    chrome.windows.update(connection.clipper.window.id, {focused: true});
  } else {
    chrome.tabs.executeScript(tab.id, {file: 'content.js'});
  }
});

chrome.runtime.onMessage.addListener((message, {tab}) => {
  if (message.type === 'rect') {
    const {rect, page} = message;
    target = {
      tab,
      rect: message.rect,
      page: message.page
    };
    chrome.windows.create({
      url: chrome.extension.getURL('popup.html'),
      type: chrome.windows.WindowType.POPUP,
      width: rect.width,
      height: rect.height + 22, // title bar height
      left: rect.screenX,
      top: rect.screenY - 22,
      focused: false
    }, w => {
      const clipperTab = w.tabs[0];
      connections.push({
        clipper: {
          tab: clipperTab,
          window: w
        },
        target: {
          tab,
          rect: message.rect,
          page: message.page
        }
      });
    });
  }
});

chrome.runtime.onConnect.addListener(port => {
  const senderTab = port.sender.tab;
  const connection = connections.find(c => c.clipper.tab.id === senderTab.id);
  if (!connection) return;
  port.postMessage(connection.target);
  port.onDisconnect.addListener(() => {
    connections = connections.filter(c => c !== connection);
  });
});