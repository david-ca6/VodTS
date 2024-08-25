
let globalTimestamps = [];

// Function to parse timestamps from a comment
function parseTimestamps(comment) {
    // Updated regex to match all timestamp formats
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
  
  // Function to find comments with timestamps
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
  
  // Function to get video information
  function getVideoInfo() {
    const videoElement = document.querySelector('video');
    return {
      title: document.querySelector('h1.ytd-watch-metadata yt-formatted-string')?.textContent || 'Unknown Title',
      currentTime: videoElement ? videoElement.currentTime : 0,
      duration: videoElement ? videoElement.duration : 0
    };
  }
  
  // Function to wait for comments to load
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
  
  // Function to get timestamps
  function getTimestamps() {
    return new Promise((resolve, reject) => {
      if (globalTimestamps.length > 0) {
        const videoInfo = getVideoInfo();
        resolve({ timestamps: globalTimestamps, videoInfo });
      } else {
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


// Function to add a new timestamp
function addTimestamp() {
    const videoElement = document.querySelector('video');
    if (videoElement) {
      const currentTime = Math.floor(videoElement.currentTime);
      const description = prompt('Enter description for the new timestamp:');
      if (description) {
        globalTimestamps.push({
          time: currentTime,
          level: 0, // Default to chapter level
          description: description.trim()
        });
        globalTimestamps.sort((a, b) => a.time - b.time);
        return true;
      }
    }
    return false;
  }
  
  // Listen for messages from the popup
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
      const success = addTimestamp();
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
  
  // Initialize timestamp checking when the page loads
window.addEventListener('load', () => {
  getTimestamps()
    .then(() => {
      console.log('Timestamps loaded successfully');
    })
    .catch((error) => {
      console.error('Error loading timestamps:', error);
    });
});