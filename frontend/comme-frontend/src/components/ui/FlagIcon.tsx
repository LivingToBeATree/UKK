import React from 'react';
import { cn } from '@/lib/utils';

export interface FlagIconProps extends React.SVGProps<SVGSVGElement> {
    code: 'IDR' | 'USD' | 'EUR' | 'JPY' | 'SGD' | 'GBP' | string;
    className?: string;
}

export const FlagIcon: React.FC<FlagIconProps> = ({ code, className, ...props }) => {
    const c = code.toUpperCase();

    const baseClasses = cn(
        'inline-block shrink-0 rounded-[2px] overflow-hidden border border-black/20 shadow-2xs',
        className
    );

    switch (c) {
        case 'IDR':
        case 'ID':
            // Indonesia: Red top, White bottom
            return (
                <svg viewBox="0 0 640 480" className={baseClasses} aria-label="Indonesia flag" {...props}>
                    <path fill="#e70011" d="M0 0h640v240H0z" />
                    <path fill="#ffffff" d="M0 240h640v240H0z" />
                </svg>
            );

        case 'USD':
        case 'US':
            // United States: Stripes with blue canton
            return (
                <svg viewBox="0 0 640 480" className={baseClasses} aria-label="United States flag" {...props}>
                    <g fillRule="evenodd">
                        <path fill="#bd3d44" d="M0 0h640v480H0z" />
                        <path stroke="#fff" strokeWidth="37" d="M0 55.4h640M0 129.2h640M0 203h640M0 277h640M0 350.8h640M0 424.6h640" />
                        <path fill="#192f5d" d="M0 0h280v258.5H0z" />
                        <g fill="#fff">
                            <circle cx="40" cy="35" r="9" />
                            <circle cx="100" cy="35" r="9" />
                            <circle cx="160" cy="35" r="9" />
                            <circle cx="220" cy="35" r="9" />
                            <circle cx="70" cy="72" r="9" />
                            <circle cx="130" cy="72" r="9" />
                            <circle cx="190" cy="72" r="9" />
                            <circle cx="40" cy="110" r="9" />
                            <circle cx="100" cy="110" r="9" />
                            <circle cx="160" cy="110" r="9" />
                            <circle cx="220" cy="110" r="9" />
                            <circle cx="70" cy="148" r="9" />
                            <circle cx="130" cy="148" r="9" />
                            <circle cx="190" cy="148" r="9" />
                            <circle cx="40" cy="185" r="9" />
                            <circle cx="100" cy="185" r="9" />
                            <circle cx="160" cy="185" r="9" />
                            <circle cx="220" cy="185" r="9" />
                            <circle cx="70" cy="222" r="9" />
                            <circle cx="130" cy="222" r="9" />
                            <circle cx="190" cy="222" r="9" />
                        </g>
                    </g>
                </svg>
            );

        case 'EUR':
        case 'EU':
            // European Union: Blue field with ring of 12 yellow stars
            return (
                <svg viewBox="0 0 640 480" className={baseClasses} aria-label="European Union flag" {...props}>
                    <path fill="#003399" d="M0 0h640v480H0z" />
                    <g fill="#ffcc00">
                        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
                            const rad = (angle * Math.PI) / 180;
                            const cx = 320 + 130 * Math.cos(rad);
                            const cy = 240 + 130 * Math.sin(rad);
                            return <circle key={angle} cx={cx} cy={cy} r="12" />;
                        })}
                    </g>
                </svg>
            );

        case 'JPY':
        case 'JP':
            // Japan: White field with crimson sun
            return (
                <svg viewBox="0 0 640 480" className={baseClasses} aria-label="Japan flag" {...props}>
                    <path fill="#ffffff" d="M0 0h640v480H0z" />
                    <circle cx="320" cy="240" r="144" fill="#bc002d" />
                </svg>
            );

        case 'SGD':
        case 'SG':
            // Singapore: Red top with white crescent and 5 stars, White bottom
            return (
                <svg viewBox="0 0 640 480" className={baseClasses} aria-label="Singapore flag" {...props}>
                    <path fill="#ed2939" d="M0 0h640v240H0z" />
                    <path fill="#ffffff" d="M0 240h640v240H0z" />
                    <g fill="#ffffff">
                        <circle cx="120" cy="120" r="60" />
                        <circle cx="140" cy="120" r="50" fill="#ed2939" />
                        <circle cx="150" cy="85" r="8" fill="#ffffff" />
                        <circle cx="180" cy="105" r="8" fill="#ffffff" />
                        <circle cx="170" cy="140" r="8" fill="#ffffff" />
                        <circle cx="135" cy="140" r="8" fill="#ffffff" />
                        <circle cx="125" cy="105" r="8" fill="#ffffff" />
                    </g>
                </svg>
            );

        case 'GBP':
        case 'GB':
            // United Kingdom: Union Jack
            return (
                <svg viewBox="0 0 640 480" className={baseClasses} aria-label="United Kingdom flag" {...props}>
                    <clipPath id="gb-cp">
                        <path d="M0 0h640v480H0z" />
                    </clipPath>
                    <g clipPath="url(#gb-cp)">
                        <path fill="#012169" d="M0 0h640v480H0z" />
                        <path stroke="#fff" strokeWidth="60" d="m0 0 640 480M640 0 0 480" />
                        <path stroke="#c8102e" strokeWidth="40" d="m0 0 640 480M640 0 0 480" />
                        <path stroke="#fff" strokeWidth="100" d="M320 0v480M0 240h640" />
                        <path stroke="#c8102e" strokeWidth="60" d="M320 0v480M0 240h640" />
                    </g>
                </svg>
            );

        default:
            return (
                <span
                    className={cn(
                        'inline-flex items-center justify-center font-mono font-bold text-[9px] uppercase bg-muted text-muted-foreground border border-border px-1 rounded-[2px]',
                        className
                    )}
                >
                    {code.slice(0, 2)}
                </span>
            );
    }
};
