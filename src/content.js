
let globalTimestamps = [];

// parse time
function parseTimestamps(comment) {
  const regex = /(\d+:)?(\d+):(\d+)\s*(\.{0,3})\s*(.+)/g;
  const timestamps = [];
  let match;

  while ((match = regex.exec(comment)) !== null) {
    const [, hours, minutes, seconds, level, description] = match;
    timestamps.push({
      time: (hours ? parseInt(hours) * 3600 : 0) + parseInt(minutes) * 60 + parseInt(seconds),
      level: level.length, // 0 for chapters, 1-3 for subchapters and misc
      description: description.trim()
    });
  }

  return timestamps;
}

// parse time for ttv
function parseTimeString(timeString) {
  const parts = timeString.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}
  
// find timestamp in comments
function findTimestampComments() {
  const comments = document.querySelectorAll('#content-text');
  const timestampComments = [];
  for (const comment of comments) {
    const text = comment.textContent;
    if (text.match(/(\d+:)?(\d+):(\d+)/)) {
      timestampComments.push(text);
    }
  }
  return timestampComments;
}
  
// get video information, yt or ttv
function getVideoInfo() {
  const videoElement = document.querySelector('video');
  if (window.location.hostname === 'www.youtube.com' || window.location.hostname === 'youtu.be') {
    return {
      title: document.querySelector('h1.ytd-watch-metadata yt-formatted-string')?.textContent || 'Unknown Title',
      currentTime: videoElement ? videoElement.currentTime : 0,
      duration: videoElement ? videoElement.duration : 0
    };
  } else if (window.location.hostname === 'www.twitch.tv') {
    if (window.location.pathname.startsWith('/videos/')){
      return {
        title: document.title,
        currentTime: videoElement ? videoElement.currentTime : 0,
        duration: videoElement ? videoElement.duration : 0
      };
    } else {
      const twitchLiveTimeElement = document.querySelector('.live-time'); 
      return {
        title: document.title,
        currentTime: twitchLiveTimeElement ? parseTimeString(twitchLiveTimeElement.textContent) : 0,
        duration: 0
      };
    }
  }
}
  
// wait for comments
function waitForComments(maxAttempts = 10, interval = 1000) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const checkComments = () => {
      const comments = document.querySelectorAll('#content-text');
      if (comments.length > 0) {
        resolve();
      } else if (attempts >= maxAttempts) {
        reject(new Error('Comments not found after maximum attempts'));
      } else {
        attempts++;
        setTimeout(checkComments, interval);
      }
    };
    checkComments();
  });
}

// get timestamps
function getTimestamps() {
  return new Promise((resolve, reject) => {
    if (globalTimestamps.length > 0) {
      const videoInfo = getVideoInfo();
      resolve({ timestamps: globalTimestamps, videoInfo });
    } else {
      const videoInfo = getVideoInfo();
      resolve({ timestamps: globalTimestamps, videoInfo });
      waitForComments()
        .then(() => {
          const timestampComments = findTimestampComments();
          let timestamps = [];
          for (const comment of timestampComments) {
            timestamps = timestamps.concat(parseTimestamps(comment));
          }
          timestamps.sort((a, b) => a.time - b.time); // Sort timestamps by time
          globalTimestamps = timestamps;
          const videoInfo = getVideoInfo();
          resolve({ timestamps, videoInfo });
        })
        .catch((error) => {
          console.error('Error loading comments:', error);
          reject(error);
        });
    }
  });
}

function setTimestamps(newTimestamps) {
  globalTimestamps = newTimestamps;
}

// add a timestamp
function addTimestamp(description = '', offset = 0) {
  const videoInfo = getVideoInfo();
  if (videoInfo) {
    const currentTime = Math.floor(videoInfo.currentTime);
    const adjustedTime = Math.max(0, currentTime + offset);
    
    let level = 0;
    if (description && typeof description === 'string') {
      const levelMatch = description.match(/^(\.{0,3})/);
      level = levelMatch ? levelMatch[1].length : 0;
      description = description.replace(/^\.{0,3}/, '').trim();
    } else {
      description = '';
    }
    
    globalTimestamps.push({
      time: adjustedTime,
      level: level,
      description: description
    });
    globalTimestamps.sort((a, b) => a.time - b.time);
    return true;
  }
  return false;
}

// listener from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTimestamps') {
    getTimestamps()
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ error: error.message }));
    return true; // Indicates that the response will be sent asynchronously
  } else if (request.action === 'setTimestamps') {
    setTimestamps(request.timestamps);
    sendResponse({ success: true });
  } else if (request.action === 'addTimestamp') {
    const success = addTimestamp(request.description, request.offset);
    sendResponse({ success });
  } else if (request.action === 'seekTo') {
    const videoElement = document.querySelector('video');
    if (videoElement) {
      videoElement.currentTime = request.time;
    }
    sendResponse({ success: true });
  }
  return true;
});
  
// initialize get timestamps
window.addEventListener('load', () => {
  getTimestamps()
    .then(() => {
      console.log('Timestamps loaded successfully');
    })
    .catch((error) => {
      console.error('Error loading timestamps:', error);
    });
});