import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Repeat, RotateCcw } from 'lucide-react';

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

    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isLooping, setIsLooping] = useState(initialLoop);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isBuffering, setIsBuffering] = useState(false);

    const controlsTimeoutRef = useRef<number | null>(null);

    // Auto-hide controls after inactivity
    const resetControlsTimeout = useCallback(() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            window.clearTimeout(controlsTimeoutRef.current);
        }
        if (isPlaying) {
            controlsTimeoutRef.current = window.setTimeout(() => {
                setShowControls(false);
            }, 2500);
        }
    }, [isPlaying]);

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
            videoRef.current.play();
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
        setCurrentTime(videoRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (!videoRef.current) return;
        setDuration(videoRef.current.duration);
        if (autoPlay) {
            videoRef.current.play().catch(() => {
                // Autoplay blocked without user gesture; fallback to muted autoplay
                if (videoRef.current) {
                    videoRef.current.muted = true;
                    setIsMuted(true);
                    videoRef.current.play().catch(() => setIsPlaying(false));
                }
            });
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        const time = parseFloat(e.target.value);
        setCurrentTime(time);
        if (videoRef.current) {
            videoRef.current.currentTime = time;
        }
        resetControlsTimeout();
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
        if (isNaN(secs)) return '0:00';
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div
            ref={containerRef}
            className={`relative flex items-center justify-center bg-black overflow-hidden select-none group/video ${className}`}
            onMouseMove={resetControlsTimeout}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => {
                if (isPlaying) setShowControls(false);
            }}
            onClick={togglePlay}
        >
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                loop={isLooping}
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => {
                    setIsBuffering(false);
                    setIsPlaying(true);
                }}
                onPause={() => setIsPlaying(false)}
                className={`w-full h-full object-contain ${videoClassName}`}
            />

            {/* Big Center Play Ripple Button when Paused */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none z-10">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-black/75 hover:bg-black/90 text-white flex items-center justify-center shadow-2xl backdrop-blur-md border border-white/20 transform transition-transform duration-200 hover:scale-110">
                        <Play className="h-8 w-8 sm:h-10 sm:w-10 ml-1 text-white fill-white" />
                    </div>
                </div>
            )}

            {/* Loading / Buffering Spinner */}
            {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none z-10">
                    <div className="h-12 w-12 rounded-full border-4 border-white/20 border-t-white animate-spin" />
                </div>
            )}

            {/* ── Custom Glassmorphic Controls Bar ── */}
            <div
                className={`absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-2 z-20 transition-opacity duration-300 ${
                    showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Timeline Scrubber */}
                <div className="flex items-center gap-2 group/timeline">
                    <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        step={0.1}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1.5 bg-white/25 rounded-lg appearance-none cursor-pointer accent-primary hover:h-2.5 transition-all"
                        style={{
                            background: `linear-gradient(to right, #a855f7 ${
                                duration ? (currentTime / duration) * 100 : 0
                            }%, rgba(255,255,255,0.2) 0%)`,
                        }}
                    />
                </div>

                {/* Control Action Buttons */}
                <div className="flex items-center justify-between gap-2 text-white">
                    <div className="flex items-center gap-2 sm:gap-3">
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

                        {/* Replay / Restart */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (videoRef.current) videoRef.current.currentTime = 0;
                            }}
                            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer hidden sm:flex"
                            title="Restart"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                        </button>

                        {/* Volume Control */}
                        <div className="flex items-center gap-1.5 group/vol">
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
                                className="w-16 sm:w-20 h-1 bg-white/30 rounded appearance-none cursor-pointer accent-white hidden sm:block"
                            />
                        </div>

                        {/* Time Counter */}
                        <span className="text-xs font-mono text-white/90 font-medium select-none ml-1">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Loop Toggle */}
                        <button
                            type="button"
                            onClick={toggleLoop}
                            className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                                isLooping ? 'bg-primary/80 text-white' : 'bg-white/10 hover:bg-white/20 text-white/70'
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
