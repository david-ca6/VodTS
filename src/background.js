let openedByShortcut = false;

chrome.commands.onCommand.addListener((command) => {
  if (command === "add_timestamps") {
    openedByShortcut = true;
    chrome.action.openPopup();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'popupOpened') {
    sendResponse({openedByShortcut: openedByShortcut});
    openedByShortcut = false;
  }
});