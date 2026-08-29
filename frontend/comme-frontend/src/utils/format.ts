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
