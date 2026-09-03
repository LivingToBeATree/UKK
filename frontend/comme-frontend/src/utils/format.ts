/**
 * Formats a numeric price into standard Indonesian Rupiah (IDR).
 * Example: 750000 -> "Rp 750.000"
 */
export const formatPrice = (value: number | string | undefined | null): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value ?? 0;
    if (isNaN(num)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(num);
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

