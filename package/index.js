/*global chrome*/

let connections = [];

const inject = tab => {
  if (!tab.url.startsWith('http')) return;
  if (tab.url.startsWith('https://chrome.google.com/webstore')) return;

  const connection = connections.find(c => c.target.tab.id === tab.id);
  if (connection) {
    chrome.windows.update(connection.clipper.window.id, {focused: true});
  } else {
    chrome.tabs.executeScript(tab.id, {file: 'content.js'});
  }
};

chrome.browserAction.onClicked.addListener(inject);
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    title: 'Clip page',
    id: 'clip',
    contexts: ['page']
  });
});
chrome.contextMenus.onClicked.addListener(({menuItemId}, tab) => {
  if (menuItemId === 'clip') {
    inject(tab);
  }
});

chrome.runtime.onMessage.addListener((message, {tab}) => {
  if (message.type === 'rect') {
    const {rect, page} = message;
    const titleBarHeight = 22; // mac
    chrome.windows.create({
      url: chrome.extension.getURL('popup.html'),
      type: chrome.windows.WindowType.POPUP,
      width: rect.width,
      height: rect.height + titleBarHeight,
      left: rect.screenX,
      top: rect.screenY - titleBarHeight,
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
          rect,
          page
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