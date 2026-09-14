import React, { useRef, useEffect, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CustomNumberInputProps {
    value: number | string;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
    prefix?: React.ReactNode;
    className?: string;
    inputClassName?: string;
    disabled?: boolean;
    required?: boolean;
    autoFocus?: boolean;
    id?: string;
}

export const CustomNumberInput: React.FC<CustomNumberInputProps> = ({
    value,
    onChange,
    min = 0,
    max,
    step = 1,
    placeholder,
    prefix,
    className,
    inputClassName,
    disabled = false,
    required = false,
    autoFocus = false,
    id,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const holdIntervalRef = useRef<number | null>(null);
    const holdTimeoutRef = useRef<number | null>(null);

    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value ?? 0;

    const updateValue = useCallback(
        (delta: number) => {
            if (disabled) return;
            const current = typeof value === 'string' ? parseFloat(value) || 0 : value ?? 0;
            let next = Math.round((current + delta) * 1000) / 1000;
            if (min !== undefined && next < min) next = min;
            if (max !== undefined && next > max) next = max;
            onChange(next);
        },
        [value, min, max, onChange, disabled]
    );

    const stopHold = useCallback(() => {
        if (holdTimeoutRef.current) {
            clearTimeout(holdTimeoutRef.current);
            holdTimeoutRef.current = null;
        }
        if (holdIntervalRef.current) {
            clearInterval(holdIntervalRef.current);
            holdIntervalRef.current = null;
        }
    }, []);

    const startHold = useCallback(
        (delta: number) => {
            if (disabled) return;
            updateValue(delta);
            stopHold();
            holdTimeoutRef.current = window.setTimeout(() => {
                holdIntervalRef.current = window.setInterval(() => {
                    updateValue(delta);
                }, 60);
            }, 300);
        },
        [updateValue, stopHold, disabled]
    );

    useEffect(() => {
        return () => {
            stopHold();
        };
    }, [stopHold]);

    return (
        <div
            className={cn(
                'relative flex items-center rounded-xl border border-border/80 bg-card transition-all duration-150',
                'focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20',
                disabled && 'opacity-60 pointer-events-none',
                className
            )}
        >
            {prefix && (
                <div className="shrink-0 flex items-center pl-2.5 pr-1 border-r border-border/60">
                    {prefix}
                </div>
            )}

            {/* Input Element */}
            {(() => {
                const displayVal =
                    typeof value === 'number' && !Number.isInteger(value)
                        ? parseFloat(value.toFixed(2))
                        : value;
                return (
                    <input
                        ref={inputRef}
                        id={id}
                        type="number"
                        value={displayVal === 0 && placeholder ? '' : displayVal}
                        onChange={(e) => {
                            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            onChange(isNaN(val) ? 0 : val);
                        }}
                        min={min}
                        max={max}
                        step="any"
                        placeholder={placeholder}
                        disabled={disabled}
                        required={required}
                        autoFocus={autoFocus}
                        className={cn(
                            'w-full h-9 bg-transparent px-3 py-1.5 text-xs font-mono font-bold text-foreground placeholder:text-muted-foreground/60',
                            'focus:outline-none pr-7',
                            inputClassName
                        )}
                    />
                );
            })()}

            {/* Custom Sleek Dark-Mode Arrows */}
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center border-l border-border/40 pl-0.5">
                <button
                    type="button"
                    tabIndex={-1}
                    onMouseDown={() => startHold(step)}
                    onMouseUp={stopHold}
                    onMouseLeave={stopHold}
                    onTouchStart={() => startHold(step)}
                    onTouchEnd={stopHold}
                    disabled={disabled || (max !== undefined && numValue >= max)}
                    className="h-3.5 w-4.5 flex items-center justify-center rounded-xs text-muted-foreground hover:text-primary hover:bg-primary/10 active:scale-90 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                    title={`Increase by ${step}`}
                    aria-label="Increase number"
                >
                    <ChevronUp className="h-3 w-3 stroke-[2.5]" />
                </button>
                <button
                    type="button"
                    tabIndex={-1}
                    onMouseDown={() => startHold(-step)}
                    onMouseUp={stopHold}
                    onMouseLeave={stopHold}
                    onTouchStart={() => startHold(-step)}
                    onTouchEnd={stopHold}
                    disabled={disabled || (min !== undefined && numValue <= min)}
                    className="h-3.5 w-4.5 flex items-center justify-center rounded-xs text-muted-foreground hover:text-primary hover:bg-primary/10 active:scale-90 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                    title={`Decrease by ${step}`}
                    aria-label="Decrease number"
                >
                    <ChevronDown className="h-3 w-3 stroke-[2.5]" />
                </button>
            </div>
        </div>
    );
};
