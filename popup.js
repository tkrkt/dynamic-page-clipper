/* global chrome*/

const port = chrome.runtime.connect();
port.onMessage.addListener(({tab, rect, page}) => {
  const devPix = window.devicePixelRatio || 1;
  chrome.tabCapture.capture({
    video: true,
    videoConstraints: {
      mandatory: {
        maxWidth: page.width * devPix,
        maxHeight: page.height * devPix
      }
    }
  }, stream => {
    // set style
    const video = document.querySelector('video');
    video.src = window.URL.createObjectURL(stream);
    video.width = page.width;
    video.height = page.height;
    Object.assign(video.style, {
      transformOrigin: `${Math.floor(rect.x)}px ${Math.floor(rect.y)}px`,
      transform: `translate(-${Math.floor(rect.x)}px, -${Math.floor(rect.y)}px)`
    });

    // fix window size
    chrome.windows.getCurrent(w => {
      const marginWidth = w.width - window.innerWidth;
      const marginHeight = w.height - window.innerHeight;
      chrome.windows.update(w.id, {
        width: rect.width + marginWidth,
        height: rect.height + marginHeight
      });
    });

    // watch resize event
    window.addEventListener('resize', () => {
      const scale = Math.min(window.innerWidth / rect.width, window.innerHeight / rect.height);
      Object.assign(video.style, {
        transformOrigin: `${Math.floor(rect.x)}px ${Math.floor(rect.y)}px`,
        transform: `translate(-${Math.floor(rect.x)}px, -${Math.floor(rect.y)}px) scale(${scale})`
      });
    }, false);

    // watch title
    document.title = tab.title;
    chrome.tabs.onUpdated.addListener((targetTab, {title}) => {
      if (targetTab.id === tab.id && title) {
        document.title = title;
      }
    });

    // watch close event
    document.addEventListener('beforeunload', () => {
      stream.getVideoTracks()[0].stop();
    });
    chrome.tabs.onRemoved.addListener(tabId => {
      if (tabId === tab.id) {
        chrome.tabs.getCurrent(currentTab => {
          chrome.tabs.remove(currentTab.id);
        });
      }
    });
  });
});