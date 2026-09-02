import React, { useState, useRef, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    X,
    Sparkles,
} from 'lucide-react';
import { Button } from './button';

export interface DatePickerProps {
    value?: string; // Format: 'YYYY-MM-DD'
    onChange: (dateStr: string) => void;
    placeholder?: string;
    minDate?: string; // Format: 'YYYY-MM-DD'
    maxDate?: string;
    disabled?: boolean;
    className?: string;
    showPresets?: boolean;
}

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DatePicker: React.FC<DatePickerProps> = ({
    value,
    onChange,
    placeholder = 'Select target deadline...',
    minDate,
    maxDate,
    disabled = false,
    className = '',
    showPresets = true,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial display month/year based on value or current date
    const initialDate = value ? new Date(value + 'T00:00:00') : new Date();
    const [displayYear, setDisplayYear] = useState<number>(initialDate.getFullYear());
    const [displayMonth, setDisplayMonth] = useState<number>(initialDate.getMonth());

    // Sync display month when value changes
    useEffect(() => {
        if (value) {
            const d = new Date(value + 'T00:00:00');
            if (!isNaN(d.getTime())) {
                setDisplayYear(d.getFullYear());
                setDisplayMonth(d.getMonth());
            }
        }
    }, [value]);

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (displayMonth === 0) {
            setDisplayMonth(11);
            setDisplayYear((y) => y - 1);
        } else {
            setDisplayMonth((m) => m - 1);
        }
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (displayMonth === 11) {
            setDisplayMonth(0);
            setDisplayYear((y) => y + 1);
        } else {
            setDisplayMonth((m) => m + 1);
        }
    };

    // Calculate calendar grid
    const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(displayYear, displayMonth, 1).getDay(); // 0 (Sun) to 6 (Sat)
    const prevMonthDays = new Date(displayYear, displayMonth, 0).getDate();

    const isDateDisabled = (year: number, month: number, day: number) => {
        const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (minDate && dStr < minDate) return true;
        if (maxDate && dStr > maxDate) return true;
        return false;
    };

    const isDateSelected = (year: number, month: number, day: number) => {
        if (!value) return false;
        const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return value === dStr;
    };

    const isToday = (year: number, month: number, day: number) => {
        const today = new Date();
        return (
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day
        );
    };

    const handleSelectDate = (year: number, month: number, day: number) => {
        if (isDateDisabled(year, month, day)) return;
        const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onChange(dStr);
        setIsOpen(false);
    };

    const formatDisplayValue = (valStr?: string) => {
        if (!valStr) return '';
        const d = new Date(valStr + 'T00:00:00');
        if (isNaN(d.getTime())) return valStr;
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const applyPreset = (daysFromNow: number) => {
        const target = new Date();
        target.setDate(target.getDate() + daysFromNow);
        const y = target.getFullYear();
        const m = String(target.getMonth() + 1).padStart(2, '0');
        const d = String(target.getDate()).padStart(2, '0');
        const dStr = `${y}-${m}-${d}`;
        if (minDate && dStr < minDate) return;
        onChange(dStr);
        setIsOpen(false);
    };

    return (
        <div className={`relative w-full ${className}`} ref={containerRef}>
            {/* Trigger input */}
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl border transition-all text-xs cursor-pointer select-none ${
                    disabled
                        ? 'bg-muted/40 text-muted-foreground border-border cursor-not-allowed opacity-60'
                        : isOpen
                        ? 'bg-card border-purple-500/80 ring-2 ring-purple-500/20 shadow-md'
                        : 'bg-card/90 hover:bg-card border-border hover:border-purple-500/40 text-foreground'
                }`}
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <CalendarIcon className={`h-4 w-4 shrink-0 ${value ? 'text-purple-400' : 'text-muted-foreground'}`} />
                    <span className={`truncate font-medium ${value ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                        {value ? formatDisplayValue(value) : placeholder}
                    </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {value && !disabled && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange('');
                            }}
                            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                            title="Clear date"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Custom Dark Popover Calendar */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 w-[310px] rounded-3xl border border-border/80 bg-zinc-950/95 backdrop-blur-xl p-4 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150">
                    {/* Header Controls */}
                    <div className="flex items-center justify-between pb-3 border-b border-border/60">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handlePrevMonth}
                            className="h-7 w-7 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                            <span>{MONTH_NAMES[displayMonth]}</span>
                            <span className="text-muted-foreground font-mono">{displayYear}</span>
                        </div>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleNextMonth}
                            className="h-7 w-7 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Quick Jump Presets */}
                    {showPresets && (
                        <div className="py-2.5 border-b border-border/40 flex items-center gap-1.5 overflow-x-auto">
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
                                <Sparkles className="h-2.5 w-2.5 text-purple-400" /> Presets:
                            </span>
                            <button
                                type="button"
                                onClick={() => applyPreset(3)}
                                className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition-colors shrink-0 cursor-pointer"
                            >
                                +3 Days
                            </button>
                            <button
                                type="button"
                                onClick={() => applyPreset(7)}
                                className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition-colors shrink-0 cursor-pointer"
                            >
                                +1 Week
                            </button>
                            <button
                                type="button"
                                onClick={() => applyPreset(14)}
                                className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition-colors shrink-0 cursor-pointer"
                            >
                                +2 Weeks
                            </button>
                            <button
                                type="button"
                                onClick={() => applyPreset(30)}
                                className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition-colors shrink-0 cursor-pointer"
                            >
                                +1 Month
                            </button>
                        </div>
                    )}

                    {/* Day Names Row */}
                    <div className="grid grid-cols-7 gap-1 pt-3 pb-1 text-center">
                        {DAY_NAMES.map((name) => (
                            <span key={name} className="text-[10px] font-bold text-muted-foreground/80 font-mono">
                                {name}
                            </span>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                        {/* Days from previous month */}
                        {Array.from({ length: firstDayOfWeek }).map((_, i) => {
                            const prevDay = prevMonthDays - firstDayOfWeek + i + 1;
                            return (
                                <div
                                    key={`prev-${i}`}
                                    className="h-8 flex items-center justify-center text-[11px] text-muted-foreground/30 font-mono select-none"
                                >
                                    {prevDay}
                                </div>
                            );
                        })}

                        {/* Current month days */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const disabledDay = isDateDisabled(displayYear, displayMonth, day);
                            const selected = isDateSelected(displayYear, displayMonth, day);
                            const currentDay = isToday(displayYear, displayMonth, day);

                            return (
                                <button
                                    key={`cur-${day}`}
                                    type="button"
                                    disabled={disabledDay}
                                    onClick={() => handleSelectDate(displayYear, displayMonth, day)}
                                    className={`h-8 w-full rounded-xl text-xs font-semibold font-mono flex items-center justify-center transition-all cursor-pointer ${
                                        selected
                                            ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30 scale-105 font-bold'
                                            : disabledDay
                                            ? 'text-muted-foreground/20 cursor-not-allowed line-through'
                                            : currentDay
                                            ? 'border border-purple-400/50 text-purple-300 hover:bg-purple-500/15'
                                            : 'text-foreground hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/40 text-xs">
                        <button
                            type="button"
                            onClick={() => {
                                onChange('');
                                setIsOpen(false);
                            }}
                            className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const today = new Date();
                                const y = today.getFullYear();
                                const m = String(today.getMonth() + 1).padStart(2, '0');
                                const d = String(today.getDate()).padStart(2, '0');
                                const dStr = `${y}-${m}-${d}`;
                                if (!minDate || dStr >= minDate) {
                                    onChange(dStr);
                                    setIsOpen(false);
                                }
                            }}
                            className="text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
