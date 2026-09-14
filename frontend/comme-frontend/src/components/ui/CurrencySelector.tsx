import React, { useState } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { FlagIcon } from '@/components/ui/FlagIcon';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface CurrencySelectorProps {
    variant?: 'ghost' | 'outline' | 'secondary';
    size?: 'sm' | 'default' | 'icon';
    showLabel?: boolean;
    className?: string;
    mode?: 'default' | 'sidebar';
    collapsed?: boolean;
}

/**
 * CurrencySelector: A static, automatic region & currency indicator.
 * Currency and country are strictly detected from the client's verified IP location.
 * Uses motion and AnimatePresence to smoothly animate alongside SidebarRail collapse/expand.
 */
export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
    showLabel = true,
    className,
    mode = 'default',
    collapsed = false,
}) => {
    const { currency, config, detectedRegion, billingCurrency } = useCurrency();
    const [showTooltip, setShowTooltip] = useState(false);

    // Active display currency strictly follows detected location
    const activeCurrency = detectedRegion?.billing_currency || billingCurrency || currency || 'IDR';
    const countryName = detectedRegion?.country_name || 'Indonesia';

    // Sidebar navigation mode
    if (mode === 'sidebar') {
        return (
            <div className="w-full relative">
                <div
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    className={cn(
                        'w-full h-11 flex items-center rounded-xl pl-2 pr-2.5 gap-3 transition-colors duration-150 select-none overflow-hidden text-muted-foreground hover:text-foreground hover:bg-secondary/60',
                        className
                    )}
                    aria-label={`Region: ${countryName} • Currency: ${activeCurrency}`}
                >
                    {/* Flag Icon Container: aligned with NavItem icon box */}
                    <div className="w-6 h-6 flex items-center justify-center shrink-0 relative">
                        <FlagIcon
                            code={activeCurrency}
                            className="w-5 h-3.5 shrink-0 shadow-2xs rounded-xs"
                        />
                    </div>

                    {/* Animated Label + IP Badge */}
                    <AnimatePresence initial={false}>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -6 }}
                                transition={{ duration: 0.15 }}
                                className="flex items-center justify-between flex-1 min-w-0 pr-1 overflow-hidden"
                            >
                                <div className="flex flex-col text-left min-w-0">
                                    <span className="text-xs font-semibold truncate text-foreground flex items-center gap-1">
                                        <span className="font-mono font-bold">{activeCurrency}</span>
                                        <span className="text-muted-foreground font-normal">({config.symbol})</span>
                                    </span>
                                    <span className="text-[10px] text-muted-foreground truncate leading-none mt-0.5">
                                        {countryName}
                                    </span>
                                </div>
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shrink-0">
                                    IP
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Animated Collapsed Floating Tooltip Pill */}
                <AnimatePresence>
                    {collapsed && showTooltip && (
                        <motion.div
                            initial={{ opacity: 0, x: -8, scale: 0.94 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -6, scale: 0.94 }}
                            transition={{ type: 'spring', damping: 22, stiffness: 420 }}
                            className="absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 z-50 px-3 py-1.5 text-xs font-semibold text-white bg-zinc-900 border border-zinc-700/80 rounded-lg shadow-2xl whitespace-nowrap pointer-events-none select-none flex items-center gap-1.5"
                        >
                            <span>{countryName} ({activeCurrency})</span>
                            <span className="px-1 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400">
                                IP
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // Default mode: compact pill/badge (Headers, Store, Mobile)
    return (
        <div
            className={cn(
                'h-8 px-2.5 rounded-xl text-xs font-semibold gap-1.5 flex items-center select-none bg-secondary/35 border border-border/60 text-muted-foreground',
                className
            )}
            title={`Region: ${countryName} (${activeCurrency}) [IP Verified]`}
            aria-label={`Region: ${countryName} (${activeCurrency})`}
        >
            <FlagIcon code={activeCurrency} className="w-4 h-3 shrink-0 shadow-2xs rounded-xs" />
            <span className="font-mono font-bold text-[11px] text-foreground">{activeCurrency}</span>
            {showLabel && (
                <span className="text-[10px] text-muted-foreground hidden lg:inline font-mono">
                    ({config.symbol})
                </span>
            )}
        </div>
    );
};
