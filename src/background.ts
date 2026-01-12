chrome.commands.onCommand.addListener(async (command) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) return;

    const url = tab.url || '';
    const isYouTube = url.includes('youtube.com');
    const isTwitch = url.includes('twitch.tv');

    if (!isYouTube && !isTwitch) return;

    if (command === 'create-timestamp') {
        chrome.tabs.sendMessage(tab.id, { type: 'CREATE_TIMESTAMP' });
    } else if (command === 'add-end-time') {
        chrome.tabs.sendMessage(tab.id, { type: 'ADD_END_TIME' });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_TIMESTAMPS') {
        chrome.storage.local.get('vodts_timestamps').then(result => {
            sendResponse(result.vodts_timestamps || []);
        });
        return true;
    }

    if (message.type === 'SAVE_TIMESTAMP') {
        chrome.storage.local.get('vodts_timestamps').then(result => {
            const timestamps = result.vodts_timestamps || [];
            timestamps.push(message.payload);
            chrome.storage.local.set({ vodts_timestamps: timestamps }).then(() => {
                sendResponse({ success: true });
            });
        });
        return true;
    }

    if (message.type === 'UPDATE_TIMESTAMP') {
        chrome.storage.local.get('vodts_timestamps').then(result => {
            const timestamps = result.vodts_timestamps || [];
            const index = timestamps.findIndex((t: { id: string }) => t.id === message.payload.id);
            if (index !== -1) {
                timestamps[index] = message.payload;
                chrome.storage.local.set({ vodts_timestamps: timestamps }).then(() => {
                    sendResponse({ success: true });
                });
            } else {
                sendResponse({ success: false });
            }
        });
        return true;
    }
});

