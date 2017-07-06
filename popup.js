let target;
let stream;

const resize = (width, height, callback) => {
  chrome.windows.getCurrent(w => {
    const marginWidth = w.width - window.innerWidth;
    const marginHeight = w.height - window.innerHeight;
    chrome.windows.update(w.id, {
      width: width + marginWidth,
      height: height + marginHeight
    }, callback);
  });
};

const watchTitle = targetTab => {
  document.title = targetTab.title;
  chrome.tabs.onUpdated.addListener((targetTab, {title}) => {
    if (tabId === targetTab.id && title) {
      document.title = title;
    }
  });
};

const start = () => {
  if (!target || !stream) return;

  const video = document.querySelector('video');
  video.src = window.URL.createObjectURL(stream);

  watchTitle(target.tab);
};


chrome.runtime.sendMessage({type: 'ready'}, ({tab, rect, page}) => {
  target = {tab, rect, page};
  start();
});

chrome.tabCapture.capture({video: true}, st => {
  stream = st;
  start();
});

document.addEventListener('beforeunload', () => {
  stream && stream.stop();
});