import React from 'react';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Check } from 'lucide-react';
import { FlagIcon } from '@/components/ui/FlagIcon';
import { CURRENCY_CONFIGS, type SupportedCurrency } from '@/contexts/CurrencyContext';
import { cn } from '@/lib/utils';

interface BaseCurrencySelectProps {
    value: SupportedCurrency;
    onChange: (currency: SupportedCurrency) => void;
    className?: string;
    disabled?: boolean;
    side?: 'top' | 'bottom';
}

export const BaseCurrencySelect: React.FC<BaseCurrencySelectProps> = ({
    value,
    onChange,
    className,
    disabled = false,
    side = 'bottom',
}) => {
    const current = CURRENCY_CONFIGS[value] || CURRENCY_CONFIGS.IDR;
    const currencies = Object.values(CURRENCY_CONFIGS);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={disabled}>
                <button
                    type="button"
                    className={cn(
                        'flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary/80 hover:bg-secondary text-foreground text-xs font-bold transition-colors cursor-pointer border border-border/70 focus:outline-none focus:ring-1 focus:ring-primary/40 select-none shrink-0',
                        className
                    )}
                    title={`Base Pricing Currency: ${current.name} (${current.code})`}
                >
                    <FlagIcon code={current.code} className="w-4 h-3 shrink-0" />
                    <span className="font-mono text-xs">{current.code}</span>
                    <span className="text-[10px] text-muted-foreground font-normal">({current.symbol})</span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground ml-0.5" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="start"
                side={side}
                className="w-56 rounded-2xl p-1 shadow-2xl border-border/80 z-50 bg-popover/95 backdrop-blur-md max-h-64 overflow-y-auto"
            >
                <div className="px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider sticky top-0 bg-popover/95 backdrop-blur-xs z-10 border-b border-border/40 mb-1">
                    Select Base Currency
                </div>
                <div className="space-y-0.5">
                    {currencies.map((c) => {
                        const isSelected = c.code === value;
                        return (
                            <DropdownMenuItem
                                key={c.code}
                                onClick={() => onChange(c.code)}
                                className={cn(
                                    'flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs cursor-pointer transition-colors',
                                    isSelected
                                        ? 'bg-primary/15 font-bold text-primary border border-primary/20'
                                        : 'hover:bg-muted text-foreground'
                                )}
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <FlagIcon code={c.code} className="w-4 h-3 shrink-0" />
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-mono font-bold leading-tight">
                                            {c.code} <span className="font-normal text-muted-foreground">({c.symbol})</span>
                                        </span>
                                        <span className="text-[10px] text-muted-foreground leading-none mt-0.5 truncate">
                                            {c.name}
                                        </span>
                                    </div>
                                </div>
                                {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                            </DropdownMenuItem>
                        );
                    })}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
