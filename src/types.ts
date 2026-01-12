export interface Timestamp {
    id: string;
    text: string;
    time: number;
    endTime?: number;
    videoId: string;
    videoTitle: string;
    platform: 'youtube' | 'twitch';
    createdAt: number;
}

export interface VideoInfo {
    videoId: string;
    videoTitle: string;
    platform: 'youtube' | 'twitch';
    currentTime: number;
}

export interface YtdlpSettings {
    youtubeCommand: string;
    twitchCommand: string;
    multilineTimestamps: boolean;
    youtubeTimestampIncludeEnd: boolean;
    normalTimestampIncludeEnd: boolean;
}

export type MessageType =
    | { type: 'GET_VIDEO_INFO' }
    | { type: 'GET_CURRENT_TIME' }
    | { type: 'CREATE_TIMESTAMP' }
    | { type: 'ADD_END_TIME' }
    | { type: 'SEEK_TO_TIME'; payload: { time: number } }
    | { type: 'SHOW_MODAL'; payload: { time: number; videoInfo: VideoInfo } }
    | { type: 'SHOW_END_TIME_MODAL'; payload: { timestampId: string } }
    | { type: 'TIMESTAMP_CREATED'; payload: Timestamp }
    | { type: 'TIMESTAMP_UPDATED'; payload: Timestamp };

