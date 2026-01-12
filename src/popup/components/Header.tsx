import { useState } from 'react';
import { VideoInfo } from '../../types';

interface HeaderProps {
    videoInfo: VideoInfo | null;
    timestampCount: number;
    pageUrl: string;
    onCopyAll: () => void;
    onCopyYouTube: () => void;
    onPaste: () => void;
    onClearAll: () => void;
    onOpenSettings: () => void;
    copied: boolean;
    copiedYT: boolean;
}

export default function Header({ videoInfo, timestampCount, pageUrl, onCopyAll, onCopyYouTube, onPaste, onClearAll, onOpenSettings, copied, copiedYT }: HeaderProps) {
    const [showPasteSuccess, setShowPasteSuccess] = useState(false);
    const [showClearSuccess, setShowClearSuccess] = useState(false);

    function handlePaste() {
        onPaste();
        setShowPasteSuccess(true);
        setTimeout(() => setShowPasteSuccess(false), 2000);
    }

    function handleClearAll() {
        onClearAll();
        setShowClearSuccess(true);
        setTimeout(() => setShowClearSuccess(false), 2000);
    }

    function handleOpenClipIT() {
        if (!pageUrl) return;
        const clipitUrl = `https://clipit.ca6.dev/stream?url=${pageUrl}`;
        chrome.tabs.create({ url: clipitUrl });
    }

    return (
        <div className="border-b border-vod-border">
            <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-vod-accent to-cyan-400 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold text-vod-text">CA6 VodTS</h1>
                        <p className="text-[10px] text-vod-text-muted">{timestampCount} timestamp{timestampCount !== 1 ? 's' : ''}</p>
                    </div>
                </div>

                <div className="flex gap-1">
                    {pageUrl && (
                        <button
                            onClick={handleOpenClipIT}
                            className="p-1.5 rounded-md transition-all bg-vod-surface text-vod-text-muted hover:text-vod-accent hover:bg-vod-border"
                            title="Open in ClipIT"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                            </svg>
                        </button>
                    )}
                    <button
                        onClick={onOpenSettings}
                        className="p-1.5 rounded-md transition-all bg-vod-surface text-vod-text-muted hover:text-vod-text hover:bg-vod-border"
                        title="Settings"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                    <button
                        onClick={handlePaste}
                        className={`p-1.5 rounded-md transition-all ${
                            showPasteSuccess
                                ? 'bg-green-600 text-white'
                                : 'bg-vod-surface text-vod-text-muted hover:text-vod-text hover:bg-vod-border'
                        }`}
                        title="Paste timestamps"
                    >
                        {showPasteSuccess ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        )}
                    </button>
                    {timestampCount > 0 && (
                        <>
                            <button
                                onClick={onCopyAll}
                                className={`p-1.5 rounded-md transition-all ${
                                    copied
                                        ? 'bg-green-600 text-white'
                                        : 'bg-vod-surface text-vod-text-muted hover:text-vod-text hover:bg-vod-border'
                                }`}
                                title="Copy all timestamps"
                            >
                                {copied ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </button>
                            <button
                                onClick={onCopyYouTube}
                                className={`p-1.5 rounded-md transition-all ${
                                    copiedYT
                                        ? 'bg-green-600 text-white'
                                        : 'bg-vod-surface text-vod-text-muted hover:text-vod-text hover:bg-vod-border'
                                }`}
                                title="Copy in YouTube format"
                            >
                                {copiedYT ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                                    </svg>
                                )}
                            </button>
                            <button
                                onClick={handleClearAll}
                                className={`p-1.5 rounded-md transition-all ${
                                    showClearSuccess
                                        ? 'bg-green-600 text-white'
                                        : 'bg-vod-surface text-vod-text-muted hover:text-vod-accent hover:bg-vod-border'
                                }`}
                                title="Clear all timestamps"
                            >
                                {showClearSuccess ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {videoInfo && (
                <div className="px-3 pb-2">
                    <div className="flex items-center gap-2 text-xs text-vod-text-muted">
                        <span className={`w-2 h-2 rounded-full ${
                            videoInfo.platform === 'youtube' ? 'bg-red-500' : 'bg-purple-500'
                        }`} />
                        <span className="truncate">{videoInfo.videoTitle}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

