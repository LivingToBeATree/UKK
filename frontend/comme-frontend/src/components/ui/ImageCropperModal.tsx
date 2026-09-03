import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, ZoomOut, RotateCw, Check, Loader2, Sparkles, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ImageCropperModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string;
    cropType: 'avatar' | 'banner';
    onCropComplete: (croppedFile: File) => Promise<void> | void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
    isOpen,
    onClose,
    imageSrc,
    cropType,
    onCropComplete,
}) => {
    // Zoom scale from 1 (fit) to 3
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    // Pan offset in pixels
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [saving, setSaving] = useState(false);

    const imageRef = useRef<HTMLImageElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Aspect ratios & preview dimensions
    // Avatar: 1:1, Banner: 3.2:1
    const aspectRatio = cropType === 'avatar' ? 1 : 3.2;

    // Reset parameters whenever a new image or modal opens
    useEffect(() => {
        if (isOpen) {
            setZoom(1);
            setRotation(0);
            setOffset({ x: 0, y: 0 });
            setSaving(false);
        }
    }, [isOpen, imageSrc]);

    // Handle mouse/touch drag for panning
    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        setOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        try {
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
            /* ignore */
        }
    };

    // Wheel zooming inside container
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY * -0.0015;
        setZoom((prev) => Math.min(Math.max(1, prev + delta), 3.5));
    };

    // Export the cropped region to a high-res canvas and generate File
    const handleApply = async () => {
        if (!imageRef.current || !containerRef.current) return;
        setSaving(true);

        try {
            const img = imageRef.current;
            const container = containerRef.current;
            const containerRect = container.getBoundingClientRect();

            // Output resolution
            const targetWidth = cropType === 'avatar' ? 600 : 1200;
            const targetHeight = targetWidth / aspectRatio;

            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                throw new Error('Canvas context not available');
            }

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Crop calculation
            // Convert current visual transform (zoom, offset, rotation) into image coordinate space
            const displayedWidth = containerRect.width;
            const displayedHeight = containerRect.height;

            const scaleRatioX = targetWidth / displayedWidth;
            const scaleRatioY = targetHeight / displayedHeight;

            ctx.save();
            // Translate to center of target canvas
            ctx.translate(targetWidth / 2, targetHeight / 2);
            ctx.rotate((rotation * Math.PI) / 180);

            // Calculate scaled image size based on object-fit: contain/cover
            const imgNaturalAspect = img.naturalWidth / img.naturalHeight;
            const containerAspect = displayedWidth / displayedHeight;

            let baseImgW: number;
            let baseImgH: number;

            if (imgNaturalAspect > containerAspect) {
                baseImgH = displayedHeight;
                baseImgW = baseImgH * imgNaturalAspect;
            } else {
                baseImgW = displayedWidth;
                baseImgH = baseImgW / imgNaturalAspect;
            }

            const drawWidth = baseImgW * zoom * scaleRatioX;
            const drawHeight = baseImgH * zoom * scaleRatioY;
            const drawX = offset.x * scaleRatioX - drawWidth / 2;
            const drawY = offset.y * scaleRatioY - drawHeight / 2;

            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
            ctx.restore();

            // Convert canvas to Blob -> File
            const blob = await new Promise<Blob | null>((resolve) =>
                canvas.toBlob((b) => resolve(b), 'image/webp', 0.95)
            );

            if (!blob) throw new Error('Failed to generate image file');

            const fileName = `${cropType}_${Date.now()}.webp`;
            const croppedFile = new File([blob], fileName, { type: 'image/webp' });

            await onCropComplete(croppedFile);
            onClose();
        } catch (err) {
            console.error('Cropping error:', err);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen || typeof document === 'undefined') return null;

    const content = (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none"
                onClick={(e) => {
                    if (e.target === e.currentTarget && !saving) onClose();
                }}
            >
                <motion.div
                    initial={{ scale: 0.94, opacity: 0, y: 12 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.94, opacity: 0, y: 12 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    className="w-full max-w-xl bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="p-4 sm:p-5 border-b border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-foreground">
                                    {cropType === 'avatar' ? 'Crop Profile Picture' : 'Adjust Profile Banner'}
                                </h3>
                                <p className="text-[11px] text-muted-foreground">
                                    Drag to reposition &amp; use slider to zoom
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="h-8 w-8 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Crop Viewport */}
                    <div className="p-4 sm:p-6 bg-black/40 flex flex-col items-center justify-center">
                        <div
                            ref={containerRef}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onWheel={handleWheel}
                            className={`relative overflow-hidden cursor-grab active:cursor-grabbing border-2 border-primary/40 shadow-inner bg-black/60 flex items-center justify-center ${
                                cropType === 'avatar'
                                    ? 'w-64 h-64 sm:w-72 sm:h-72 rounded-full ring-4 ring-card'
                                    : 'w-full h-44 sm:h-52 rounded-2xl ring-4 ring-card'
                            }`}
                        >
                            {/* Image element with pan & zoom transforms */}
                            <img
                                ref={imageRef}
                                src={imageSrc}
                                alt="Crop source"
                                draggable={false}
                                style={{
                                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                                    transformOrigin: 'center center',
                                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                                }}
                                className="max-w-full max-h-full object-contain pointer-events-none select-none"
                            />

                            {/* Center pan guide icon */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 hover:opacity-20 transition-opacity">
                                <Move className="h-8 w-8 text-white drop-shadow" />
                            </div>
                        </div>
                    </div>

                    {/* Controls Footer */}
                    <div className="p-4 sm:p-5 border-t border-border/50 space-y-4 bg-card">
                        {/* Zoom Slider & Rotate */}
                        <div className="flex items-center gap-3">
                            <ZoomOut className="h-4 w-4 text-muted-foreground shrink-0" />
                            <input
                                type="range"
                                min={1}
                                max={3.5}
                                step={0.05}
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="w-full accent-primary cursor-pointer h-1.5 bg-muted rounded-lg"
                            />
                            <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                                className="h-8 w-8 p-0 rounded-xl shrink-0"
                                title="Rotate 90°"
                            >
                                <RotateCw className="h-3.5 w-3.5" />
                            </Button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-2 pt-1">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onClose}
                                disabled={saving}
                                className="rounded-xl text-xs font-semibold"
                            >
                                Cancel
                            </Button>

                            <Button
                                type="button"
                                size="sm"
                                onClick={handleApply}
                                disabled={saving}
                                className="rounded-xl text-xs font-bold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 min-w-28 shadow-sm shadow-primary/25"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Applying...
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-3.5 w-3.5" />
                                        Save &amp; Apply
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );

    return createPortal(content, document.body);
};
