import { useState, useRef, useEffect } from 'react';
import { Timestamp, YtdlpSettings } from '../../types';
import { formatTime, formatTimeForYtdlp, parseTime } from '../../utils/storage';

interface TimestampItemProps {
    timestamp: Timestamp;
    onDelete: (id: string) => void;
    showVideo: boolean;
    index: number;
    pageUrl: string;
    ytdlpSettings: YtdlpSettings;
    multilineText?: boolean;
}

export default function TimestampItem({ timestamp, onDelete, showVideo, index, pageUrl, ytdlpSettings, multilineText = false }: TimestampItemProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [showEndTimePrompt, setShowEndTimePrompt] = useState(false);
    const [endTimeInput, setEndTimeInput] = useState('');
    const [ytdlpCopied, setYtdlpCopied] = useState(false);
    const [menuAbove, setMenuAbove] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (showMenu && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            setMenuAbove(spaceBelow < 180);
        }
    }, [showMenu]);

    const timeDisplay = timestamp.endTime
        ? `${formatTime(timestamp.time)} - ${formatTime(timestamp.endTime)}`
        : formatTime(timestamp.time);

    async function handleClick() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id) {
            chrome.tabs.sendMessage(tab.id, {
                type: 'SEEK_TO_TIME',
                payload: { time: timestamp.time }
            });
        }
    }

    function buildYtdlpCommand(endTime: number): string {
        const baseCommand = timestamp.platform === 'youtube'
            ? ytdlpSettings.youtubeCommand
            : ytdlpSettings.twitchCommand;

        const startTimeStr = formatTimeForYtdlp(timestamp.time);
        const endTimeStr = formatTimeForYtdlp(endTime);

        return `${baseCommand} --download-sections "*${startTimeStr}-${endTimeStr}" "${pageUrl}"`;
    }

    async function handleCopyYtdlp() {
        if (timestamp.endTime) {
            const command = buildYtdlpCommand(timestamp.endTime);
            await navigator.clipboard.writeText(command);
            setYtdlpCopied(true);
            setTimeout(() => {
                setYtdlpCopied(false);
                setShowMenu(false);
            }, 1000);
        } else {
            setShowEndTimePrompt(true);
        }
    }

    async function handleEndTimeSubmit() {
        const parsed = parseTime(endTimeInput);
        if (parsed !== null) {
            const command = buildYtdlpCommand(parsed);
            await navigator.clipboard.writeText(command);
            setShowEndTimePrompt(false);
            setEndTimeInput('');
            setYtdlpCopied(true);
            setTimeout(() => {
                setYtdlpCopied(false);
                setShowMenu(false);
            }, 1000);
        }
    }

    return (
        <div
            ref={containerRef}
            className={`group relative rounded py-1.5 px-2 border transition-all animate-fade-in cursor-pointer ${
                timestamp.endTime
                    ? 'bg-vod-accent/10 border-vod-accent/20 hover:border-vod-accent/40'
                    : 'bg-vod-surface border-vod-border hover:border-vod-accent/30'
            }`}
            style={{ animationDelay: `${index * 20}ms` }}
            onClick={handleClick}
            onContextMenu={(e) => {
                e.preventDefault();
                setShowMenu(true);
            }}
        >
            <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0 flex items-center gap-2">
                    <span className="text-vod-accent font-mono text-xs font-medium shrink-0">
                        {timeDisplay}
                    </span>
                    {showVideo && (
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            timestamp.platform === 'youtube' ? 'bg-red-500' : 'bg-purple-500'
                        }`} />
                    )}
                    <p className={`text-vod-text text-xs leading-tight ${multilineText ? '' : 'truncate'} ${timestamp.endTime ? 'font-bold' : ''}`}>
                        {timestamp.text}
                    </p>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-vod-border rounded transition-all shrink-0"
                >
                    <svg className="w-3.5 h-3.5 text-vod-text-muted" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="6" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="12" cy="18" r="2" />
                    </svg>
                </button>
            </div>
            {showVideo && (
                <p className="text-vod-text-muted text-[9px] truncate mt-0.5 pl-0.5">
                    {timestamp.videoTitle}
                </p>
            )}

            {showMenu && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => {
                            setShowMenu(false);
                            setShowEndTimePrompt(false);
                            setEndTimeInput('');
                        }}
                    />
                    <div className={`absolute right-2 z-20 bg-vod-surface border border-vod-border rounded-lg shadow-xl py-1 min-w-[140px] animate-fade-in ${menuAbove ? 'bottom-10' : 'top-10'}`}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(`${timeDisplay} ${timestamp.text}`);
                                setShowMenu(false);
                            }}
                            className="w-full px-3 py-1.5 text-left text-xs text-vod-text hover:bg-vod-border transition-colors"
                        >
                            Copy
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCopyYtdlp();
                            }}
                            className="w-full px-3 py-1.5 text-left text-xs text-vod-text hover:bg-vod-border transition-colors flex items-center gap-2"
                        >
                            {ytdlpCopied ? (
                                <>
                                    <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Copied!
                                </>
                            ) : (
                                'Copy yt-dlp'
                            )}
                        </button>
                        {showEndTimePrompt && (
                            <div className="px-3 py-2 border-t border-vod-border" onClick={(e) => e.stopPropagation()}>
                                <p className="text-[10px] text-vod-text-muted mb-1">End time required:</p>
                                <div className="flex gap-1">
                                    <input
                                        type="text"
                                        value={endTimeInput}
                                        onChange={(e) => setEndTimeInput(e.target.value)}
                                        placeholder="0:00"
                                        className="flex-1 bg-vod-bg border border-vod-border rounded px-2 py-1 text-xs text-vod-text placeholder-vod-text-muted focus:outline-none focus:border-vod-accent font-mono w-16"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleEndTimeSubmit();
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={handleEndTimeSubmit}
                                        className="bg-vod-accent hover:bg-vod-accent-hover text-white text-xs px-2 py-1 rounded transition-colors"
                                    >
                                        OK
                                    </button>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={async (e) => {
                                e.stopPropagation();
                                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                                if (tab.id) {
                                    chrome.tabs.sendMessage(tab.id, {
                                        type: 'EDIT_TIMESTAMP',
                                        payload: timestamp
                                    });
                                }
                                setShowMenu(false);
                            }}
                            className="w-full px-3 py-1.5 text-left text-xs text-vod-text hover:bg-vod-border transition-colors"
                        >
                            Edit
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(timestamp.id);
                                setShowMenu(false);
                            }}
                            className="w-full px-3 py-1.5 text-left text-xs text-red-400 hover:bg-vod-border transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

