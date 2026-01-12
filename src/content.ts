import { Timestamp, VideoInfo } from './types';

interface ModalState {
    isOpen: boolean;
    mode: 'create' | 'edit' | 'endTime';
    timestamp?: Timestamp;
    currentTime?: number;
    videoInfo?: VideoInfo;
}

let modalState: ModalState = { isOpen: false, mode: 'create' };
let modalElement: HTMLDivElement | null = null;

function getTwitchLiveTime(): number | null {
    const liveTimeElement = document.querySelector('.live-time span[aria-hidden="true"]');
    if (liveTimeElement?.textContent) {
        return parseTime(liveTimeElement.textContent);
    }
    return null;
}

function isTwitchVod(): boolean {
    const pathParts = window.location.pathname.split('/');
    return pathParts[1] === 'video' || pathParts[1] === 'videos';
}

function getVideoInfo(): VideoInfo | null {
    const url = window.location.href;

    if (url.includes('youtube.com')) {
        const video = document.querySelector('video') as HTMLVideoElement | null;
        const videoId = new URLSearchParams(window.location.search).get('v');
        const titleElement = document.querySelector('h1.ytd-video-primary-info-renderer, h1.ytd-watch-metadata yt-formatted-string');
        const title = titleElement?.textContent || document.title.replace(' - YouTube', '');

        if (video && videoId) {
            return {
                videoId,
                videoTitle: title,
                platform: 'youtube',
                currentTime: video.currentTime,
            };
        }
    }

    if (url.includes('twitch.tv')) {
        const video = document.querySelector('video') as HTMLVideoElement | null;
        const pathParts = window.location.pathname.split('/');
        const channel = pathParts[1];
        const isVod = isTwitchVod();
        const vodId = isVod ? pathParts[2] : null;
        const titleElement = document.querySelector('[data-a-target="stream-title"], h2[data-a-target="stream-title"]');
        const title = titleElement?.textContent || document.title.replace(' - Twitch', '');

        if (video) {
            const currentTime = isVod ? video.currentTime : (getTwitchLiveTime() ?? video.currentTime);
            return {
                videoId: vodId || channel,
                videoTitle: title,
                platform: 'twitch',
                currentTime,
            };
        }
    }

    return null;
}

function getCurrentTime(): number | null {
    const url = window.location.href;

    if (url.includes('twitch.tv') && !isTwitchVod()) {
        const liveTime = getTwitchLiveTime();
        if (liveTime !== null) {
            return liveTime;
        }
    }

    const video = document.querySelector('video') as HTMLVideoElement | null;
    return video ? video.currentTime : null;
}

function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function parseTime(timeStr: string): number | null {
    const parts = timeStr.split(':').map(p => parseInt(p, 10));
    if (parts.some(isNaN)) return null;

    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
        return parts[0];
    }
    return null;
}

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function createModal() {
    if (modalElement) {
        modalElement.remove();
    }

    modalElement = document.createElement('div');
    modalElement.id = 'vodts-modal-container';
    document.body.appendChild(modalElement);
    renderModal();
}

function renderModal() {
    if (!modalElement) return;

    const { mode, timestamp, currentTime, videoInfo } = modalState;

    const isEdit = mode === 'edit';
    const isEndTime = mode === 'endTime';

    const timeValue = isEdit && timestamp
        ? formatTime(timestamp.time)
        : currentTime !== undefined
            ? formatTime(currentTime)
            : '';

    const endTimeValue = isEdit && timestamp?.endTime
        ? formatTime(timestamp.endTime)
        : isEndTime && currentTime !== undefined
            ? formatTime(currentTime)
            : '';

    const textValue = isEdit && timestamp ? timestamp.text : '';

    const title = isEdit ? 'Edit Timestamp' : isEndTime ? 'Add End Time' : 'New Timestamp';
    const submitText = isEdit ? 'Save' : isEndTime ? 'Add End Time' : 'Create';

    modalElement.innerHTML = `
        <style>
            #vodts-modal-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(4px);
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'JetBrains Mono', 'Fira Code', monospace;
                animation: vodts-fade-in 0.15s ease-out;
            }

            @keyframes vodts-fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes vodts-slide-in {
                from { transform: translateY(-20px) scale(0.95); opacity: 0; }
                to { transform: translateY(0) scale(1); opacity: 1; }
            }

            #vodts-modal {
                background: #1a1a1a;
                border: 1px solid #2a2a2a;
                border-radius: 12px;
                width: 360px;
                padding: 20px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                animation: vodts-slide-in 0.2s ease-out;
            }

            #vodts-modal h2 {
                margin: 0 0 16px 0;
                font-size: 16px;
                font-weight: 600;
                color: #f0f0f0;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            #vodts-modal h2::before {
                content: '';
                width: 3px;
                height: 16px;
                background: linear-gradient(135deg, #ff4d4d, #ff8c4d);
                border-radius: 2px;
            }

            .vodts-input-group {
                margin-bottom: 14px;
            }

            .vodts-input-group label {
                display: block;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #888;
                margin-bottom: 6px;
            }

            .vodts-input-group input {
                width: 100%;
                padding: 10px 12px;
                background: #0f0f0f;
                border: 1px solid #2a2a2a;
                border-radius: 8px;
                color: #f0f0f0;
                font-size: 14px;
                font-family: inherit;
                transition: border-color 0.2s, box-shadow 0.2s;
                box-sizing: border-box;
            }

            .vodts-input-group input:focus {
                outline: none;
                border-color: #ff4d4d;
                box-shadow: 0 0 0 3px rgba(255, 77, 77, 0.15);
            }

            .vodts-input-group input::placeholder {
                color: #555;
            }

            .vodts-time-row {
                display: flex;
                gap: 10px;
            }

            .vodts-time-row .vodts-input-group {
                flex: 1;
            }

            .vodts-buttons {
                display: flex;
                gap: 10px;
                margin-top: 18px;
            }

            .vodts-btn {
                flex: 1;
                padding: 10px 16px;
                border: none;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 500;
                font-family: inherit;
                cursor: pointer;
                transition: all 0.2s;
            }

            .vodts-btn-primary {
                background: linear-gradient(135deg, #ff4d4d, #ff6b6b);
                color: white;
            }

            .vodts-btn-primary:hover {
                background: linear-gradient(135deg, #ff6b6b, #ff8585);
                transform: translateY(-1px);
            }

            .vodts-btn-secondary {
                background: #2a2a2a;
                color: #888;
            }

            .vodts-btn-secondary:hover {
                background: #3a3a3a;
                color: #f0f0f0;
            }

            .vodts-hint {
                font-size: 10px;
                color: #555;
                margin-top: 12px;
                text-align: center;
            }
        </style>
        <div id="vodts-modal-overlay">
            <div id="vodts-modal">
                <h2>${title}</h2>

                ${!isEndTime ? `
                    <div class="vodts-input-group">
                        <label>Description</label>
                        <input type="text" id="vodts-text-input" placeholder="What's happening here?" value="${textValue}" autofocus>
                    </div>
                ` : ''}

                <div class="vodts-time-row">
                    ${!isEndTime ? `
                        <div class="vodts-input-group">
                            <label>Start Time</label>
                            <input type="text" id="vodts-time-input" placeholder="0:00" value="${timeValue}">
                        </div>
                    ` : ''}
                    <div class="vodts-input-group">
                        <label>End Time ${!isEndTime ? '(optional)' : ''}</label>
                        <input type="text" id="vodts-endtime-input" placeholder="0:00" value="${endTimeValue}" ${isEndTime ? 'autofocus' : ''}>
                    </div>
                </div>

                <div class="vodts-buttons">
                    <button class="vodts-btn vodts-btn-secondary" id="vodts-cancel-btn">Cancel</button>
                    <button class="vodts-btn vodts-btn-primary" id="vodts-submit-btn">${submitText}</button>
                </div>

                <p class="vodts-hint">Press Escape to cancel • Enter to submit</p>
            </div>
        </div>
    `;

    const overlay = modalElement.querySelector('#vodts-modal-overlay');
    const cancelBtn = modalElement.querySelector('#vodts-cancel-btn');
    const submitBtn = modalElement.querySelector('#vodts-submit-btn');
    const textInput = modalElement.querySelector('#vodts-text-input') as HTMLInputElement | null;
    const timeInput = modalElement.querySelector('#vodts-time-input') as HTMLInputElement | null;
    const endTimeInput = modalElement.querySelector('#vodts-endtime-input') as HTMLInputElement | null;

    overlay?.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    cancelBtn?.addEventListener('click', closeModal);
    submitBtn?.addEventListener('click', handleSubmit);

    document.addEventListener('keydown', handleKeydown);

    setTimeout(() => {
        if (isEndTime && endTimeInput) {
            endTimeInput.focus();
            endTimeInput.select();
        } else if (textInput) {
            textInput.focus();
        }
    }, 50);
}

function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
        closeModal();
    } else if (e.key === 'Enter') {
        handleSubmit();
    }
}

function handleSubmit() {
    const textInput = modalElement?.querySelector('#vodts-text-input') as HTMLInputElement | null;
    const timeInput = modalElement?.querySelector('#vodts-time-input') as HTMLInputElement | null;
    const endTimeInput = modalElement?.querySelector('#vodts-endtime-input') as HTMLInputElement | null;

    const { mode, timestamp, videoInfo } = modalState;

    if (mode === 'endTime' && timestamp) {
        const endTimeStr = endTimeInput?.value.trim() || '';
        const endTime = parseTime(endTimeStr);

        if (endTime !== null) {
            const updatedTimestamp: Timestamp = {
                ...timestamp,
                endTime,
            };

            chrome.runtime.sendMessage({
                type: 'UPDATE_TIMESTAMP',
                payload: updatedTimestamp,
            });
        }

        closeModal();
        return;
    }

    const text = textInput?.value.trim() || '';
    const timeStr = timeInput?.value.trim() || '';
    const endTimeStr = endTimeInput?.value.trim() || '';

    if (!text || !timeStr) {
        if (textInput && !text) {
            textInput.style.borderColor = '#ff4d4d';
        }
        if (timeInput && !timeStr) {
            timeInput.style.borderColor = '#ff4d4d';
        }
        return;
    }

    const time = parseTime(timeStr);
    const endTime = endTimeStr ? parseTime(endTimeStr) : undefined;

    if (time === null) {
        if (timeInput) timeInput.style.borderColor = '#ff4d4d';
        return;
    }

    if (mode === 'edit' && timestamp) {
        const updatedTimestamp: Timestamp = {
            ...timestamp,
            text,
            time,
            endTime: endTime ?? timestamp.endTime,
        };

        chrome.runtime.sendMessage({
            type: 'UPDATE_TIMESTAMP',
            payload: updatedTimestamp,
        });
    } else if (videoInfo) {
        const newTimestamp: Timestamp = {
            id: generateId(),
            text,
            time,
            endTime: endTime ?? undefined,
            videoId: videoInfo.videoId,
            videoTitle: videoInfo.videoTitle,
            platform: videoInfo.platform,
            createdAt: Date.now(),
        };

        chrome.runtime.sendMessage({
            type: 'SAVE_TIMESTAMP',
            payload: newTimestamp,
        });
    }

    closeModal();
}

function closeModal() {
    document.removeEventListener('keydown', handleKeydown);
    if (modalElement) {
        modalElement.remove();
        modalElement = null;
    }
    modalState = { isOpen: false, mode: 'create' };
}

function showCreateModal() {
    const videoInfo = getVideoInfo();
    if (!videoInfo) return;

    modalState = {
        isOpen: true,
        mode: 'create',
        currentTime: videoInfo.currentTime,
        videoInfo,
    };

    createModal();
}

async function showEndTimeModal() {
    const videoInfo = getVideoInfo();
    if (!videoInfo) return;

    const result = await chrome.storage.local.get('vodts_timestamps');
    const timestamps: Timestamp[] = result.vodts_timestamps || [];

    const videoTimestamps = timestamps
        .filter(t => t.videoId === videoInfo.videoId)
        .sort((a, b) => b.createdAt - a.createdAt);

    if (videoTimestamps.length === 0) {
        showNotification('No timestamps to add end time to');
        return;
    }

    const lastTimestamp = videoTimestamps[0];

    modalState = {
        isOpen: true,
        mode: 'endTime',
        timestamp: lastTimestamp,
        currentTime: videoInfo.currentTime,
        videoInfo,
    };

    createModal();
}

function showEditModal(timestamp: Timestamp) {
    const videoInfo = getVideoInfo();

    modalState = {
        isOpen: true,
        mode: 'edit',
        timestamp,
        videoInfo: videoInfo || undefined,
    };

    createModal();
}

function showNotification(message: string) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #1a1a1a;
        border: 1px solid #2a2a2a;
        color: #f0f0f0;
        padding: 12px 20px;
        border-radius: 8px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 13px;
        z-index: 999999;
        animation: vodts-slide-up 0.3s ease-out;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes vodts-slide-up {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;

    document.head.appendChild(style);
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'vodts-slide-up 0.3s ease-out reverse';
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 300);
    }, 2000);
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'GET_VIDEO_INFO') {
        const info = getVideoInfo();
        sendResponse(info);
        return true;
    }

    if (message.type === 'GET_CURRENT_TIME') {
        const time = getCurrentTime();
        sendResponse(time);
        return true;
    }

    if (message.type === 'CREATE_TIMESTAMP') {
        showCreateModal();
        sendResponse({ success: true });
        return true;
    }

    if (message.type === 'ADD_END_TIME') {
        showEndTimeModal();
        sendResponse({ success: true });
        return true;
    }

    if (message.type === 'EDIT_TIMESTAMP') {
        showEditModal(message.payload);
        sendResponse({ success: true });
        return true;
    }

    if (message.type === 'SEEK_TO_TIME') {
        const video = document.querySelector('video') as HTMLVideoElement | null;
        if (video) {
            video.currentTime = message.payload.time;
            sendResponse({ success: true });
        } else {
            sendResponse({ success: false });
        }
        return true;
    }

    return false;
});

console.log('VodTS content script loaded');

