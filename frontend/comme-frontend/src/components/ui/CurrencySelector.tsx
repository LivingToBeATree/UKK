import React from 'react';
import { useCurrency, type SupportedCurrency } from '@/contexts/CurrencyContext';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Check, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CurrencySelectorProps {
    variant?: 'ghost' | 'outline' | 'secondary';
    size?: 'sm' | 'default' | 'icon';
    showLabel?: boolean;
    className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
    variant = 'outline',
    size = 'sm',
    showLabel = true,
    className,
}) => {
    const { currency, setCurrency, config, availableCurrencies, ratesToIdr } = useCurrency();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={variant}
                    size={size}
                    className={cn(
                        'h-8 px-2.5 rounded-xl text-xs font-semibold gap-1.5 cursor-pointer transition-colors border-border/70 hover:border-primary/50',
                        className
                    )}
                    title={`Current display currency: ${config.name} (${config.code})`}
                >
                    <span className="text-sm leading-none">{config.flag}</span>
                    <span className="font-mono font-bold text-[11px]">{config.code}</span>
                    {showLabel && (
                        <span className="text-[10px] text-muted-foreground hidden lg:inline font-mono">
                            {config.symbol}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 shadow-xl border-border/80">
                <div className="px-2 py-1.5 text-[11px] font-bold text-muted-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-primary" /> Display Currency
                    </span>
                    <span className="text-[9px] font-mono uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        Real-time
                    </span>
                </div>
                <DropdownMenuSeparator />

                {availableCurrencies.map((c) => {
                    const isSelected = c.code === currency;
                    const idrRate = ratesToIdr[c.code as SupportedCurrency];
                    return (
                        <DropdownMenuItem
                            key={c.code}
                            onClick={() => setCurrency(c.code)}
                            className={cn(
                                'flex items-center justify-between rounded-xl px-2 py-1.5 text-xs cursor-pointer transition-colors',
                                isSelected ? 'bg-primary/10 font-bold text-primary' : 'hover:bg-muted'
                            )}
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="text-base">{c.flag}</span>
                                <div className="flex flex-col text-left min-w-0">
                                    <span className="leading-tight truncate">
                                        <span className="font-mono font-bold mr-1">{c.code}</span>
                                        <span className="text-muted-foreground text-[11px]">({c.symbol})</span>
                                    </span>
                                    <span className="text-[10px] text-muted-foreground truncate leading-none mt-0.5">
                                        {c.name}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 pl-2">
                                {c.code !== 'IDR' && idrRate && (
                                    <span className="text-[9px] font-mono text-muted-foreground">
                                        ≈{idrRate.toLocaleString()}
                                    </span>
                                )}
                                {isSelected && <Check className="h-4 w-4 text-primary" />}
                            </div>
                        </DropdownMenuItem>
                    );
                })}

                <DropdownMenuSeparator />
                <div className="px-2 py-1 text-[9px] text-muted-foreground leading-tight">
                    Prices convert automatically. Final checkout and escrow are securely settled in IDR.
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
