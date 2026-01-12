import { useState, useEffect } from 'react';
import { YtdlpSettings } from '../../types';
import { getSettings, saveSettings } from '../../utils/storage';

interface SettingsProps {
    onClose: () => void;
}

export default function Settings({ onClose }: SettingsProps) {
    const [settings, setSettings] = useState<YtdlpSettings>({
        youtubeCommand: 'yt-dlp',
        twitchCommand: 'yt-dlp',
        multilineTimestamps: false,
        youtubeTimestampIncludeEnd: true,
        normalTimestampIncludeEnd: true,
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        const s = await getSettings();
        setSettings(s);
    }

    async function handleSave() {
        await saveSettings(settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    return (
        <div className="flex flex-col h-full bg-vod-bg">
            <div className="border-b border-vod-border p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-vod-surface rounded transition-colors"
                        >
                            <svg className="w-4 h-4 text-vod-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="text-sm font-semibold text-vod-text">Settings</h1>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xs font-semibold text-vod-text-muted uppercase tracking-wide mb-3">
                            yt-dlp Commands
                        </h2>
                        <p className="text-xs text-vod-text-muted mb-4">
                            Set your base yt-dlp command. The URL and time parameters will be appended automatically.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center gap-2 text-xs text-vod-text mb-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500" />
                                    YouTube Command
                                </label>
                                <input
                                    type="text"
                                    value={settings.youtubeCommand}
                                    onChange={(e) => setSettings({ ...settings, youtubeCommand: e.target.value })}
                                    placeholder="yt-dlp"
                                    className="w-full bg-vod-surface border border-vod-border rounded-lg px-3 py-2 text-sm text-vod-text placeholder-vod-text-muted focus:outline-none focus:border-vod-accent font-mono"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-xs text-vod-text mb-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                                    Twitch Command
                                </label>
                                <input
                                    type="text"
                                    value={settings.twitchCommand}
                                    onChange={(e) => setSettings({ ...settings, twitchCommand: e.target.value })}
                                    placeholder="yt-dlp"
                                    className="w-full bg-vod-surface border border-vod-border rounded-lg px-3 py-2 text-sm text-vod-text placeholder-vod-text-muted focus:outline-none focus:border-vod-accent font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-vod-surface border border-vod-border rounded-lg p-3">
                        <h3 className="text-xs font-semibold text-vod-text mb-2">Example Output</h3>
                        <code className="text-[10px] text-vod-text-muted font-mono break-all">
                            {settings.youtubeCommand || 'yt-dlp'} --download-sections "*00:01:30-00:02:45" "https://youtube.com/watch?v=..."
                        </code>
                    </div>

                    <div>
                        <h2 className="text-xs font-semibold text-vod-text-muted uppercase tracking-wide mb-3">
                            Display
                        </h2>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.multilineTimestamps}
                                onChange={(e) => setSettings({ ...settings, multilineTimestamps: e.target.checked })}
                                className="w-4 h-4 rounded border-vod-border bg-vod-surface text-vod-accent focus:ring-vod-accent focus:ring-offset-0 cursor-pointer"
                            />
                            <span className="text-xs text-vod-text">Multiline timestamp text</span>
                        </label>
                        <p className="text-[10px] text-vod-text-muted mt-1 ml-7">
                            When enabled, long timestamp text will wrap to multiple lines instead of being truncated with "..."
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xs font-semibold text-vod-text-muted uppercase tracking-wide mb-3">
                            Export Options
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.youtubeTimestampIncludeEnd}
                                        onChange={(e) => setSettings({ ...settings, youtubeTimestampIncludeEnd: e.target.checked })}
                                        className="w-4 h-4 rounded border-vod-border bg-vod-surface text-vod-accent focus:ring-vod-accent focus:ring-offset-0 cursor-pointer"
                                    />
                                    <span className="text-xs text-vod-text">Include end time in YouTube format</span>
                                </label>
                                <p className="text-[10px] text-vod-text-muted mt-1 ml-7">
                                    When enabled, chapters export as [start - end]. When disabled, export as [start].
                                </p>
                            </div>
                            <div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.normalTimestampIncludeEnd}
                                        onChange={(e) => setSettings({ ...settings, normalTimestampIncludeEnd: e.target.checked })}
                                        className="w-4 h-4 rounded border-vod-border bg-vod-surface text-vod-accent focus:ring-vod-accent focus:ring-offset-0 cursor-pointer"
                                    />
                                    <span className="text-xs text-vod-text">Include end time in VodTS format</span>
                                </label>
                                <p className="text-[10px] text-vod-text-muted mt-1 ml-7">
                                    When enabled, timestamps export as ~start - end. When disabled, export as ~start only.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-vod-border p-3">
                <button
                    onClick={handleSave}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                        saved
                            ? 'bg-green-600 text-white'
                            : 'bg-vod-accent hover:bg-vod-accent-hover text-white'
                    }`}
                >
                    {saved ? 'Saved!' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
}

