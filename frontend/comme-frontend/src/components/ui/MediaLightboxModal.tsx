import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Video, ExternalLink } from 'lucide-react';
import { CustomVideoPlayer } from '@/components/ui/CustomVideoPlayer';
import type { MediaItem } from '@/types/post';

export interface MediaLightboxModalProps {
    isOpen: boolean;
    onClose: () => void;
    mediaList?: (MediaItem | { url: string; file_name?: string; media_type?: string; mime_type?: string })[];
    media?: (MediaItem | { url: string; file_name?: string; media_type?: string; mime_type?: string })[];
    initialIndex?: number;
}

export const MediaLightboxModal: React.FC<MediaLightboxModalProps> = ({
    isOpen,
    onClose,
    mediaList,
    media,
    initialIndex = 0,
}) => {
    const items = mediaList || media || [];
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    // Sync initialIndex when opened
    useEffect(() => {
        if (isOpen && items.length > 0) {
            setCurrentIndex(Math.min(Math.max(0, initialIndex), items.length - 1));
        }
    }, [isOpen, initialIndex, items.length]);

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
        if (items.length <= 1) return;
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    }, [items.length]);

    const handleNext = useCallback(() => {
        if (items.length <= 1) return;
        setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    }, [items.length]);

    // Keyboard navigation (Esc to close, Arrow keys to navigate)
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft' && items.length > 1) {
                handlePrev();
            } else if (e.key === 'ArrowRight' && items.length > 1) {
                handleNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handlePrev, handleNext, onClose, items.length]);

    if (!isOpen || items.length === 0 || typeof document === 'undefined') return null;

    const currentMedia = items[currentIndex] || items[0];
    if (!currentMedia) return null;

    const isVideo =
        currentMedia.media_type === 'video' ||
        currentMedia.mime_type?.includes('video') ||
        (typeof currentMedia.url === 'string' && /\.(mp4|webm|mov|mkv)$/i.test(currentMedia.url));

    const isGif =
        currentMedia.mime_type?.includes('gif') ||
        (typeof currentMedia.url === 'string' && /\.gif$/i.test(currentMedia.url));

    const content = (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-black/95 backdrop-blur-2xl p-4 sm:p-6 select-none"
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                {/* ── Top Header Controls ── */}
                <div className="w-full flex items-center justify-between z-20 pointer-events-auto">
                    <div className="flex items-center gap-3">
                        {isVideo ? (
                            <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1.5 backdrop-blur-md">
                                <Video className="h-3.5 w-3.5" /> VIDEO
                            </span>
                        ) : isGif ? (
                            <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow backdrop-blur-md">
                                GIF
                            </span>
                        ) : (
                            <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow backdrop-blur-md">
                                IMAGE
                            </span>
                        )}

                        {items.length > 1 && (
                            <span className="text-xs font-mono font-bold text-white/80 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-md">
                                {currentIndex + 1} / {items.length}
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
                            className="h-10 w-10 rounded-full bg-white/10 hover:bg-destructive text-white flex items-center justify-center transition-colors cursor-pointer hover:scale-105"
                            title="Close (Esc)"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* ── Main Media Center ── */}
                <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden my-4">
                    {/* Previous Button */}
                    {items.length > 1 && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePrev();
                            }}
                            className="absolute left-2 sm:left-4 z-20 h-12 w-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 cursor-pointer shadow-lg"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="h-7 w-7" />
                        </button>
                    )}

                    {/* Media Display */}
                    <div className="max-w-full max-h-[78vh] flex items-center justify-center relative">
                        {isVideo ? (
                            <div className="w-full max-w-4xl max-h-[78vh] rounded-2xl overflow-hidden shadow-2xl">
                                <CustomVideoPlayer
                                    src={currentMedia.url}
                                    autoPlay={true}
                                />
                            </div>
                        ) : (
                            <motion.img
                                key={currentMedia.url}
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                src={currentMedia.url}
                                alt={currentMedia.file_name || 'Media preview'}
                                className="max-w-full max-h-[78vh] object-contain rounded-xl shadow-2xl cursor-zoom-out"
                                onClick={onClose}
                            />
                        )}
                    </div>

                    {/* Next Button */}
                    {items.length > 1 && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleNext();
                            }}
                            className="absolute right-2 sm:right-4 z-20 h-12 w-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 cursor-pointer shadow-lg"
                            aria-label="Next image"
                        >
                            <ChevronRight className="h-7 w-7" />
                        </button>
                    )}
                </div>

                {/* ── Bottom Thumbnail Strip ── */}
                {items.length > 1 && (
                    <div className="w-full flex items-center justify-center gap-2 overflow-x-auto py-2 px-4 max-w-2xl z-20 no-scrollbar pointer-events-auto">
                        {items.map((med, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentIndex(idx);
                                }}
                                className={`relative h-14 w-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                                    currentIndex === idx
                                        ? 'border-primary ring-2 ring-primary/40 scale-105 opacity-100'
                                        : 'border-transparent opacity-50 hover:opacity-80'
                                }`}
                            >
                                <img
                                    src={med.url}
                                    alt={med.file_name || `Thumb ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );

    return createPortal(content, document.body);
};
