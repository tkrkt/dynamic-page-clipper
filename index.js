/*global chrome*/

let targetTab = null;

chrome.browserAction.onClicked.addListener(tab => {
  if (targetTab) return;
  targetTab = tab;
  chrome.tabs.executeScript(tab.id, {file: 'content.js'});
  chrome.windows.create({
    url: chrome.extension.getURL('popup.html'),
    type: chrome.windows.WindowType.POPUP,
    width: 640,
    height: 400,
    focused: false
  });
});

chrome.runtime.onMessage.addListener((message, {}, response) => {
  if (message.type === 'targetTab') {
    response(targetTab);
    targetTab = null;
  }
});
