let openedByShortcut = false;

chrome.commands.onCommand.addListener((command) => {
  if (command === "add_timestamps") {
    console.log('add_timestamps');
    openedByShortcut = true;
    chrome.action.openPopup();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'popupOpened') {
    console.log('popupOpened');
    sendResponse({openedByShortcut: openedByShortcut});
    openedByShortcut = false;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.sync.get(['onlyVodTS', 'displayMarker'], (result) => {
      sendResponse({
        onlyVodTS: result.onlyVodTS || false,
        displayMarker: result.displayMarker !== false
      });
    });
    return true;
  } else if (request.action === 'updateSettings') {
    chrome.storage.sync.set(request.settings, () => {
      sendResponse({success: true});
    });
    return true;
  }
});