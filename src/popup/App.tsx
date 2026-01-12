import { useState, useEffect } from 'react';
import { Timestamp, VideoInfo, YtdlpSettings } from '../types';
import { getTimestampsForVideo, deleteTimestamp, deleteTimestampsForVideo, formatTime, saveTimestamp, generateId, parseTime, getSettings } from '../utils/storage';
import TimestampItem from './components/TimestampItem';
import Header from './components/Header';
import Settings from './components/Settings';

export default function App() {
    const [timestamps, setTimestamps] = useState<Timestamp[]>([]);
    const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
    const [copied, setCopied] = useState(false);
    const [copiedYT, setCopiedYT] = useState(false);
    const [pageUrl, setPageUrl] = useState<string>('');
    const [showSettings, setShowSettings] = useState(false);
    const [ytdlpSettings, setYtdlpSettings] = useState<YtdlpSettings>({
        youtubeCommand: 'yt-dlp',
        twitchCommand: 'yt-dlp',
        multilineTimestamps: false,
        youtubeTimestampIncludeEnd: true,
        normalTimestampIncludeEnd: true,
    });

    useEffect(() => {
        loadVideoInfo();
        loadTimestamps();
        loadYtdlpSettings();

        chrome.storage.onChanged.addListener(() => {
            loadTimestamps();
            loadYtdlpSettings();
        });
    }, []);

    async function loadYtdlpSettings() {
        const settings = await getSettings();
        setYtdlpSettings(settings);
    }

    async function loadVideoInfo() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab.id && tab.url) {
                setPageUrl(tab.url);
                const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_VIDEO_INFO' });
                if (response) {
                    setVideoInfo(response);
                }
            }
        } catch {
            setVideoInfo(null);
        }
    }

    async function loadTimestamps() {
        if (videoInfo) {
            const ts = await getTimestampsForVideo(videoInfo.videoId);
            setTimestamps(ts.sort((a, b) => a.time - b.time));
        }
    }

    useEffect(() => {
        if (videoInfo) {
            loadTimestamps();
        }
    }, [videoInfo]);

    async function handleDelete(id: string) {
        await deleteTimestamp(id);
        loadTimestamps();
    }

    function formatTimestampForClipboard(ts: Timestamp): string {
        const timeStr = formatTime(ts.time);
        const endTimeStr = (ts.endTime && ytdlpSettings.normalTimestampIncludeEnd) ? ` - ${formatTime(ts.endTime)}` : '';
        const textPrefix = ts.endTime === undefined ? '.' : '';
        return `~${timeStr}${endTimeStr} ${textPrefix}${ts.text}`;
    }

    async function handleCopyAll() {
        if (!videoInfo) return;
        const header = `${videoInfo.videoTitle}\n${pageUrl}\n`;
        const content = timestamps.map(formatTimestampForClipboard).join('\n');
        const footer = '\n[~VodTS~]';
        await navigator.clipboard.writeText(header + content + footer);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function formatTimestampYouTube(ts: Timestamp): string {
        if (ts.endTime !== undefined) {
            if (ytdlpSettings.youtubeTimestampIncludeEnd) {
                return `[${formatTime(ts.time)} - ${formatTime(ts.endTime)}] *${ts.text}*`;
            } else {
                return `[${formatTime(ts.time)}] *${ts.text}*`;
            }
        } else {
            return `   > ${formatTime(ts.time)} ${ts.text}`;
        }
    }

    async function handleCopyYouTubeFormat() {
        if (!videoInfo) return;
        const content = timestamps.map(formatTimestampYouTube).join('\n');
        await navigator.clipboard.writeText(content);
        setCopiedYT(true);
        setTimeout(() => setCopiedYT(false), 2000);
    }

    async function handlePaste() {
        if (!videoInfo) return;
        try {
            const clipboardText = await navigator.clipboard.readText();
            const lines = clipboardText.split('\n');

            await deleteTimestampsForVideo(videoInfo.videoId);

            type ParsedTimestamp = Timestamp & { isChapter: boolean };
            const parsedTimestamps: ParsedTimestamp[] = [];
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) continue;
                if (trimmedLine === '[~VodTS~]') continue;
                
                const youtubeRangeMatch = trimmedLine.match(/^\[(\d+:\d+(?::\d+)?)\s*-\s*(\d+:\d+(?::\d+)?)\]\s*\*?(.+?)\*?$/);
                if (youtubeRangeMatch) {
                    const startTime = parseTime(youtubeRangeMatch[1]);
                    const endTime = parseTime(youtubeRangeMatch[2]);
                    const text = youtubeRangeMatch[3].trim();
                    
                    if (startTime !== null && endTime !== null && text) {
                        parsedTimestamps.push({
                            id: generateId(),
                            text,
                            time: startTime,
                            endTime: endTime,
                            videoId: videoInfo.videoId,
                            videoTitle: videoInfo.videoTitle,
                            platform: videoInfo.platform,
                            createdAt: Date.now(),
                            isChapter: true,
                        });
                    }
                    continue;
                }

                const youtubeSingleMatch = trimmedLine.match(/^\[(\d+:\d+(?::\d+)?)\]\s*\*?(.+?)\*?$/);
                if (youtubeSingleMatch) {
                    const startTime = parseTime(youtubeSingleMatch[1]);
                    const text = youtubeSingleMatch[2].trim();
                    
                    if (startTime !== null && text) {
                        parsedTimestamps.push({
                            id: generateId(),
                            text,
                            time: startTime,
                            endTime: undefined,
                            videoId: videoInfo.videoId,
                            videoTitle: videoInfo.videoTitle,
                            platform: videoInfo.platform,
                            createdAt: Date.now(),
                            isChapter: true,
                        });
                    }
                    continue;
                }
                
                const youtubeChildMatch = line.match(/^\s*>\s*(\d+:\d+(?::\d+)?)\s+(.+)$/);
                if (youtubeChildMatch) {
                    const startTime = parseTime(youtubeChildMatch[1]);
                    const text = youtubeChildMatch[2].trim();
                    
                    if (startTime !== null && text) {
                        parsedTimestamps.push({
                            id: generateId(),
                            text,
                            time: startTime,
                            endTime: undefined,
                            videoId: videoInfo.videoId,
                            videoTitle: videoInfo.videoTitle,
                            platform: videoInfo.platform,
                            createdAt: Date.now(),
                            isChapter: false,
                        });
                    }
                    continue;
                }
                
                const match = trimmedLine.match(/^~?(\d+:\d+(?::\d+)?)\s*(?:-\s*(\d+:\d+(?::\d+)?))?\s+(.+)$/);
                if (match) {
                    const startTime = parseTime(match[1]);
                    const endTime = match[2] ? parseTime(match[2]) : undefined;
                    let text = match[3].trim();
                    if (endTime === undefined && text.startsWith('.')) {
                        text = text.slice(1);
                    }
                    
                    if (startTime !== null && text) {
                        parsedTimestamps.push({
                            id: generateId(),
                            text,
                            time: startTime,
                            endTime: endTime ?? undefined,
                            videoId: videoInfo.videoId,
                            videoTitle: videoInfo.videoTitle,
                            platform: videoInfo.platform,
                            createdAt: Date.now(),
                            isChapter: endTime !== undefined,
                        });
                    }
                }
            }

            for (let i = 0; i < parsedTimestamps.length; i++) {
                const current = parsedTimestamps[i];
                if (current.isChapter && current.endTime === undefined) {
                    for (let j = i + 1; j < parsedTimestamps.length; j++) {
                        if (parsedTimestamps[j].isChapter) {
                            current.endTime = parsedTimestamps[j].time;
                            break;
                        }
                    }
                }
            }

            for (const ts of parsedTimestamps) {
                const { isChapter, ...timestamp } = ts;
                await saveTimestamp(timestamp);
            }

            loadTimestamps();
        } catch (err) {
            console.error('Paste failed:', err);
        }
    }

    async function handleClearAll() {
        if (!videoInfo) return;
        await deleteTimestampsForVideo(videoInfo.videoId);
        loadTimestamps();
    }

    const displayTimestamps = timestamps;

    if (showSettings) {
        return <Settings onClose={() => setShowSettings(false)} />;
    }

    return (
        <div className="flex flex-col h-full min-h-[400px] bg-vod-bg">
            <Header
                videoInfo={videoInfo}
                timestampCount={displayTimestamps.length}
                pageUrl={pageUrl}
                onCopyAll={handleCopyAll}
                onCopyYouTube={handleCopyYouTubeFormat}
                onPaste={handlePaste}
                onClearAll={handleClearAll}
                onOpenSettings={() => setShowSettings(true)}
                copied={copied}
                copiedYT={copiedYT}
            />

            <div className="flex-1 overflow-y-auto p-3">
                {displayTimestamps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-vod-text-muted py-12">
                        <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm">No timestamps yet</p>
                        <p className="text-xs mt-1 opacity-60">Press Alt+T to create one</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {displayTimestamps.map((ts, index) => (
                            <TimestampItem
                                key={ts.id}
                                timestamp={ts}
                                onDelete={handleDelete}
                                showVideo={false}
                                index={index}
                                pageUrl={pageUrl}
                                ytdlpSettings={ytdlpSettings}
                                multilineText={ytdlpSettings.multilineTimestamps}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

