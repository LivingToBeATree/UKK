import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Pipette, Check } from 'lucide-react';
import { Input } from './input';
import { Label } from './label';
import { Button } from './button';

// ── Color Utilities ──
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
    s = s / 100;
    v = v / 100;
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r = 0, g = 0, b = 0;
    if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
    else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
    else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
    else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
    else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
    else if (h >= 300 && h <= 360) { r = c; g = 0; b = x; }
    return [
        Math.round((r + m) * 255),
        Math.round((g + m) * 255),
        Math.round((b + m) * 255),
    ];
}

function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function hexToRgb(hex: string): [number, number, number] | null {
    const clean = hex.replace('#', '');
    if (clean.length !== 6) return null;
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return [r, g, b];
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : (d / max) * 100;
    const v = max * 100;
    if (max !== min) {
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
            case g: h = ((b - r) / d + 2) * 60; break;
            case b: h = ((r - g) / d + 4) * 60; break;
        }
    }
    return [Math.round(h), Math.round(s), Math.round(v)];
}

function hexToHsv(hex: string): [number, number, number] {
    const rgb = hexToRgb(hex);
    if (!rgb) return [270, 80, 95];
    return rgbToHsv(rgb[0], rgb[1], rgb[2]);
}

interface CustomColorPickerProps {
    value: string;
    onChange: (hex: string) => void;
    onApply?: (hex: string) => void;
    className?: string;
}

export const CustomColorPicker: React.FC<CustomColorPickerProps> = ({
    value,
    onChange,
    onApply,
    className = '',
}) => {
    const [hsv, setHsv] = useState<[number, number, number]>(() => hexToHsv(value || '#A802F5'));
    const [hexInput, setHexInput] = useState(value || '#A802F5');
    const satValRef = useRef<HTMLDivElement>(null);
    const hueRef = useRef<HTMLDivElement>(null);
    const isDraggingSatVal = useRef(false);
    const isDraggingHue = useRef(false);

    const [hue, sat, val] = hsv;
    const [r, g, b] = hsvToRgb(hue, sat, val);
    const currentHex = rgbToHex(r, g, b);

    // Sync from external value change
    useEffect(() => {
        if (value && value.toUpperCase() !== currentHex.toUpperCase()) {
            const nextHsv = hexToHsv(value);
            setHsv(nextHsv);
            setHexInput(value.toUpperCase());
        }
    }, [value, currentHex]);

    // Handle 2D Saturation/Value Drag
    const updateSatValFromEvent = useCallback((e: MouseEvent | TouchEvent) => {
        if (!satValRef.current) return;
        const rect = satValRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

        const newSat = Math.round((x / rect.width) * 100);
        const newVal = Math.round((1 - y / rect.height) * 100);

        setHsv(([h]) => {
            const next: [number, number, number] = [h, newSat, newVal];
            const [nr, ng, nb] = hsvToRgb(next[0], next[1], next[2]);
            const newHex = rgbToHex(nr, ng, nb);
            setHexInput(newHex);
            onChange(newHex);
            return next;
        });
    }, [onChange]);

    // Handle 1D Hue Slider Drag
    const updateHueFromEvent = useCallback((e: MouseEvent | TouchEvent) => {
        if (!hueRef.current) return;
        const rect = hueRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;

        const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const newHue = Math.round((x / rect.width) * 360);

        setHsv(([, s, v]) => {
            const next: [number, number, number] = [newHue, s, v];
            const [nr, ng, nb] = hsvToRgb(next[0], next[1], next[2]);
            const newHex = rgbToHex(nr, ng, nb);
            setHexInput(newHex);
            onChange(newHex);
            return next;
        });
    }, [onChange]);

    // Global drag listener
    useEffect(() => {
        const handleMove = (e: MouseEvent | TouchEvent) => {
            if (isDraggingSatVal.current) {
                e.preventDefault();
                updateSatValFromEvent(e);
            } else if (isDraggingHue.current) {
                e.preventDefault();
                updateHueFromEvent(e);
            }
        };

        const handleUp = () => {
            isDraggingSatVal.current = false;
            isDraggingHue.current = false;
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleUp);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleUp);
        };
    }, [updateSatValFromEvent, updateHueFromEvent]);

    const handleHexInputChange = (newHex: string) => {
        setHexInput(newHex);
        if (/^#[0-9A-Fa-f]{6}$/.test(newHex)) {
            const newHsv = hexToHsv(newHex);
            setHsv(newHsv);
            onChange(newHex.toUpperCase());
        }
    };

    const handleRgbChange = (channel: 'r' | 'g' | 'b', valStr: string) => {
        const num = Math.max(0, Math.min(255, parseInt(valStr) || 0));
        let nr = r, ng = g, nb = b;
        if (channel === 'r') nr = num;
        if (channel === 'g') ng = num;
        if (channel === 'b') nb = num;
        const newHex = rgbToHex(nr, ng, nb);
        setHsv(rgbToHsv(nr, ng, nb));
        setHexInput(newHex);
        onChange(newHex);
    };

    const pureHueColor = `hsl(${hue}, 100%, 50%)`;

    return (
        <div className={`space-y-6 select-none ${className}`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* ── 2D Saturation / Value Canvas Pad ── */}
                <div className="lg:col-span-7 space-y-4">
                    <div
                        ref={satValRef}
                        onMouseDown={(e) => {
                            isDraggingSatVal.current = true;
                            updateSatValFromEvent(e.nativeEvent);
                        }}
                        onTouchStart={(e) => {
                            isDraggingSatVal.current = true;
                            updateSatValFromEvent(e.nativeEvent);
                        }}
                        className="relative w-full h-56 rounded-2xl cursor-crosshair overflow-hidden shadow-inner ring-1 ring-border/80"
                        style={{
                            backgroundColor: pureHueColor,
                            backgroundImage: `
                                linear-gradient(to top, #000000, transparent),
                                linear-gradient(to right, #ffffff, transparent)
                            `,
                        }}
                    >
                        {/* Interactive Crosshair Thumb */}
                        <div
                            className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-white shadow-lg pointer-events-none ring-2 ring-black/40"
                            style={{
                                left: `${sat}%`,
                                top: `${100 - val}%`,
                                backgroundColor: currentHex,
                            }}
                        />
                    </div>

                    {/* ── 1D Rainbow Hue Slider ── */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold px-1">
                            <span>Hue Spectrum</span>
                            <span>{hue}°</span>
                        </div>
                        <div
                            ref={hueRef}
                            onMouseDown={(e) => {
                                isDraggingHue.current = true;
                                updateHueFromEvent(e.nativeEvent);
                            }}
                            onTouchStart={(e) => {
                                isDraggingHue.current = true;
                                updateHueFromEvent(e.nativeEvent);
                            }}
                            className="relative w-full h-7 rounded-xl cursor-pointer shadow-inner ring-1 ring-border/80"
                            style={{
                                background: `linear-gradient(to right,
                                    #ff0000 0%,
                                    #ffff00 17%,
                                    #00ff00 33%,
                                    #00ffff 50%,
                                    #0000ff 67%,
                                    #ff00ff 83%,
                                    #ff0000 100%
                                )`,
                            }}
                        >
                            {/* Hue Thumb */}
                            <div
                                className="absolute w-5 h-7 -ml-2.5 rounded-lg border-2 border-white bg-card shadow-md pointer-events-none ring-1 ring-black/30"
                                style={{
                                    left: `${(hue / 360) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* ── Numeric Controls & Swatches (Right Side) ── */}
                <div className="lg:col-span-5 space-y-5">
                    {/* Live Preview Header */}
                    <div className="p-4 rounded-2xl border border-border/80 bg-card/80 flex items-center gap-4">
                        <div
                            className="w-14 h-14 rounded-2xl ring-2 ring-border/80 shadow-md flex items-center justify-center shrink-0"
                            style={{ backgroundColor: currentHex }}
                        >
                            <Pipette className="h-6 w-6 text-white drop-shadow-md" />
                        </div>
                        <div className="overflow-hidden min-w-0">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                                Active Custom Tone
                            </span>
                            <p className="text-xl font-black font-mono tracking-wider text-foreground">
                                {currentHex}
                            </p>
                        </div>
                    </div>

                    {/* HEX Input */}
                    <div className="space-y-1.5">
                        <Label htmlFor="hex_code_input" className="text-xs font-semibold">
                            HEX Code
                        </Label>
                        <Input
                            id="hex_code_input"
                            value={hexInput}
                            onChange={(e) => handleHexInputChange(e.target.value)}
                            placeholder="#B899FF"
                            className="h-11 rounded-xl font-mono text-sm font-bold uppercase px-3.5 bg-card border-border/80"
                            maxLength={7}
                        />
                    </div>

                    {/* RGB Channels */}
                    <div className="grid grid-cols-3 gap-2.5">
                        <div className="space-y-1">
                            <Label className="text-[11px] font-semibold text-muted-foreground">R</Label>
                            <Input
                                type="number"
                                min={0}
                                max={255}
                                value={r}
                                onChange={(e) => handleRgbChange('r', e.target.value)}
                                className="h-10 rounded-xl font-mono text-xs text-center font-bold px-2"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[11px] font-semibold text-muted-foreground">G</Label>
                            <Input
                                type="number"
                                min={0}
                                max={255}
                                value={g}
                                onChange={(e) => handleRgbChange('g', e.target.value)}
                                className="h-10 rounded-xl font-mono text-xs text-center font-bold px-2"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[11px] font-semibold text-muted-foreground">B</Label>
                            <Input
                                type="number"
                                min={0}
                                max={255}
                                value={b}
                                onChange={(e) => handleRgbChange('b', e.target.value)}
                                className="h-10 rounded-xl font-mono text-xs text-center font-bold px-2"
                            />
                        </div>
                    </div>

                    {/* Quick Swatches Inspiration */}
                    <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-muted-foreground">Quick Palette Inspiration</span>
                        <div className="flex flex-wrap gap-2">
                            {[
                                '#B899FF', // Dreamy Lilac
                                '#06B6D4', // Cyan
                                '#10B981', // Emerald
                                '#F59E0B', // Amber
                                '#EC4899', // Hyper Pink
                                '#6366F1', // Indigo
                                '#3B82F6', // Cobalt
                                '#EF4444', // Crimson
                                '#8B5CF6', // Purple
                                '#F97316', // Orange
                            ].map((swatch) => (
                                <button
                                    key={swatch}
                                    type="button"
                                    onClick={() => handleHexInputChange(swatch)}
                                    className="h-7 w-7 rounded-xl border border-border/80 shadow-xs hover:scale-115 transition-transform cursor-pointer"
                                    style={{ backgroundColor: swatch }}
                                    title={swatch}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Apply Button */}
                    {onApply && (
                        <Button
                            type="button"
                            onClick={() => onApply(currentHex)}
                            className="w-full h-11 rounded-xl font-bold shadow-md text-xs cursor-pointer gap-2"
                        >
                            <Check className="h-4 w-4" />
                            <span>Apply Custom Accent Theme</span>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
