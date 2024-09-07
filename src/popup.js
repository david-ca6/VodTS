function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(1, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

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

function updateVideoInfo(videoInfo) {
  const videoInfoElement = document.getElementById('video-info');
  videoInfoElement.innerHTML = `
    <strong>${videoInfo.title}</strong><br>
    Current time: ${formatTime(videoInfo.currentTime)}<br>
    Duration: ${formatTime(videoInfo.duration)}
  `;
}

function formatTimestampsForCopy(timestamps) {
  return timestamps.map(t => `${formatTime(t.time)} ${''.padEnd(t.level, '.')}${t.description}`).join('\n');
}

function parseTimestamps(text) {
  const lines = text.split('\n');
  return lines.map(line => {
    const match = line.match(/(\d+:)?(\d+):(\d+)\s*(\.{0,3})\s*(.+)/);
    if (match) {
      const [, hours, minutes, seconds, level, description] = match;
      return {
        time: (hours ? parseInt(hours) * 3600 : 0) + parseInt(minutes) * 60 + parseInt(seconds),
        level: level.length,
        description: description.trim()
      };
    }
    return null;
  }).filter(t => t !== null);
}

function loadTimestamps() {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'getTimestamps'}, (response) => {
      if (response && response.timestamps) {
        createTimestampElements(response.timestamps);
        updateVideoInfo(response.videoInfo);
        updateHighlighting(response.videoInfo.currentTime);

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
        document.getElementById('timestamps').innerHTML = '<p>No timestamps found or not on a video page.</p><p>On youtube, try scrolling down in the comment section to load the comments, or paste the timestamps you want to use.</p><p>On Twitch, paste the timestamps you want to use.</p><p>For Twitch Livestream, only adding timestamp is supported, Twitch Vod have full featues support.</p>';
      }
    });
  });
}

function showAddTimestampPopup() {
  const popup = document.createElement('div');
  popup.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center;">
      <div style="background: #333; padding: 20px; border-radius: 10px;">
        <h3>Add Timestamp</h3>
        <input type="text" id="timestamp-description" placeholder="Description (use . for level)" style="width: 100%; margin-bottom: 10px;">
        <input type="number" id="timestamp-offset" placeholder="Time offset (in seconds)" style="width: 100%; margin-bottom: 10px;">
        <button id="confirm-add-timestamp">Add</button>
        <button id="cancel-add-timestamp">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(popup);

  const descriptionInput = document.getElementById('timestamp-description');
  const offsetInput = document.getElementById('timestamp-offset');
  const confirmButton = document.getElementById('confirm-add-timestamp');

  descriptionInput.focus();

  function addTimestamp() {
    const description = descriptionInput.value;
    const offset = parseInt(offsetInput.value) || 0;
    
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'addTimestamp', description, offset}, (response) => {
        if (response && response.success) {
          loadTimestamps();
        } else {
          alert('Failed to add timestamp');
        }
        document.body.removeChild(popup);
      });
    });
  }

  confirmButton.addEventListener('click', addTimestamp);

  descriptionInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addTimestamp();
    }
  });

  offsetInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addTimestamp();
    }
  });

  document.getElementById('cancel-add-timestamp').addEventListener('click', () => {
    document.body.removeChild(popup);
  });
}

function initPopup() {
  loadTimestamps();

  document.getElementById('reload-button').addEventListener('click', () => {
    document.getElementById('timestamps').innerHTML = '<p>Reloading timestamps...</p>';
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'reloadTimestamps'}, (response) => {
        if (response && response.success) {
          loadTimestamps();
        } else {
          alert('Failed to reload timestamps');
        }
      });
    });
  });

  document.getElementById('paste-button').addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      const timestamps = parseTimestamps(text);
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'setTimestamps', timestamps}, (response) => {
          if (response && response.success) {
            loadTimestamps();
          } else {
            alert('Failed to paste timestamps');
          }
        });
      });
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      alert('Failed to read clipboard contents');
    }
  });

  document.getElementById('copy-button').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'getTimestamps'}, (response) => {
        if (response && response.timestamps) {
          const formattedTimestamps = formatTimestampsForCopy(response.timestamps);
          navigator.clipboard.writeText(formattedTimestamps).then(() => {
          }, () => {
            alert('Failed to copy timestamps');
          });
        } else {
          alert('No timestamps to copy');
        }
      });
    });
  });

  document.getElementById('add-button').addEventListener('click', showAddTimestampPopup);
  chrome.runtime.sendMessage({action: 'popupOpened'}, (response) => {
    if (response && response.openedByShortcut) {
      showAddTimestampPopup();
    }
  });
}

document.addEventListener('DOMContentLoaded', initPopup);