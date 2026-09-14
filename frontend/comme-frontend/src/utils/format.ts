const FALLBACK_EXCHANGE_RATES: Record<string, number> = {
    IDR: 1,
    USD: 0.000063,
    EUR: 0.000058,
    JPY: 0.0095,
    SGD: 0.000085,
    GBP: 0.000049,
};

/**
 * Formats a numeric price into localized currency based on user preference (defaults to IDR).
 * Example: 750000 -> "Rp 750.000" or "$47.25" when USD is active.
 */
export const formatPrice = (value: number | string | undefined | null, forcedCurrency?: string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value ?? 0;
    if (isNaN(num)) return 'Rp 0';

    let currencyCode = forcedCurrency;
    if (!currencyCode && typeof window !== 'undefined') {
        try {
            currencyCode = (window as any).__COMME_CURRENCY__ || 'IDR';
        } catch {
            currencyCode = 'IDR';
        }
    }

    if (!currencyCode || currencyCode === 'IDR') {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(num);
    }

    const liveRates = typeof window !== 'undefined' ? (window as any).__COMME_EXCHANGE_RATES__ : null;
    const rate = (liveRates && liveRates[currencyCode]) ?? (FALLBACK_EXCHANGE_RATES[currencyCode] ?? 1);
    const converted = num * rate;
    const decimals = currencyCode === 'JPY' ? 0 : 2;

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(converted);
};

export const formatCurrencySafe = formatPrice;
export const formatCurrency = formatPrice;

/**
 * Safely format date strings into human-readable format without throwing RangeError on invalid/missing dates.
 */
export const formatDateSafe = (
    dateStr?: string | null,
    options?: Intl.DateTimeFormatOptions,
    fallback: string = 'Flexible'
): string => {
    if (!dateStr) return fallback;
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return fallback;
        return d.toLocaleDateString('en-US', options || { dateStyle: 'medium' });
    } catch {
        return fallback;
    }
};

/**
 * Safely format date-time strings into human-readable format with time included.
 */
export const formatDateTimeSafe = (
    dateStr?: string | null,
    fallback: string = 'Flexible'
): string => {
    if (!dateStr) return fallback;
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return fallback;
        return d.toLocaleDateString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
        return fallback;
    }
};

