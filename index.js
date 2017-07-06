/*global chrome*/

let target = null;

chrome.browserAction.onClicked.addListener(tab => {
  if (target) return;
  chrome.tabs.executeScript(tab.id, {file: 'content.js'});
});

chrome.runtime.onMessage.addListener((message, {tab}, response) => {
  if (message.type === 'rect') {
    target = {
      tab,
      rect: message.rect,
      page: message.page
    };
    chrome.windows.create({
      url: chrome.extension.getURL('popup.html'),
      type: chrome.windows.WindowType.POPUP,
      width: 640,
      height: 400,
      focused: false
    });
  } else if (message.type === 'ready') {
    response(target);
    target = null;
  }
});
