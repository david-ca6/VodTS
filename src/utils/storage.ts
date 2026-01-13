import { Timestamp, YtdlpSettings } from '../types';

const STORAGE_KEY = 'vodts_timestamps';
const SETTINGS_KEY = 'vodts_settings';

export const CHAPTER_END_TIME = 359999;

export function isChapter(timestamp: Timestamp): boolean {
    return timestamp.endTime === CHAPTER_END_TIME;
}

const DEFAULT_SETTINGS: YtdlpSettings = {
    youtubeCommand: 'yt-dlp',
    twitchCommand: 'yt-dlp',
    multilineTimestamps: false,
    youtubeTimestampIncludeEnd: true,
    normalTimestampIncludeEnd: true,
};

export async function getTimestamps(): Promise<Timestamp[]> {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] || [];
}

export async function getTimestampsForVideo(videoId: string): Promise<Timestamp[]> {
    const timestamps = await getTimestamps();
    return timestamps.filter(t => t.videoId === videoId);
}

export async function saveTimestamp(timestamp: Timestamp): Promise<void> {
    const timestamps = await getTimestamps();
    timestamps.push(timestamp);
    await chrome.storage.local.set({ [STORAGE_KEY]: timestamps });
}

export async function updateTimestamp(updatedTimestamp: Timestamp): Promise<void> {
    const timestamps = await getTimestamps();
    const index = timestamps.findIndex(t => t.id === updatedTimestamp.id);
    if (index !== -1) {
        timestamps[index] = updatedTimestamp;
        await chrome.storage.local.set({ [STORAGE_KEY]: timestamps });
    }
}

export async function deleteTimestamp(id: string): Promise<void> {
    const timestamps = await getTimestamps();
    const filtered = timestamps.filter(t => t.id !== id);
    await chrome.storage.local.set({ [STORAGE_KEY]: filtered });
}

export async function deleteTimestampsForVideo(videoId: string): Promise<void> {
    const timestamps = await getTimestamps();
    const filtered = timestamps.filter(t => t.videoId !== videoId);
    await chrome.storage.local.set({ [STORAGE_KEY]: filtered });
}

export async function getLastTimestamp(videoId: string): Promise<Timestamp | null> {
    const timestamps = await getTimestampsForVideo(videoId);
    if (timestamps.length === 0) return null;
    return timestamps.sort((a, b) => b.createdAt - a.createdAt)[0];
}

export function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function parseTime(timeStr: string): number | null {
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

export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function getSettings(): Promise<YtdlpSettings> {
    const result = await chrome.storage.local.get(SETTINGS_KEY);
    return result[SETTINGS_KEY] || DEFAULT_SETTINGS;
}

export async function saveSettings(settings: YtdlpSettings): Promise<void> {
    await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
}

export function formatTimeForYtdlp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

