import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { api } from '@/services/api';

export type SupportedCurrency = 'IDR' | 'USD' | 'EUR' | 'JPY' | 'SGD' | 'GBP';

export interface CurrencyConfig {
    code: SupportedCurrency;
    name: string;
    symbol: string;
    flag: string;
    decimals: number;
}

export const CURRENCY_CONFIGS: Record<SupportedCurrency, CurrencyConfig> = {
    IDR: { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩', decimals: 0 },
    USD: { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', decimals: 2 },
    EUR: { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', decimals: 2 },
    JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', decimals: 0 },
    SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', decimals: 2 },
    GBP: { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', decimals: 2 },
};

const DEFAULT_RATES: Record<SupportedCurrency, number> = {
    IDR: 1,
    USD: 0.000063,
    EUR: 0.000058,
    JPY: 0.0095,
    SGD: 0.000085,
    GBP: 0.000049,
};

interface CurrencyContextType {
    currency: SupportedCurrency;
    setCurrency: (currency: SupportedCurrency) => void;
    rates: Record<SupportedCurrency, number>;
    ratesToIdr: Record<SupportedCurrency, number>;
    convertPrice: (idrAmount: number | string | null | undefined, target?: SupportedCurrency) => number;
    formatPrice: (
        idrAmount: number | string | null | undefined,
        options?: { showApprox?: boolean; target?: SupportedCurrency }
    ) => string;
    isConverting: boolean;
    config: CurrencyConfig;
    availableCurrencies: CurrencyConfig[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'comme_currency_preference';

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currency, setCurrencyState] = useState<SupportedCurrency>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY) as SupportedCurrency | null;
            if (saved && saved in CURRENCY_CONFIGS) {
                return saved;
            }
        } catch {
            // LocalStorage inaccessible
        }
        return 'IDR';
    });

    const [rates, setRates] = useState<Record<SupportedCurrency, number>>(DEFAULT_RATES);

    useEffect(() => {
        let mounted = true;
        const fetchRates = async () => {
            try {
                const res = await api.get('/exchange-rates');
                if (mounted && res.data?.data?.rates) {
                    setRates((prev) => ({
                        ...prev,
                        ...res.data.data.rates,
                        IDR: 1,
                    }));
                }
            } catch {
                // Keep default fallback rates
            }
        };

        fetchRates();
        return () => {
            mounted = false;
        };
    }, []);

    const setCurrency = (c: SupportedCurrency) => {
        setCurrencyState(c);
        try {
            localStorage.setItem(STORAGE_KEY, c);
        } catch {
            // Ignore storage failure
        }
    };

    const ratesToIdr = useMemo(() => {
        const res: Record<SupportedCurrency, number> = {} as Record<SupportedCurrency, number>;
        for (const [code, rate] of Object.entries(rates)) {
            const c = code as SupportedCurrency;
            res[c] = rate > 0 ? Math.round(1 / rate) : 1;
        }
        return res;
    }, [rates]);

    const convertPrice = (
        idrAmount: number | string | null | undefined,
        target?: SupportedCurrency
    ): number => {
        const num = typeof idrAmount === 'string' ? parseFloat(idrAmount) : idrAmount ?? 0;
        if (isNaN(num) || num <= 0) return 0;
        const targetCurrency = target || currency;
        const rate = rates[targetCurrency] ?? 1;
        return num * rate;
    };

    const formatPrice = (
        idrAmount: number | string | null | undefined,
        options?: { showApprox?: boolean; target?: SupportedCurrency }
    ): string => {
        const num = typeof idrAmount === 'string' ? parseFloat(idrAmount) : idrAmount ?? 0;
        if (isNaN(num)) return 'Rp 0';

        const targetCurrency = options?.target || currency;
        const config = CURRENCY_CONFIGS[targetCurrency] || CURRENCY_CONFIGS.IDR;

        if (targetCurrency === 'IDR') {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
            }).format(num);
        }

        const converted = convertPrice(num, targetCurrency);
        const formattedConverted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: targetCurrency,
            minimumFractionDigits: config.decimals,
            maximumFractionDigits: config.decimals,
        }).format(converted);

        if (options?.showApprox) {
            const rawIdr = new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
            }).format(num);
            return `${formattedConverted} (~${rawIdr})`;
        }

        return formattedConverted;
    };

    const value: CurrencyContextType = {
        currency,
        setCurrency,
        rates,
        ratesToIdr,
        convertPrice,
        formatPrice,
        isConverting: currency !== 'IDR',
        config: CURRENCY_CONFIGS[currency],
        availableCurrencies: Object.values(CURRENCY_CONFIGS),
    };

    return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = (): CurrencyContextType => {
    const context = useContext(CurrencyContext);
    if (!context) {
        // Safe fallback for components rendered outside CurrencyProvider
        return {
            currency: 'IDR',
            setCurrency: () => {},
            rates: DEFAULT_RATES,
            ratesToIdr: { IDR: 1, USD: 15873, EUR: 17241, JPY: 105, SGD: 11764, GBP: 20408 },
            convertPrice: (amt) => (typeof amt === 'string' ? parseFloat(amt) : amt ?? 0),
            formatPrice: (amt) => {
                const num = typeof amt === 'string' ? parseFloat(amt) : amt ?? 0;
                return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
            },
            isConverting: false,
            config: CURRENCY_CONFIGS.IDR,
            availableCurrencies: Object.values(CURRENCY_CONFIGS),
        };
    }
    return context;
};
