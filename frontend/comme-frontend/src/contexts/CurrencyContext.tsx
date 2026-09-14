import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { api } from '@/services/api';

export type SupportedCurrency = 'IDR' | 'USD' | 'EUR' | 'JPY' | 'SGD' | 'GBP';

export interface CurrencyConfig {
    code: SupportedCurrency;
    name: string;
    symbol: string;
    decimals: number;
}

export const CURRENCY_CONFIGS: Record<SupportedCurrency, CurrencyConfig> = {
    IDR: { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', decimals: 0 },
    USD: { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
    EUR: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
    JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0 },
    SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimals: 2 },
    GBP: { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2 },
};

const DEFAULT_RATES: Record<SupportedCurrency, number> = {
    IDR: 1,
    USD: 0.000063,
    EUR: 0.000058,
    JPY: 0.0095,
    SGD: 0.000085,
    GBP: 0.000049,
};

export interface UserLocation {
    ip: string;
    country_code: string;
    country_name: string;
    billing_currency: SupportedCurrency;
    is_simulated?: boolean;
}

interface CurrencyContextType {
    currency: SupportedCurrency;
    setCurrency: (currency: SupportedCurrency) => void;
    detectedRegion: UserLocation | null;
    billingCurrency: SupportedCurrency;
    rates: Record<SupportedCurrency, number>;
    ratesToIdr: Record<SupportedCurrency, number>;
    convertPrice: (idrAmount: number | string | null | undefined, target?: SupportedCurrency) => number;
    convertBetween: (
        amount: number | string | null | undefined,
        from: SupportedCurrency,
        to: SupportedCurrency
    ) => number;
    formatPrice: (
        idrAmount: number | string | null | undefined,
        options?: { showApprox?: boolean; target?: SupportedCurrency }
    ) => string;
    isConverting: boolean;
    config: CurrencyConfig;
    availableCurrencies: CurrencyConfig[];
    resetToDetectedRegion: () => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [detectedRegion, setDetectedRegion] = useState<UserLocation | null>(null);
    const [currency, setCurrencyState] = useState<SupportedCurrency>(() => {
        try {
            localStorage.removeItem('comme_currency_preference');
            localStorage.removeItem('comme_user_explicit_currency');
        } catch {
            // LocalStorage inaccessible
        }
        return 'IDR';
    });

    const [rates, setRates] = useState<Record<SupportedCurrency, number>>(DEFAULT_RATES);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).__COMME_CURRENCY__ = currency;
            (window as any).__COMME_EXCHANGE_RATES__ = rates;
        }
    }, [currency, rates]);

    useEffect(() => {
        let mounted = true;
        const fetchRates = async () => {
            try {
                const res = await api.get('/exchange-rates');
                if (mounted && res.data?.data) {
                    if (res.data.data.rates) {
                        const newRates = {
                            ...DEFAULT_RATES,
                            ...res.data.data.rates,
                            IDR: 1,
                        };
                        setRates(newRates);
                        if (typeof window !== 'undefined') {
                            (window as any).__COMME_EXCHANGE_RATES__ = newRates;
                        }
                    }
                    if (res.data.data.user_location) {
                        const loc: UserLocation = res.data.data.user_location;
                        setDetectedRegion(loc);

                        // Strictly apply detected billing currency from user's verified IP location
                        if (loc.billing_currency && loc.billing_currency in CURRENCY_CONFIGS) {
                            setCurrencyState(loc.billing_currency);
                        }
                    }
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

    useEffect(() => {
        try {
            localStorage.removeItem('comme_currency_preference');
            localStorage.removeItem('comme_user_explicit_currency');
        } catch {
            // LocalStorage inaccessible
        }
    }, []);

    const setCurrency = (_c: SupportedCurrency) => {
        // Strictly IP-locked: currency is always driven automatically by verified network location
        const target = detectedRegion?.billing_currency || 'IDR';
        setCurrencyState(target);
        if (typeof window !== 'undefined') {
            (window as any).__COMME_CURRENCY__ = target;
            window.dispatchEvent(new CustomEvent('comme-currency-change', { detail: target }));
        }
    };

    const resetToDetectedRegion = () => {
        const target = detectedRegion?.billing_currency || 'IDR';
        setCurrency(target);
    };

    const ratesToIdr = useMemo(() => {
        const res: Record<SupportedCurrency, number> = {} as Record<SupportedCurrency, number>;
        for (const [code, rate] of Object.entries(rates)) {
            const c = code as SupportedCurrency;
            res[c] = rate > 0 ? Math.round(1 / rate) : 1;
        }
        return res;
    }, [rates]);

    const convertBetween = (
        amount: number | string | null | undefined,
        from: SupportedCurrency,
        to: SupportedCurrency
    ): number => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount ?? 0;
        if (isNaN(num) || num <= 0) return 0;
        if (from === to) return num;

        // 1. Convert source currency amount to IDR
        let idrAmount: number;
        if (from === 'IDR') {
            idrAmount = num;
        } else {
            const toIdrMultiplier = ratesToIdr[from] || (rates[from] > 0 ? 1 / rates[from] : 1);
            idrAmount = num * toIdrMultiplier;
        }

        // 2. Convert IDR amount to target currency
        if (to === 'IDR') {
            return idrAmount;
        }
        const targetRate = rates[to] ?? 1;
        return idrAmount * targetRate;
    };

    const convertPrice = (
        idrAmount: number | string | null | undefined,
        target?: SupportedCurrency
    ): number => {
        return convertBetween(idrAmount, 'IDR', target || currency);
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

    const billingCurrency: SupportedCurrency = detectedRegion?.billing_currency || 'IDR';

    const value: CurrencyContextType = {
        currency,
        setCurrency,
        detectedRegion,
        billingCurrency,
        rates,
        ratesToIdr,
        convertPrice,
        convertBetween,
        formatPrice,
        isConverting: currency !== 'IDR',
        config: CURRENCY_CONFIGS[currency],
        availableCurrencies: Object.values(CURRENCY_CONFIGS),
        resetToDetectedRegion,
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
            detectedRegion: null,
            billingCurrency: 'IDR',
            rates: DEFAULT_RATES,
            ratesToIdr: { IDR: 1, USD: 15873, EUR: 17241, JPY: 105, SGD: 11764, GBP: 20408 },
            convertPrice: (amt) => (typeof amt === 'string' ? parseFloat(amt) : amt ?? 0),
            convertBetween: (amt, from, to) => {
                const num = typeof amt === 'string' ? parseFloat(amt) : amt ?? 0;
                if (from === to) return num;
                const fallbackRates: Record<SupportedCurrency, number> = { IDR: 1, USD: 0.000063, EUR: 0.000058, JPY: 0.0095, SGD: 0.000085, GBP: 0.000049 };
                const fallbackToIdr: Record<SupportedCurrency, number> = { IDR: 1, USD: 15873, EUR: 17241, JPY: 105, SGD: 11764, GBP: 20408 };
                const idr = from === 'IDR' ? num : num * fallbackToIdr[from];
                return to === 'IDR' ? idr : idr * fallbackRates[to];
            },
            formatPrice: (amt) => {
                const num = typeof amt === 'string' ? parseFloat(amt) : amt ?? 0;
                return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
            },
            isConverting: false,
            config: CURRENCY_CONFIGS.IDR,
            availableCurrencies: Object.values(CURRENCY_CONFIGS),
            resetToDetectedRegion: () => {},
        };
    }
    return context;
};
