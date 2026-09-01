import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Video, ExternalLink } from 'lucide-react';
import { CustomVideoPlayer } from '@/components/ui/CustomVideoPlayer';
import type { MediaItem } from '@/types/post';

interface MediaLightboxModalProps {
    isOpen: boolean;
    onClose: () => void;
    mediaList: (MediaItem | { url: string; file_name?: string; media_type?: string; mime_type?: string })[];
    initialIndex?: number;
}

export const MediaLightboxModal: React.FC<MediaLightboxModalProps> = ({
    isOpen,
    onClose,
    mediaList,
    initialIndex = 0,
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    // Sync initialIndex when opened
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(Math.min(Math.max(0, initialIndex), Math.max(0, mediaList.length - 1)));
        }
    }, [isOpen, initialIndex, mediaList.length]);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [isOpen]);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : mediaList.length - 1));
    }, [mediaList.length]);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev < mediaList.length - 1 ? prev + 1 : 0));
    }, [mediaList.length]);

    // Keyboard navigation (Esc to close, Arrow keys to navigate)
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft' && mediaList.length > 1) {
                handlePrev();
            } else if (e.key === 'ArrowRight' && mediaList.length > 1) {
                handleNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handlePrev, handleNext, onClose, mediaList.length]);

    if (!isOpen || mediaList.length === 0) return null;

    const currentMedia = mediaList[currentIndex];
    if (!currentMedia) return null;

    const isVideo =
        currentMedia.media_type === 'video' ||
        currentMedia.mime_type?.includes('video') ||
        (typeof currentMedia.url === 'string' && /\.(mp4|webm|mov|mkv)$/i.test(currentMedia.url));

    const isGif =
        currentMedia.mime_type?.includes('gif') ||
        (typeof currentMedia.url === 'string' && /\.gif$/i.test(currentMedia.url));

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/92 backdrop-blur-2xl p-4 sm:p-6 select-none"
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                {/* ── Top Header Controls ── */}
                <div className="w-full flex items-center justify-between z-20 pointer-events-auto">
                    <div className="flex items-center gap-3">
                        {isVideo ? (
                            <span className="bg-blue-600/90 text-white text-xs font-black px-2.5 py-1 rounded-full shadow flex items-center gap-1.5 backdrop-blur-md">
                                <Video className="h-3.5 w-3.5" /> VIDEO
                            </span>
                        ) : isGif ? (
                            <span className="bg-purple-600/90 text-white text-xs font-black px-2.5 py-1 rounded-full shadow backdrop-blur-md">
                                GIF
                            </span>
                        ) : (
                            <span className="bg-emerald-600/90 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow backdrop-blur-md">
                                IMAGE
                            </span>
                        )}

                        {mediaList.length > 1 && (
                            <span className="text-xs font-mono font-bold text-white/80 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-md">
                                {currentIndex + 1} / {mediaList.length}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Download / Open original */}
                        <a
                            href={currentMedia.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={currentMedia.file_name || 'media'}
                            className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                            title="Open original media"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </a>

                        {/* Close button */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-10 w-10 rounded-full bg-white/10 hover:bg-rose-500/80 text-white flex items-center justify-center transition-colors cursor-pointer hover:scale-105"
                            title="Close (Esc)"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* ── Center Stage Media Viewer ── */}
                <div
                    className="relative flex-1 w-full flex items-center justify-center overflow-hidden my-2"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) onClose();
                    }}
                >
                    {/* Previous Button */}
                    {mediaList.length > 1 && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePrev();
                            }}
                            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center shadow-2xl backdrop-blur-md transition-all cursor-pointer z-30 hover:scale-110"
                            title="Previous (Left Arrow)"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                    )}

                    {/* Active Media */}
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-center max-w-full max-h-full"
                    >
                        {isVideo ? (
                            <CustomVideoPlayer
                                src={currentMedia.url}
                                autoPlay
                                loop
                                className="max-w-[90vw] max-h-[calc(100vh-190px)] rounded-2xl shadow-2xl border border-white/10"
                                videoClassName="max-h-[calc(100vh-190px)]"
                            />
                        ) : (
                            <img
                                src={currentMedia.url}
                                alt={currentMedia.file_name || 'Preview media'}
                                className="max-w-[90vw] max-h-[calc(100vh-190px)] rounded-2xl shadow-2xl object-contain"
                            />
                        )}
                    </motion.div>

                    {/* Next Button */}
                    {mediaList.length > 1 && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleNext();
                            }}
                            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center shadow-2xl backdrop-blur-md transition-all cursor-pointer z-30 hover:scale-110"
                            title="Next (Right Arrow)"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    )}
                </div>

                {/* ── Bottom Thumbnail Strip ── */}
                {mediaList.length > 1 && (
                    <div className="w-full flex items-center justify-center gap-2 py-2 overflow-x-auto z-20">
                        {mediaList.map((m, idx) => {
                            const isThumbActive = idx === currentIndex;
                            const isThumbVideo =
                                m.media_type === 'video' ||
                                m.mime_type?.includes('video') ||
                                (typeof m.url === 'string' && /\.(mp4|webm|mov|mkv)$/i.test(m.url));

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`relative h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                                        isThumbActive
                                            ? 'border-primary ring-2 ring-primary/50 scale-105 opacity-100'
                                            : 'border-white/20 opacity-50 hover:opacity-80'
                                    }`}
                                >
                                    {isThumbVideo ? (
                                        <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                            <Video className="h-5 w-5 text-white/80" />
                                        </div>
                                    ) : (
                                        <img
                                            src={m.url}
                                            alt={`Thumb ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};
