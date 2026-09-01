import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    Repeat,
    RotateCcw,
    RotateCw,
} from 'lucide-react';

interface CustomVideoPlayerProps {
    src: string;
    autoPlay?: boolean;
    loop?: boolean;
    className?: string;
    videoClassName?: string;
    poster?: string;
}

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
    src,
    autoPlay = false,
    loop: initialLoop = true,
    className = '',
    videoClassName = '',
    poster,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);

    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isLooping, setIsLooping] = useState(initialLoop);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isBuffering, setIsBuffering] = useState(false);

    // Scrubber dragging & hover preview
    const [isDragging, setIsDragging] = useState(false);
    const isDraggingRef = useRef(false); // synchronous guard — React state is async!
    const isSeekingRef = useRef(false);  // guards seekRelative from timeupdate race
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [hoverX, setHoverX] = useState<number>(0);

    const controlsTimeoutRef = useRef<number | null>(null);

    // Auto-hide controls after inactivity
    const resetControlsTimeout = useCallback(() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            window.clearTimeout(controlsTimeoutRef.current);
        }
        if (isPlaying && !isDragging) {
            controlsTimeoutRef.current = window.setTimeout(() => {
                setShowControls(false);
            }, 2800);
        }
    }, [isPlaying, isDragging]);

    useEffect(() => {
        return () => {
            if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
        };
    }, []);

    // Fullscreen change listener
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const togglePlay = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play().catch(() => {});
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
        resetControlsTimeout();
    };

    const toggleMute = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!videoRef.current) return;
        const nextMuted = !isMuted;
        videoRef.current.muted = nextMuted;
        setIsMuted(nextMuted);
        resetControlsTimeout();
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        const val = parseFloat(e.target.value);
        setVolume(val);
        if (videoRef.current) {
            videoRef.current.volume = val;
            videoRef.current.muted = val === 0;
            setIsMuted(val === 0);
        }
        resetControlsTimeout();
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        // Skip if we're actively dragging or mid-seek — the ref is synchronous
        if (isDraggingRef.current || isSeekingRef.current) return;
        setCurrentTime(videoRef.current.currentTime);
    };

    const syncDuration = () => {
        if (!videoRef.current) return;
        const dur = videoRef.current.duration;
        if (!isNaN(dur) && isFinite(dur) && dur > 0) {
            setDuration(dur);
        }
    };

    const handleLoadedMetadata = () => {
        syncDuration();
        if (autoPlay && videoRef.current) {
            videoRef.current.play().catch(() => {
                if (videoRef.current) {
                    videoRef.current.muted = true;
                    setIsMuted(true);
                    videoRef.current.play().catch(() => setIsPlaying(false));
                }
            });
        }
    };

    // Fast forward / Rewind by delta seconds
    const seekRelative = (seconds: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!videoRef.current) return;
        isSeekingRef.current = true;
        const dur = duration || videoRef.current.duration || 0;
        const newTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, dur));
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
        resetControlsTimeout();
    };

    // Calculate time from pointer event on timeline
    const getTimeFromEvent = (e: MouseEvent | React.MouseEvent): number => {
        if (!timelineRef.current || !videoRef.current) return 0;
        const rect = timelineRef.current.getBoundingClientRect();
        const offsetX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percentage = offsetX / rect.width;
        const dur = duration || videoRef.current.duration || 0;
        return percentage * dur;
    };

    const handleTimelinePointerDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        isDraggingRef.current = true;
        isSeekingRef.current = true;
        setIsDragging(true);
        const newTime = getTimeFromEvent(e);
        setCurrentTime(newTime);
        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
        }

        const handlePointerMove = (moveEvent: MouseEvent) => {
            isSeekingRef.current = true;
            const moveTime = getTimeFromEvent(moveEvent);
            setCurrentTime(moveTime);
            if (videoRef.current) {
                videoRef.current.currentTime = moveTime;
            }
        };

        const handlePointerUp = () => {
            isDraggingRef.current = false;
            setIsDragging(false);
            // NOTE: isSeekingRef stays true until the video's onSeeked event fires
            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('mouseup', handlePointerUp);
            resetControlsTimeout();
        };

        window.addEventListener('mousemove', handlePointerMove);
        window.addEventListener('mouseup', handlePointerUp);
    };

    const handleTimelineHover = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!timelineRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const offsetX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        setHoverX(offsetX);
        const dur = duration || videoRef.current?.duration || 0;
        setHoverTime((offsetX / rect.width) * dur);
    };

    const toggleFullscreen = async (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            try {
                await containerRef.current.requestFullscreen();
            } catch (err) {
                console.error('Fullscreen request failed:', err);
            }
        } else {
            try {
                await document.exitFullscreen();
            } catch (err) {
                console.error('Exit fullscreen failed:', err);
            }
        }
        resetControlsTimeout();
    };

    const toggleLoop = (e: React.MouseEvent) => {
        e.stopPropagation();
        const nextLoop = !isLooping;
        setIsLooping(nextLoop);
        if (videoRef.current) videoRef.current.loop = nextLoop;
        resetControlsTimeout();
    };

    const formatTime = (secs: number) => {
        if (isNaN(secs) || !isFinite(secs) || secs < 0) return '0:00';
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Keyboard controls when hovering/focusing the container
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === ' ' || e.key === 'k') {
            e.preventDefault();
            togglePlay();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            e.stopPropagation();
            seekRelative(-5);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            e.stopPropagation();
            seekRelative(5);
        } else if (e.key === 'f') {
            e.preventDefault();
            toggleFullscreen();
        } else if (e.key === 'm') {
            e.preventDefault();
            toggleMute();
        }
    };

    const progressPercentage = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

    return (
        <div
            ref={containerRef}
            tabIndex={0}
            className={`relative flex items-center justify-center bg-black overflow-hidden select-none outline-none group/video ${className}`}
            onMouseMove={resetControlsTimeout}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => {
                if (isPlaying && !isDragging) setShowControls(false);
            }}
            onClick={togglePlay}
            onKeyDown={handleKeyDown}
        >
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                loop={isLooping}
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onDurationChange={syncDuration}
                onLoadedMetadata={handleLoadedMetadata}
                onSeeked={() => {
                    // Seek completed — sync state to actual position, then unlock
                    if (videoRef.current) {
                        setCurrentTime(videoRef.current.currentTime);
                    }
                    isSeekingRef.current = false;
                }}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => {
                    setIsBuffering(false);
                    setIsPlaying(true);
                }}
                onPause={() => setIsPlaying(false)}
                className={`w-full h-full object-contain ${videoClassName}`}
            />

            {/* Center Play Button on Pause */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none z-10">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-black/75 hover:bg-black/90 text-white flex items-center justify-center shadow-2xl backdrop-blur-md border border-white/20 transform transition-transform duration-200 hover:scale-110">
                        <Play className="h-8 w-8 sm:h-10 sm:w-10 ml-1 text-white fill-white" />
                    </div>
                </div>
            )}

            {/* Buffering Indicator */}
            {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none z-10">
                    <div className="h-12 w-12 rounded-full border-4 border-white/20 border-t-white animate-spin" />
                </div>
            )}

            {/* ── Custom Control Bar ── */}
            <div
                className={`absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-2.5 z-30 transition-opacity duration-300 ${
                    showControls || !isPlaying || isDragging ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Timeline Track & Scrubber ── */}
                <div
                    ref={timelineRef}
                    className="relative w-full h-4 flex items-center cursor-pointer group/timeline py-1"
                    onMouseDown={handleTimelinePointerDown}
                    onMouseMove={handleTimelineHover}
                    onMouseLeave={() => setHoverTime(null)}
                >
                    {/* Background Track */}
                    <div className="w-full h-1.5 group-hover/timeline:h-2.5 bg-white/25 rounded-full overflow-hidden transition-all duration-150">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-purple-400 rounded-full transition-all"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>

                    {/* Scrubber Thumb */}
                    <div
                        className="absolute h-3.5 w-3.5 rounded-full bg-white shadow-lg border border-primary scale-0 group-hover/timeline:scale-100 transition-transform -translate-x-1/2 pointer-events-none"
                        style={{ left: `${progressPercentage}%` }}
                    />

                    {/* Hover Timestamp Tooltip */}
                    {hoverTime !== null && (
                        <div
                            className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 text-white text-[10px] font-mono font-bold pointer-events-none shadow border border-white/10"
                            style={{ left: `${hoverX}px` }}
                        >
                            {formatTime(hoverTime)}
                        </div>
                    )}
                </div>

                {/* ── Action Buttons Row ── */}
                <div className="flex items-center justify-between gap-2 text-white">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        {/* Play/Pause */}
                        <button
                            type="button"
                            onClick={togglePlay}
                            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                        >
                            {isPlaying ? (
                                <Pause className="h-4 w-4 fill-white text-white" />
                            ) : (
                                <Play className="h-4 w-4 ml-0.5 fill-white text-white" />
                            )}
                        </button>

                        {/* Rewind 5s */}
                        <button
                            type="button"
                            onClick={(e) => seekRelative(-5, e)}
                            className="h-8 px-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Rewind 5s (Left Arrow)"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-mono hidden sm:inline">5s</span>
                        </button>

                        {/* Forward 5s */}
                        <button
                            type="button"
                            onClick={(e) => seekRelative(5, e)}
                            className="h-8 px-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Forward 5s (Right Arrow)"
                        >
                            <RotateCw className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-mono hidden sm:inline">5s</span>
                        </button>

                        {/* Volume Controls */}
                        <div className="flex items-center gap-1.5 ml-1">
                            <button
                                type="button"
                                onClick={toggleMute}
                                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                            >
                                {isMuted || volume === 0 ? (
                                    <VolumeX className="h-4 w-4 text-rose-400" />
                                ) : (
                                    <Volume2 className="h-4 w-4" />
                                )}
                            </button>
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.05}
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-16 sm:w-20 h-1 bg-white/30 rounded appearance-none cursor-pointer accent-primary hidden sm:block"
                            />
                        </div>

                        {/* Time Counter */}
                        <span className="text-xs font-mono text-white/90 font-medium select-none ml-1">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                        {/* Loop Toggle */}
                        <button
                            type="button"
                            onClick={toggleLoop}
                            className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                                isLooping ? 'bg-primary text-white' : 'bg-white/10 hover:bg-white/20 text-white/70'
                            }`}
                            title={isLooping ? 'Looping enabled' : 'Looping disabled'}
                        >
                            <Repeat className="h-3.5 w-3.5" />
                        </button>

                        {/* Fullscreen Toggle */}
                        <button
                            type="button"
                            onClick={toggleFullscreen}
                            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
                        >
                            {isFullscreen ? (
                                <Minimize className="h-4 w-4" />
                            ) : (
                                <Maximize className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
