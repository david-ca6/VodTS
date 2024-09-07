
let globalTimestamps = [];

function parseTimestamps(comment) {
  const regex = /(\d+:)?(\d+):(\d+)\s*(\.{0,3})\s*(.+)/g;
  const timestamps = [];
  let match;

  while ((match = regex.exec(comment)) !== null) {
    const [, hours, minutes, seconds, level, description] = match;
    timestamps.push({
      time: (hours ? parseInt(hours) * 3600 : 0) + parseInt(minutes) * 60 + parseInt(seconds),
      level: level.length,
      description: description.trim()
    });
  }

  return timestamps;
}

function parseTimeString(timeString) {
  const parts = timeString.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}
  
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
          timestamps.sort((a, b) => a.time - b.time);
          globalTimestamps = timestamps;
          const videoInfo = getVideoInfo();
          resolve({ timestamps, videoInfo });
          injectTimestampDots(timestamps);
        })
        .catch((error) => {
          console.error('Error loading comments:', error);
          const videoInfo = getVideoInfo();
          resolve({ timestamps: globalTimestamps, videoInfo });
        });
    }
  });
}

function setTimestamps(newTimestamps) {
  globalTimestamps = newTimestamps;
  injectTimestampDots(newTimestamps);
}

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
    injectTimestampDots(globalTimestamps);
    return true;
  }
  return false;
}

function injectTimestampDots(timestamps) {
  if (window.location.hostname !== 'www.youtube.com' && window.location.hostname !== 'youtu.be') return;

  const progressBar = document.querySelector('.ytp-progress-bar');
  if (!progressBar) return;

  const existingDots = progressBar.querySelectorAll('.timestamp-dot');
  existingDots.forEach(dot => dot.remove());

  const videoDuration = getVideoInfo().duration;

  timestamps.forEach(timestamp => {
    return;
    if (timestamp.level === 0 || timestamp.level === 1) {
      const dot = document.createElement('div');
      if(timestamp.level === 0){
        dot.className = 'timestamp-dot';
        dot.style.position = 'absolute';
        dot.style.width = '8px';
        dot.style.height = '8px';
        dot.style.borderRadius = '50%';
        dot.style.backgroundColor = 'yellow';
        dot.style.top = '50%';
        dot.style.transform = 'translateY(-50%)';
        dot.style.left = `${(timestamp.time / videoDuration) * 100}%`;
        dot.style.zIndex = '1000';
      } else if (timestamp.level === 1){
        dot.className = 'timestamp-dot';
        dot.style.position = 'absolute';
        dot.style.width = '8px';
        dot.style.height = '8px';
        dot.style.borderRadius = '50%';
        dot.style.backgroundColor = 'blue';
        dot.style.top = '50%';
        dot.style.transform = 'translateY(-50%)';
        dot.style.left = `${(timestamp.time / videoDuration) * 100}%`;
        dot.style.zIndex = '1000';
      }

      const tooltip = document.createElement('div');
      tooltip.className = 'timestamp-tooltip';
      tooltip.textContent = timestamp.description;
      tooltip.style.position = 'absolute';
      tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      tooltip.style.color = 'white';
      tooltip.style.padding = '5px';
      tooltip.style.borderRadius = '3px';
      tooltip.style.fontSize = '12px';
      tooltip.style.top = '200%';
      tooltip.style.left = '50%';
      tooltip.style.transform = 'translateX(-50%)';
      tooltip.style.display = 'none';
      tooltip.style.whiteSpace = 'nowrap';

      dot.appendChild(tooltip);

      dot.addEventListener('mouseover', () => {
        tooltip.style.display = 'block';
      });

      dot.addEventListener('mouseout', () => {
        tooltip.style.display = 'none';
      });

      progressBar.appendChild(dot);
    }
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTimestamps') {
    getTimestamps()
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ error: error.message }));
    return true;
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
  
window.addEventListener('load', () => {
  getTimestamps()
    .then(() => {
      console.log('Timestamps loaded successfully');
      injectTimestampDots(globalTimestamps);
    })
    .catch((error) => {
      console.error('Error loading timestamps:', error);
    });
});

// observer.observe(document.body, {
//   childList: true,
//   subtree: true
// });