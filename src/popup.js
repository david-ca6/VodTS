// Function to format time in h:mm:ss
function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  
  // Function to update timestamp highlighting
  function updateHighlighting(currentTime) {
    const timestamps = document.querySelectorAll('.timestamp');
    timestamps.forEach((timestamp, index) => {
      const time = parseFloat(timestamp.dataset.time);
      if (time <= currentTime) {
        timestamp.classList.add('past');
        if (index === timestamps.length - 1 || parseFloat(timestamps[index + 1].dataset.time) > currentTime) {
          timestamp.classList.add('current');
        } else {
          timestamp.classList.remove('current');
        }
      } else {
        timestamp.classList.remove('past', 'current');
      }
    });
  }
  
  // Function to create timestamp elements
  function createTimestampElements(timestamps) {
    const timestampsList = document.getElementById('timestamps');
    timestampsList.innerHTML = '';
    timestamps.forEach(timestamp => {
      const li = document.createElement('li');
      li.classList.add('timestamp', `level-${timestamp.level}`);
      li.textContent = `${formatTime(timestamp.time)} ${timestamp.description}`;
      li.dataset.time = timestamp.time;
      li.addEventListener('click', () => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, {action: 'seekTo', time: timestamp.time});
        });
      });
      timestampsList.appendChild(li);
    });
  }
  
  // Function to update video info
  function updateVideoInfo(videoInfo) {
    const videoInfoElement = document.getElementById('video-info');
    videoInfoElement.innerHTML = `
      <strong>${videoInfo.title}</strong><br>
      Current time: ${formatTime(videoInfo.currentTime)}<br>
      Duration: ${formatTime(videoInfo.duration)}
    `;
  }
  
  // Function to load timestamps
  function loadTimestamps() {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'getTimestamps'}, (response) => {
        if (response && response.timestamps) {
          createTimestampElements(response.timestamps);
          updateVideoInfo(response.videoInfo);
          updateHighlighting(response.videoInfo.currentTime);
  
          // Update highlighting every second
          setInterval(() => {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'getTimestamps'}, (response) => {
              if (response && response.videoInfo) {
                updateHighlighting(response.videoInfo.currentTime);
                updateVideoInfo(response.videoInfo);
              }
            });
          }, 1000);
        } else if (response && response.error) {
          document.getElementById('timestamps').innerHTML = `<p>Error: ${response.error}</p>`;
        } else {
          document.getElementById('timestamps').innerHTML = '<p>No timestamps found or not on a YouTube video page.</p>';
        }
      });
    });
  }
  
  // Function to initialize the popup
  function initPopup() {
    loadTimestamps();
  
    // Add event listener for reload button
    document.getElementById('reload-button').addEventListener('click', () => {
      document.getElementById('timestamps').innerHTML = '<p>Reloading timestamps...</p>';
      loadTimestamps();
    });
  }
  
  // Initialize the popup when the DOM is loaded
  document.addEventListener('DOMContentLoaded', initPopup);