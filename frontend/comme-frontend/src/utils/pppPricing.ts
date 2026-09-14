import type { SupportedCurrency } from '@/contexts/CurrencyContext';

/**
 * Purchasing Power Parity (PPP) Economic Reference Ratios
 * Benchmark: USD = 1.00
 *
 * Calibrated Purchasing Power Parity matrix for digital creative services:
 * - IDR: Reflects Indonesian purchasing power / median disposable income (~55% of raw FX, giving ~45% local affordability discount)
 * - JPY: Reflects Japanese domestic market tier (~78% of raw FX)
 * - EUR / GBP / SGD: High purchasing power tiers
 */
export const PPP_RATIOS: Record<SupportedCurrency, number> = {
    USD: 1.0,
    EUR: 0.95,
    GBP: 0.85,
    SGD: 1.15,
    JPY: 120.0,
    IDR: 8800.0,
};

export interface RegionalPppRecommendation {
    currency: SupportedCurrency;
    rawFxPrice: number;
    recommendedPrice: number;
    discountPercentage: number; // Negative = discount for buyer (e.g. -45%), Positive = market scale (e.g. +35%)
    formattedRaw: string;
    formattedRecommended: string;
    badgeText: string;
    badgeColor: string; // Tailwind class
}

/**
 * Round price using standard psychological price points
 */
export function roundToRegionalPsychologicalPrice(amount: number, currency: SupportedCurrency): number {
    if (!amount || amount <= 0) return 0;

    switch (currency) {
        case 'IDR': {
            if (amount >= 100000) {
                // Round to nearest 5,000
                return Math.round(amount / 5000) * 5000;
            } else if (amount >= 20000) {
                // Round to nearest 2,500
                return Math.round(amount / 2500) * 2500;
            } else {
                return Math.round(amount / 1000) * 1000;
            }
        }
        case 'JPY': {
            // Round to nearest 100
            return Math.max(100, Math.round(amount / 100) * 100);
        }
        case 'USD':
        case 'EUR':
        case 'GBP':
        case 'SGD': {
            if (amount >= 20) {
                // Clean integer or .50 price points (e.g. $25.00, $35.00, $49.50)
                return Math.round(amount * 2) / 2;
            } else if (amount >= 5) {
                return Math.round(amount * 2) / 2;
            } else {
                return Number(amount.toFixed(2));
            }
        }
        default:
            return Number(amount.toFixed(2));
    }
}

/**
 * Calculate Recommended Regional Price using Purchasing Power Parity (PPP)
 */
export function calculatePppRegionalPrice(
    baseAmount: number,
    baseCurrency: SupportedCurrency,
    targetCurrency: SupportedCurrency
): number {
    if (!baseAmount || baseAmount <= 0) return 0;
    if (baseCurrency === targetCurrency) return baseAmount;

    const baseRatio = PPP_RATIOS[baseCurrency] || 1.0;
    const targetRatio = PPP_RATIOS[targetCurrency] || 1.0;

    // Convert to USD benchmark, then scale to target region's purchasing power
    const unrounded = baseAmount * (targetRatio / baseRatio);

    return roundToRegionalPsychologicalPrice(unrounded, targetCurrency);
}

/**
 * Generate full Regional Pricing Matrix for a given base price and currency using PPP
 */
export function generatePppMatrix(
    baseAmount: number,
    baseCurrency: SupportedCurrency,
    liveConvertBetween: (amount: number, from: SupportedCurrency, to: SupportedCurrency) => number
): Record<SupportedCurrency, RegionalPppRecommendation> {
    const allCurrencies: SupportedCurrency[] = ['IDR', 'USD', 'EUR', 'JPY', 'SGD', 'GBP'];
    const matrix: Partial<Record<SupportedCurrency, RegionalPppRecommendation>> = {};

    for (const cur of allCurrencies) {
        if (cur === baseCurrency) {
            matrix[cur] = {
                currency: cur,
                rawFxPrice: baseAmount,
                recommendedPrice: baseAmount,
                discountPercentage: 0,
                formattedRaw: formatCurrencyString(baseAmount, cur),
                formattedRecommended: formatCurrencyString(baseAmount, cur),
                badgeText: 'Base Reference',
                badgeColor: 'text-primary bg-primary/10 border-primary/20',
            };
            continue;
        }

        const rawFx = liveConvertBetween(baseAmount, baseCurrency, cur);
        const ppp = calculatePppRegionalPrice(baseAmount, baseCurrency, cur);

        let deltaPercent = 0;
        if (rawFx > 0) {
            deltaPercent = Math.round(((ppp - rawFx) / rawFx) * 100);
        }

        let badgeText = 'PPP Regional';
        let badgeColor = 'text-sky-400 bg-sky-500/10 border-sky-500/20';

        if (deltaPercent <= -10) {
            badgeText = `${deltaPercent}% Regional Discount`;
            badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        } else if (deltaPercent >= 10) {
            badgeText = `+${deltaPercent}% Fair Market Rate`;
            badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        } else {
            badgeText = 'Parity Aligned';
            badgeColor = 'text-sky-400 bg-sky-500/10 border-sky-500/20';
        }

        matrix[cur] = {
            currency: cur,
            rawFxPrice: rawFx,
            recommendedPrice: ppp,
            discountPercentage: deltaPercent,
            formattedRaw: formatCurrencyString(rawFx, cur),
            formattedRecommended: formatCurrencyString(ppp, cur),
            badgeText,
            badgeColor,
        };
    }

    return matrix as Record<SupportedCurrency, RegionalPppRecommendation>;
}

function formatCurrencyString(val: number, cur: SupportedCurrency): string {
    const symbolMap: Record<SupportedCurrency, string> = {
        IDR: 'Rp ',
        USD: '$',
        EUR: '€',
        JPY: '¥',
        SGD: 'S$',
        GBP: '£',
    };

    const sym = symbolMap[cur] || '';
    if (cur === 'IDR' || cur === 'JPY') {
        return `${sym}${Math.round(val).toLocaleString()}`;
    }
    return `${sym}${Number(val).toFixed(2)}`;
}

export function formatRegionalCurrency(val: number, cur: SupportedCurrency): string {
    const num = isNaN(val) ? 0 : val;
    switch (cur) {
        case 'IDR':
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
            }).format(num);
        case 'JPY':
            return new Intl.NumberFormat('ja-JP', {
                style: 'currency',
                currency: 'JPY',
                maximumFractionDigits: 0,
            }).format(num);
        default:
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: cur,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(num);
    }
}

export interface OptionPriceBreakdown {
    effectivePrice: number;
    formattedPrice: string;
    rawPrice: number;
    formattedRawPrice: string;
    hasRegionalPrice: boolean;
    hasRegionalDiscount: boolean;
    discountPercent: number;
    badgeText: string;
    badgeColor: string;
    pricingMode: 'ppp' | 'auto_fx' | 'custom';
}

/**
 * Resolve display price and regional breakdown for a commission option in the active viewer's currency
 */
export function getOptionPriceBreakdown(
    option: {
        base_price?: number;
        price?: number;
        base_currency?: string;
        pricing_mode?: 'ppp' | 'auto_fx' | 'custom';
        regional_prices?: Record<string, number> | null;
    },
    viewerCurrency: SupportedCurrency,
    convertPrice: (idrAmount: number, target?: SupportedCurrency) => number
): OptionPriceBreakdown {
    const mode = (option.pricing_mode as 'ppp' | 'auto_fx' | 'custom') || 'ppp';
    const isPpp = mode === 'ppp';

    const idrBase = Number(option.base_price ?? option.price ?? 0);
    const baseCur = ((option.base_currency as SupportedCurrency) || 'IDR') as SupportedCurrency;

    // 1. Raw FX reference price for this option in viewerCurrency
    const rawPrice = viewerCurrency === 'IDR'
        ? idrBase
        : convertPrice(idrBase, viewerCurrency);

    // 2. Check if there's an explicit regional price in regional_prices
    const hasExplicit = Boolean(
        option.regional_prices &&
        option.regional_prices[viewerCurrency] !== undefined &&
        option.regional_prices[viewerCurrency] !== null
    );

    let effectivePrice = rawPrice;
    let hasRegionalPrice = false;

    if (mode !== 'auto_fx') {
        if (hasExplicit) {
            effectivePrice = Number(option.regional_prices![viewerCurrency]);
            hasRegionalPrice = true;
        } else if (isPpp && baseCur !== viewerCurrency) {
            // Compute recommended PPP price dynamically if not pre-cached
            const baseAmount = baseCur === 'IDR'
                ? idrBase
                : (option.regional_prices?.[baseCur] ?? (convertPrice(idrBase, baseCur) || 0));
            effectivePrice = calculatePppRegionalPrice(baseAmount, baseCur, viewerCurrency);
            hasRegionalPrice = true;
        }
    }

    // 3. Compute discount percentage
    let discountPercent = 0;
    if (rawPrice > 0 && effectivePrice > 0 && Math.abs(effectivePrice - rawPrice) > 0.01) {
        discountPercent = Math.round(((effectivePrice - rawPrice) / rawPrice) * 100);
    }

    const hasRegionalDiscount = hasRegionalPrice && discountPercent <= -5;

    // 4. Badge formatting
    let badgeText = 'PPP Regional Price';
    let badgeColor = 'text-primary bg-primary/10 border-primary/20';

    if (hasRegionalDiscount) {
        badgeText = mode === 'custom'
            ? `${discountPercent}% Regional Rate`
            : `${discountPercent}% PPP Regional Price`;
        badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    } else if (hasRegionalPrice && discountPercent >= 10) {
        badgeText = mode === 'custom'
            ? `+${discountPercent}% Regional Rate`
            : `+${discountPercent}% Fair Market Rate`;
        badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    } else if (hasRegionalPrice) {
        badgeText = mode === 'custom' ? 'Artist Regional Rate' : 'PPP Regional Price';
        badgeColor = 'text-sky-400 bg-sky-500/10 border-sky-500/20';
    }

    return {
        effectivePrice,
        formattedPrice: formatRegionalCurrency(effectivePrice, viewerCurrency),
        rawPrice,
        formattedRawPrice: formatRegionalCurrency(rawPrice, viewerCurrency),
        hasRegionalPrice,
        hasRegionalDiscount,
        discountPercent,
        badgeText,
        badgeColor,
        pricingMode: mode,
    };
}

export interface AddonPriceBreakdown {
    effectivePrice: number;
    formattedPrice: string;
    rawPrice: number;
    formattedRawPrice: string;
    hasRegionalPrice: boolean;
    hasRegionalDiscount: boolean;
    discountPercent: number;
}

/**
 * Resolve display price and regional breakdown for an addon in the active viewer's currency
 */
export function getAddonPriceBreakdown(
    addon: {
        additional_price?: number;
        base_currency?: string;
        regional_prices?: Record<string, number> | null;
    },
    option: {
        base_currency?: string;
        pricing_mode?: 'ppp' | 'auto_fx' | 'custom';
        regional_prices?: Record<string, number> | null;
    } | null | undefined,
    viewerCurrency: SupportedCurrency,
    convertPrice: (idrAmount: number, target?: SupportedCurrency) => number
): AddonPriceBreakdown {
    const rawMode = option?.pricing_mode || 'ppp';
    const isPpp = rawMode === 'ppp';
    const isAutoFx = rawMode === 'auto_fx';

    const idrStoredPrice = Number(addon.additional_price || 0);
    const addonBaseCur = ((addon.base_currency || option?.base_currency || 'IDR') as SupportedCurrency);

    // Raw FX price in viewer currency
    const rawPrice = viewerCurrency === 'IDR'
        ? idrStoredPrice
        : convertPrice(idrStoredPrice, viewerCurrency);

    // 1. Check if there's an explicit regional price on the addon
    const hasExplicit = Boolean(
        addon.regional_prices &&
        addon.regional_prices[viewerCurrency] !== undefined &&
        addon.regional_prices[viewerCurrency] !== null
    );

    let effectivePrice = rawPrice;
    let hasRegionalPrice = false;

    if (!isAutoFx) {
        if (hasExplicit) {
            effectivePrice = Number(addon.regional_prices![viewerCurrency]);
            hasRegionalPrice = true;
        } else if (isPpp && addonBaseCur !== viewerCurrency) {
            // Calculate PPP regional price for addon dynamically
            const baseAmount = addonBaseCur === 'IDR'
                ? idrStoredPrice
                : (addon.regional_prices?.[addonBaseCur] ?? (convertPrice(idrStoredPrice, addonBaseCur) || 0));
            effectivePrice = calculatePppRegionalPrice(baseAmount, addonBaseCur, viewerCurrency);
            hasRegionalPrice = true;
        }
    }

    let discountPercent = 0;
    if (rawPrice > 0 && effectivePrice > 0 && Math.abs(effectivePrice - rawPrice) > 0.01) {
        discountPercent = Math.round(((effectivePrice - rawPrice) / rawPrice) * 100);
    }

    const hasRegionalDiscount = hasRegionalPrice && discountPercent <= -5;

    return {
        effectivePrice,
        formattedPrice: formatRegionalCurrency(effectivePrice, viewerCurrency),
        rawPrice,
        formattedRawPrice: formatRegionalCurrency(rawPrice, viewerCurrency),
        hasRegionalPrice,
        hasRegionalDiscount,
        discountPercent,
    };
}
